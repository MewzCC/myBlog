package com.mewz.blogjava.config;

import com.mewz.blogjava.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

  private final JwtAuthenticationFilter jwtAuthenticationFilter;

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.csrf(AbstractHttpConfigurer::disable)
        .cors(Customizer.withDefaults())
        .sessionManagement(configurer -> configurer.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(registry -> registry
            .requestMatchers("/uploads/**").permitAll()
            .requestMatchers(HttpMethod.GET,
                "/api/articles/**",
                "/api/meta/**",
                "/api/blogger/profile",
                "/api/guestbook/messages",
                "/api/site/settings",
                "/api/videos/*/danmaku",
                "/api/analytics/videos").permitAll()
            .requestMatchers(HttpMethod.POST,
                "/api/auth/login",
                "/api/auth/register",
                "/api/auth/register/code",
                "/api/auth/password/code",
                "/api/auth/password/reset",
                "/api/guestbook/messages",
                "/api/articles/*/like",
                "/api/articles/*/favorite",
                "/api/articles/*/comments",
                "/api/comments/*/like",
                "/api/comments/*/report",
                "/api/upload/video",
                "/api/videos/*/danmaku",
                "/api/videos/*/events").permitAll()
            .requestMatchers(HttpMethod.DELETE, "/api/comments/*").permitAll()
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.POST, "/api/articles").hasRole("ADMIN")
            .requestMatchers("/api/auth/me", "/api/auth/logout").authenticated()
            .requestMatchers(HttpMethod.PUT, "/api/auth/me").authenticated()
            .anyRequest().permitAll())
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}

