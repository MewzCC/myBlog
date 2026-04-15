package com.mewz.blogjava.auth.service;

import com.mewz.blogjava.auth.*;

import com.mewz.blogjava.article.ArticleEntity;
import com.mewz.blogjava.article.mapper.ArticleRepository;
import com.mewz.blogjava.article.ArticleStatus;
import com.mewz.blogjava.common.ApiException;
import com.mewz.blogjava.security.AuthStateCacheService;
import com.mewz.blogjava.common.JsonHelper;
import com.mewz.blogjava.security.service.JwtService;
import com.mewz.blogjava.security.JwtUserPrincipal;
import com.mewz.blogjava.user.UserAccount;
import com.mewz.blogjava.user.mapper.UserRepository;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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
  private final AuthStateCacheService authStateCacheService;
  private final MailService mailService;
  private final JsonHelper jsonHelper;

  @Value("${app.admin.email:admin@example.com}")
  private String adminEmail;

  @Transactional(readOnly = true)
  public AuthResponse login(LoginRequest request) {
    String account = request.getUsername().trim().toLowerCase(Locale.ROOT);
    UserAccount user = userRepository.findByEmail(account)
        .or(() -> userRepository.findByName(request.getUsername().trim()))
        .orElseThrow(() -> new ApiException(401, "账号或密码错误"));

    if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
      throw new ApiException(401, "账号或密码错误");
    }
    return buildAuthResponse(user);
  }

  public void logout(String token) {
    if (token == null || token.isBlank()) {
      return;
    }
    Duration ttl = jwtService.getRemainingTtl(token);
    authStateCacheService.blacklistToken(token, ttl);
  }

  @Transactional(readOnly = true)
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
            throw new ApiException(400, "昵称已存在");
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

  public VerificationCodeResult sendRegisterCode(VerificationCodeRequest request) {
    if (userRepository.findByEmail(request.getEmail().trim().toLowerCase(Locale.ROOT)).isPresent()) {
      throw new ApiException(400, "该邮箱已注册");
    }
    return sendCode("register", request.getEmail(), "博客注册验证码");
  }

  public VerificationCodeResult sendPasswordResetCode(VerificationCodeRequest request) {
    userRepository.findByEmail(request.getEmail().trim().toLowerCase(Locale.ROOT))
        .orElseThrow(() -> new ApiException(404, "该邮箱尚未注册"));
    return sendCode("password", request.getEmail(), "博客重置密码验证码");
  }

  @Transactional
  public AuthResponse register(RegisterRequest request) {
    String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
    if (userRepository.findByEmail(email).isPresent()) {
      throw new ApiException(400, "该邮箱已注册");
    }
    validateCode("register", email, request.getCode());

    UserAccount user = new UserAccount();
    user.setEmail(email);
    user.setName(generateUniqueName(email));
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    user.setAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=" + sanitizeSeed(user.getName()));
    user.setBio("欢迎来到樱花博客，开始记录你的想法吧。");
    SocialLinks socials = new SocialLinks();
    socials.setEmail(email);
    user.setSocialsJson(jsonHelper.toJson(socials));
    user.setRoles("user");
    userRepository.save(user);

    authStateCacheService.deleteVerificationCode(codeKey("register", email));
    return buildAuthResponse(user);
  }

  @Transactional
  public void resetPassword(ResetPasswordRequest request) {
    String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
    UserAccount user = userRepository.findByEmail(email)
        .orElseThrow(() -> new ApiException(404, "该邮箱尚未注册"));
    validateCode("password", email, request.getCode());
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    userRepository.save(user);
    authStateCacheService.deleteVerificationCode(codeKey("password", email));
  }

  @Transactional(readOnly = true)
  public UserDto getBloggerProfile() {
    UserAccount admin = userRepository.findByEmail(adminEmail)
        .orElseThrow(() -> new ApiException(404, "未找到站长账号"));
    return toUserDto(admin);
  }

  public UserAccount getAuthenticatedUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !(authentication.getPrincipal() instanceof JwtUserPrincipal)) {
      throw new ApiException(401, "未登录或登录已失效");
    }
    JwtUserPrincipal principal = (JwtUserPrincipal) authentication.getPrincipal();
    return userRepository.findById(principal.getId())
        .orElseThrow(() -> new ApiException(401, "未登录或登录已失效"));
  }

  public UserDto toUserDto(UserAccount user) {
    List<ArticleEntity> articles = articleRepository.findByAuthorIdAndStatus(user.getId(), ArticleStatus.APPROVED);
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

  private VerificationCodeResult sendCode(String scene, String email, String subject) {
    String normalized = email.trim().toLowerCase(Locale.ROOT);
    String code = String.valueOf(100000 + RANDOM.nextInt(900000));
    authStateCacheService.storeVerificationCode(codeKey(scene, normalized), code, Duration.ofMinutes(10));
    boolean delivered = mailService.sendVerificationCode(normalized, subject, code);
    return new VerificationCodeResult(delivered ? "email" : "mock", delivered ? null : code);
  }

  private void validateCode(String scene, String email, String code) {
    String stored = authStateCacheService.getVerificationCode(codeKey(scene, email));
    if (stored == null || !stored.equals(code)) {
      throw new ApiException(400, "验证码错误或已过期");
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


