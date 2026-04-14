package com.mewz.blogjava.auth;

import com.mewz.blogjava.article.ArticleEntity;
import com.mewz.blogjava.article.ArticleRepository;
import com.mewz.blogjava.article.ArticleStatus;
import com.mewz.blogjava.common.ApiException;
import com.mewz.blogjava.common.JsonHelper;
import com.mewz.blogjava.security.JwtService;
import com.mewz.blogjava.security.JwtUserPrincipal;
import com.mewz.blogjava.user.UserAccount;
import com.mewz.blogjava.user.UserRepository;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

  private static final SecureRandom RANDOM = new SecureRandom();

  private final UserRepository userRepository;
  private final ArticleRepository articleRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final StringRedisTemplate redisTemplate;
  private final MailService mailService;
  private final JsonHelper jsonHelper;

  @Value("${app.admin.email:admin@example.com}")
  private String adminEmail;

  public AuthResponse login(LoginRequest request) {
    String account = request.getUsername().trim().toLowerCase(Locale.ROOT);
    UserAccount user = userRepository.findByEmail(account)
        .or(() -> userRepository.findByName(request.getUsername().trim()))
        .orElseThrow(() -> new ApiException(401, "Invalid username or password"));

    if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
      throw new ApiException(401, "Invalid username or password");
    }
    return buildAuthResponse(user);
  }

  public void logout(String token) {
    if (token == null || token.isBlank()) {
      return;
    }
    Duration ttl = jwtService.getRemainingTtl(token);
    redisTemplate.opsForValue().set("auth:blacklist:" + token, "1", ttl);
  }

  public UserDto getCurrentUser() {
    return toUserDto(getAuthenticatedUser());
  }

  @Transactional
  public UserDto updateCurrentUser(UserUpdateRequest request) {
    UserAccount user = getAuthenticatedUser();
    if (request.getName() != null && !request.getName().isBlank()) {
      String normalized = request.getName().trim();
      userRepository.findByName(normalized)
          .filter(existing -> !existing.getId().equals(user.getId()))
          .ifPresent(existing -> {
            throw new ApiException(400, "Display name already exists");
          });
      user.setName(normalized);
    }
    if (request.getAvatar() != null && !request.getAvatar().isBlank()) {
      user.setAvatar(request.getAvatar());
    }
    if (request.getBio() != null) {
      user.setBio(request.getBio());
    }
    if (request.getSocials() != null) {
      user.setSocialsJson(jsonHelper.toJson(request.getSocials()));
    }
    return toUserDto(userRepository.save(user));
  }

  public void sendRegisterCode(VerificationCodeRequest request) {
    if (userRepository.findByEmail(request.getEmail().trim().toLowerCase(Locale.ROOT)).isPresent()) {
      throw new ApiException(400, "Email already registered");
    }
    sendCode("register", request.getEmail(), "Blog registration verification code");
  }

  public void sendPasswordResetCode(VerificationCodeRequest request) {
    userRepository.findByEmail(request.getEmail().trim().toLowerCase(Locale.ROOT))
        .orElseThrow(() -> new ApiException(404, "Email is not registered"));
    sendCode("password", request.getEmail(), "Blog password reset verification code");
  }

  @Transactional
  public AuthResponse register(RegisterRequest request) {
    String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
    if (userRepository.findByEmail(email).isPresent()) {
      throw new ApiException(400, "Email already registered");
    }
    validateCode("register", email, request.getCode());

    UserAccount user = new UserAccount();
    user.setEmail(email);
    user.setName(generateUniqueName(email));
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    user.setAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=" + sanitizeSeed(user.getName()));
    user.setBio("欢迎来到博客");
    SocialLinks socials = new SocialLinks();
    socials.setEmail(email);
    user.setSocialsJson(jsonHelper.toJson(socials));
    user.setRoles("user");
    userRepository.save(user);

    redisTemplate.delete(codeKey("register", email));
    return buildAuthResponse(user);
  }

  @Transactional
  public void resetPassword(ResetPasswordRequest request) {
    String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
    UserAccount user = userRepository.findByEmail(email)
        .orElseThrow(() -> new ApiException(404, "Email is not registered"));
    validateCode("password", email, request.getCode());
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    userRepository.save(user);
    redisTemplate.delete(codeKey("password", email));
  }

  public UserDto getBloggerProfile() {
    UserAccount admin = userRepository.findByEmail(adminEmail)
        .orElseThrow(() -> new ApiException(404, "Admin not found"));
    return toUserDto(admin);
  }

  public UserAccount getAuthenticatedUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !(authentication.getPrincipal() instanceof JwtUserPrincipal principal)) {
      throw new ApiException(401, "Unauthorized");
    }
    return userRepository.findById(principal.getId())
        .orElseThrow(() -> new ApiException(401, "Unauthorized"));
  }

  public UserDto toUserDto(UserAccount user) {
    List<ArticleEntity> articles = articleRepository.findAll().stream()
        .filter(article -> article.getAuthor().getId().equals(user.getId()) && article.getStatus() == ArticleStatus.APPROVED)
        .toList();
    Set<String> tags = new LinkedHashSet<>();
    Set<String> categories = new LinkedHashSet<>();
    articles.forEach(article -> {
      tags.addAll(article.getTags());
      categories.add(article.getCategory());
    });

    SocialLinks socials = jsonHelper.fromJson(user.getSocialsJson(), SocialLinks.class, new SocialLinks());
    if (socials.getEmail() == null || socials.getEmail().isBlank()) {
      socials.setEmail(user.getEmail());
    }

    return UserDto.builder()
        .id(user.getId())
        .name(user.getName())
        .avatar(user.getAvatar())
        .roles(user.getRoleList())
        .bio(user.getBio())
        .socials(socials)
        .stats(new UserStats(articles.size(), tags.size(), categories.size()))
        .build();
  }

  private AuthResponse buildAuthResponse(UserAccount user) {
    String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRoleList());
    return new AuthResponse(token, toUserDto(user));
  }

  private void sendCode(String scene, String email, String subject) {
    String normalized = email.trim().toLowerCase(Locale.ROOT);
    String code = String.valueOf(100000 + RANDOM.nextInt(900000));
    redisTemplate.opsForValue().set(codeKey(scene, normalized), code, Duration.ofMinutes(10));
    mailService.sendVerificationCode(normalized, subject, code);
  }

  private void validateCode(String scene, String email, String code) {
    String stored = redisTemplate.opsForValue().get(codeKey(scene, email));
    if (stored == null || !stored.equals(code)) {
      throw new ApiException(400, "Invalid or expired verification code");
    }
  }

  private String codeKey(String scene, String email) {
    return "auth:code:" + scene + ":" + email;
  }

  private String generateUniqueName(String email) {
    String base = email.substring(0, email.indexOf('@')).replaceAll("[^a-zA-Z0-9_]", "");
    if (base.isBlank()) {
      base = "user";
    }
    String candidate = base;
    int suffix = 1;
    while (userRepository.findByName(candidate).isPresent()) {
      candidate = base + suffix++;
    }
    return candidate;
  }

  private String sanitizeSeed(String input) {
    return input.replaceAll("[^a-zA-Z0-9]", "");
  }
}
