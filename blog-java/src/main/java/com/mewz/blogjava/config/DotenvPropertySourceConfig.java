package com.mewz.blogjava.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource(value = "file:${user.dir}/.env.example", factory = DotenvPropertySourceFactory.class, ignoreResourceNotFound = true)
@PropertySource(value = "file:${user.dir}/.env", factory = DotenvPropertySourceFactory.class, ignoreResourceNotFound = true)
public class DotenvPropertySourceConfig {
}
