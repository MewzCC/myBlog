package com.mewz.blogjava.security;

import java.time.Duration;
import java.time.Instant;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthStateCacheService {

  private static final Logger log = LoggerFactory.getLogger(AuthStateCacheService.class);

  private final StringRedisTemplate redisTemplate;

  private final Map<String, ExpiringValue> localCodes = new ConcurrentHashMap<>();
  private final Map<String, Instant> localBlacklist = new ConcurrentHashMap<>();

  public void storeVerificationCode(String key, String code, Duration ttl) {
    try {
      redisTemplate.opsForValue().set(key, code, ttl);
      return;
    } catch (Exception ex) {
      log.warn("Redis unavailable while storing verification code {}, falling back to memory cache", key);
    }
    localCodes.put(key, new ExpiringValue(code, Instant.now().plus(ttl)));
  }

  public String getVerificationCode(String key) {
    try {
      return redisTemplate.opsForValue().get(key);
    } catch (Exception ex) {
      pruneCodes();
      ExpiringValue value = localCodes.get(key);
      return value == null ? null : value.value();
    }
  }

  public void deleteVerificationCode(String key) {
    try {
      redisTemplate.delete(key);
    } catch (Exception ex) {
      log.warn("Redis unavailable while deleting verification code {}, removing from memory cache", key);
    }
    localCodes.remove(key);
  }

  public void blacklistToken(String token, Duration ttl) {
    String key = blacklistKey(token);
    try {
      redisTemplate.opsForValue().set(key, "1", ttl);
      return;
    } catch (Exception ex) {
      log.warn("Redis unavailable while blacklisting token, falling back to memory cache");
    }
    localBlacklist.put(key, Instant.now().plus(ttl));
  }

  public boolean isTokenBlacklisted(String token) {
    String key = blacklistKey(token);
    try {
      return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    } catch (Exception ex) {
      pruneBlacklist();
      Instant expiry = localBlacklist.get(key);
      return expiry != null && expiry.isAfter(Instant.now());
    }
  }

  private String blacklistKey(String token) {
    return "auth:blacklist:" + token;
  }

  private void pruneCodes() {
    Iterator<Map.Entry<String, ExpiringValue>> iterator = localCodes.entrySet().iterator();
    Instant now = Instant.now();
    while (iterator.hasNext()) {
      Map.Entry<String, ExpiringValue> entry = iterator.next();
      if (entry.getValue().expiresAt().isBefore(now)) {
        iterator.remove();
      }
    }
  }

  private void pruneBlacklist() {
    Iterator<Map.Entry<String, Instant>> iterator = localBlacklist.entrySet().iterator();
    Instant now = Instant.now();
    while (iterator.hasNext()) {
      Map.Entry<String, Instant> entry = iterator.next();
      if (entry.getValue().isBefore(now)) {
        iterator.remove();
      }
    }
  }

  private record ExpiringValue(String value, Instant expiresAt) {
  }
}
