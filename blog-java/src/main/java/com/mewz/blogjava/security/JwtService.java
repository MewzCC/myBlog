package com.mewz.blogjava.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  private final Key signingKey;
  private final Duration expiration;

  public JwtService(
      @Value("${app.jwt.secret}") String secret,
      @Value("${app.jwt.expiration-hours:72}") long expirationHours) {
    this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    this.expiration = Duration.ofHours(expirationHours);
  }

  public String generateToken(String userId, String email, List<String> roles) {
    Instant now = Instant.now();
    return Jwts.builder()
        .subject(userId)
        .claims(Map.of("email", email, "roles", roles))
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plus(expiration)))
        .signWith(signingKey)
        .compact();
  }

  public Claims parseToken(String token) {
    return Jwts.parser()
        .verifyWith(Keys.hmacShaKeyFor(signingKey.getEncoded()))
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }

  public Duration getRemainingTtl(String token) {
    Claims claims = parseToken(token);
    Instant expirationAt = claims.getExpiration().toInstant();
    Duration ttl = Duration.between(Instant.now(), expirationAt);
    return ttl.isNegative() ? Duration.ZERO : ttl;
  }
}
