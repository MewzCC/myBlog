package com.mewz.blogjava.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

  private final JavaMailSender mailSender;

  @Value("${app.mail.from:no-reply@example.com}")
  private String from;

  public void sendVerificationCode(String email, String subject, String code) {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(from);
    message.setTo(email);
    message.setSubject(subject);
    message.setText("Your verification code is: " + code + "\nThis code will expire in 10 minutes.");
    mailSender.send(message);
  }
}
