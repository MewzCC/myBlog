package com.mewz.blogjava.auth.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

  private static final Logger log = LoggerFactory.getLogger(MailService.class);

  private final JavaMailSender mailSender;

  @Value("${app.mail.from:no-reply@example.com}")
  private String from;

  @Value("${spring.mail.host:}")
  private String host;

  @Value("${app.mail.dev-mock-enabled:true}")
  private boolean devMockEnabled;

  public boolean sendVerificationCode(String email, String subject, String code) {
    if (host == null || host.isBlank()) {
      if (devMockEnabled) {
        log.info("Mail host is not configured, using development verification code for {}: {}", email, code);
        return false;
      }
      throw new IllegalStateException("Mail host is not configured");
    }

    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(from);
    message.setTo(email);
    message.setSubject(subject);
    message.setText("Your verification code is: " + code + "\nThis code will expire in 10 minutes.");
    try {
      mailSender.send(message);
      return true;
    } catch (MailException ex) {
      if (devMockEnabled) {
        log.warn("Mail send failed for {}, falling back to development verification code: {}", email, code, ex);
        return false;
      }
      throw ex;
    }
  }
}


