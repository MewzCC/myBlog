package com.mewz.blogjava.auth.service;

import com.mewz.blogjava.common.ApiException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

  private final MailDispatchService mailDispatchService;

  @Value("${app.mail.from:no-reply@example.com}")
  private String configuredFrom;

  @Value("${spring.mail.host:}")
  private String configuredHost;

  @Value("${spring.mail.port:587}")
  private int configuredPort;

  @Value("${spring.mail.username:}")
  private String configuredUsername;

  @Value("${spring.mail.password:}")
  private String configuredPassword;

  @Value("${app.mail.dev-mock-enabled:false}")
  private boolean devMockEnabled;

  public boolean sendVerificationCode(String email, String subject, String code) {
    MailConfig mailConfig = resolveMailConfig();
    if (mailConfig.getHost().isBlank()) {
      if (devMockEnabled) {
        return false;
      }
      throw new ApiException(500, "邮件服务未配置，请检查 blog-java/.env 或 blog-java/.env.example 中的 SMTP 设置");
    }
    if (mailConfig.getUsername().isBlank() || mailConfig.getPassword().isBlank()) {
      throw new ApiException(500, "SMTP 账号或授权码未配置");
    }

    mailDispatchService.sendVerificationCodeAsync(mailConfig, email, subject, code);
    return true;
  }

  private MailConfig resolveMailConfig() {
    Properties fileProperties = loadDotenvProperties();
    String host = firstNonBlank(fileProperties.getProperty("MAIL_HOST"), configuredHost);
    String username = firstNonBlank(fileProperties.getProperty("MAIL_USERNAME"), configuredUsername);
    String password = firstNonBlank(fileProperties.getProperty("MAIL_PASSWORD"), configuredPassword);
    String from = firstNonBlank(fileProperties.getProperty("MAIL_FROM"), configuredFrom, username);
    int port = resolvePort(fileProperties.getProperty("MAIL_PORT"));
    return new MailConfig(host, port, username, password, from);
  }

  private Properties loadDotenvProperties() {
    Properties properties = new Properties();
    loadInto(properties, Path.of(System.getProperty("user.dir", "."), ".env.example"));
    loadInto(properties, Path.of(System.getProperty("user.dir", "."), ".env"));
    return properties;
  }

  private void loadInto(Properties properties, Path path) {
    if (!Files.exists(path)) {
      return;
    }
    try (InputStreamReader reader = new InputStreamReader(Files.newInputStream(path), StandardCharsets.UTF_8)) {
      Properties current = new Properties();
      current.load(reader);
      properties.putAll(current);
    } catch (IOException ignored) {
    }
  }

  private int resolvePort(String filePort) {
    try {
      if (filePort != null && !filePort.isBlank()) {
        return Integer.parseInt(filePort.trim());
      }
      if (configuredPort > 0) {
        return configuredPort;
      }
    } catch (NumberFormatException ignored) {
    }
    return 465;
  }

  private String firstNonBlank(String... values) {
    for (String value : values) {
      if (value != null && !value.trim().isBlank()) {
        return value.trim();
      }
    }
    return "";
  }

  public static class MailConfig {
    private final String host;
    private final int port;
    private final String username;
    private final String password;
    private final String from;

    public MailConfig(String host, int port, String username, String password, String from) {
      this.host = host;
      this.port = port;
      this.username = username;
      this.password = password;
      this.from = from;
    }

    public String getHost() { return host; }
    public int getPort() { return port; }
    public String getUsername() { return username; }
    public String getPassword() { return password; }
    public String getFrom() { return from; }

    public MailConfig withPort(int nextPort) {
      return new MailConfig(host, nextPort, username, password, from);
    }
  }
}