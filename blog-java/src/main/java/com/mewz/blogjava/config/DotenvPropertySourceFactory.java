package com.mewz.blogjava.config;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Properties;
import org.springframework.core.env.PropertiesPropertySource;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.support.EncodedResource;
import org.springframework.core.io.support.PropertySourceFactory;

public class DotenvPropertySourceFactory implements PropertySourceFactory {

  @Override
  public PropertySource<?> createPropertySource(String name, EncodedResource resource) throws IOException {
    Properties properties = new Properties();
    try (InputStreamReader reader = new InputStreamReader(resource.getResource().getInputStream(), StandardCharsets.UTF_8)) {
      properties.load(reader);
    }
    String sourceName = name != null ? name : resource.getResource().getFilename();
    return new PropertiesPropertySource(sourceName == null ? "dotenv" : sourceName, properties);
  }
}
