package com.mewz.blogjava.common;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JsonHelper {

  private final ObjectMapper objectMapper;

  public String toJson(Object value) {
    try {
      return objectMapper.writeValueAsString(value);
    } catch (JsonProcessingException ex) {
      throw new ApiException(500, "序列化 JSON 失败");
    }
  }

  public <T> T fromJson(String raw, Class<T> type, T fallback) {
    if (raw == null || raw.isBlank()) {
      return fallback;
    }
    try {
      return objectMapper.readValue(raw, type);
    } catch (JsonProcessingException ex) {
      return fallback;
    }
  }

  public Map<String, Object> readMap(String raw) {
    if (raw == null || raw.isBlank()) {
      return Collections.emptyMap();
    }
    try {
      return objectMapper.readValue(raw, new TypeReference<>() {
      });
    } catch (JsonProcessingException ex) {
      return Collections.emptyMap();
    }
  }

  public <T> List<T> readList(String raw, Class<T> type) {
    if (raw == null || raw.isBlank()) {
      return List.of();
    }
    try {
      return objectMapper.readValue(
          raw,
          objectMapper.getTypeFactory().constructCollectionType(List.class, type));
    } catch (JsonProcessingException ex) {
      return List.of();
    }
  }
}

