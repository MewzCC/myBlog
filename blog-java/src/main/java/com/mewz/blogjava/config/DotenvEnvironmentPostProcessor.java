package com.mewz.blogjava.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

  @Override
  public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
    Path workingDir = Path.of(System.getProperty("user.dir", "."));
    addPropertySource(environment, workingDir.resolve(".env.example"), "dotenvExample");
    addPropertySource(environment, workingDir.resolve(".env"), "dotenv");
  }

  @Override
  public int getOrder() {
    return Ordered.HIGHEST_PRECEDENCE + 10;
  }

  private void addPropertySource(ConfigurableEnvironment environment, Path path, String sourceName) {
    if (!Files.exists(path)) {
      return;
    }

    Map<String, Object> values = parseFile(path);
    if (values.isEmpty()) {
      return;
    }

    environment.getPropertySources().addFirst(new MapPropertySource(sourceName, values));
  }

  private Map<String, Object> parseFile(Path path) {
    Map<String, Object> values = new LinkedHashMap<>();
    try {
      List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);
      for (String line : lines) {
        String trimmed = line.trim();
        if (trimmed.isBlank() || trimmed.startsWith("#")) {
          continue;
        }

        int separator = trimmed.indexOf('=');
        if (separator <= 0) {
          continue;
        }

        String key = trimmed.substring(0, separator).trim();
        String value = trimmed.substring(separator + 1).trim();
        values.put(key, stripQuotes(value));
      }
    } catch (IOException ignored) {
      return Map.of();
    }
    return values;
  }

  private String stripQuotes(String value) {
    if (value.length() >= 2) {
      boolean quotedWithDouble = value.startsWith("\"") && value.endsWith("\"");
      boolean quotedWithSingle = value.startsWith("'") && value.endsWith("'");
      if (quotedWithDouble || quotedWithSingle) {
        return value.substring(1, value.length() - 1);
      }
    }
    return value;
  }
}
