package com.mewz.blogjava.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {

  private String uploadDir = "uploads";
  private String publicPrefix = "/uploads/";
}
