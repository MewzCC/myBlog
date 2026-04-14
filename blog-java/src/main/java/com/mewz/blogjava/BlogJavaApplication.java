package com.mewz.blogjava;

import com.mewz.blogjava.config.StorageProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties(StorageProperties.class)
public class BlogJavaApplication {

  public static void main(String[] args) {
    SpringApplication.run(BlogJavaApplication.class, args);
  }
}

