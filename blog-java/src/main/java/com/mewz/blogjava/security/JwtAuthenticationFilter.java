package com.mewz.blogjava.security;

import com.mewz.blogjava.security.service.JwtService;

import com.mewz.blogjava.user.UserAccount;
import com.mewz.blogjava.user.mapper.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtService jwtService;
  private final UserRepository userRepository;
  private final AuthStateCacheService authStateCacheService;

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {
    String authorization = request.getHeader("Authorization");
    if (authorization == null || !authorization.startsWith("Bearer ")) {
      filterChain.doFilter(request, response);
      return;
    }

    String token = authorization.substring(7);
    try {
      if (authStateCacheService.isTokenBlacklisted(token)) {
        filterChain.doFilter(request, response);
        return;
      }

      Claims claims = jwtService.parseToken(token);
      String userId = claims.getSubject();
      Optional<UserAccount> userOptional = userRepository.findById(userId);
      if (userOptional.isPresent() && SecurityContextHolder.getContext().getAuthentication() == null) {
        UserAccount user = userOptional.get();
        JwtUserPrincipal principal =
            new JwtUserPrincipal(user.getId(), user.getEmail(), user.getPasswordHash(), user.getRoleList());
        UsernamePasswordAuthenticationToken authentication =
            new UsernamePasswordAuthenticationToken(principal, token, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
      }
    } catch (Exception ignored) {
      SecurityContextHolder.clearContext();
    }

    filterChain.doFilter(request, response);
  }
}

