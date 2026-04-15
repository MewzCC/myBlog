package com.mewz.blogjava.auth.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class MailDispatchService {

  @Async("mailExecutor")
  public void sendVerificationCodeAsync(MailService.MailConfig mailConfig, String email, String subject, String code) {
    List<Integer> ports = buildCandidatePorts(mailConfig.getPort());
    Exception lastException = null;

    for (Integer port : ports) {
      try {
        sendMail(mailConfig.withPort(port), email, subject, code);
        log.info("Verification email queued successfully for {} via {}:{}", email, mailConfig.getHost(), port);
        return;
      } catch (MailException | MessagingException | UnsupportedEncodingException ex) {
        lastException = ex;
        log.warn("Verification email send failed for {} via {}:{}", email, mailConfig.getHost(), port, ex);
      }
    }

    if (lastException != null) {
      log.error("Verification email ultimately failed for {} via host {}", email, mailConfig.getHost(), lastException);
    }
  }

  private void sendMail(MailService.MailConfig mailConfig, String email, String subject, String code)
      throws MessagingException, UnsupportedEncodingException {
    JavaMailSenderImpl sender = buildSender(mailConfig);
    var message = sender.createMimeMessage();
    var helper = new MimeMessageHelper(message, false, "UTF-8");
    helper.setTo(email);
    helper.setSubject(subject);
    helper.setText("你的验证码是：" + code + "\n验证码 10 分钟内有效，请尽快完成操作。", false);
    applyFrom(helper, mailConfig);
    sender.send(message);
  }

  private JavaMailSenderImpl buildSender(MailService.MailConfig mailConfig) {
    JavaMailSenderImpl sender = new JavaMailSenderImpl();
    sender.setHost(mailConfig.getHost());
    sender.setPort(mailConfig.getPort());
    sender.setUsername(mailConfig.getUsername());
    sender.setPassword(mailConfig.getPassword());
    sender.setDefaultEncoding("UTF-8");

    Properties properties = sender.getJavaMailProperties();
    properties.put("mail.smtp.auth", "true");
    properties.put("mail.transport.protocol", "smtp");
    properties.put("mail.debug", "false");
    properties.put("mail.smtp.connectiontimeout", "5000");
    properties.put("mail.smtp.timeout", "5000");
    properties.put("mail.smtp.writetimeout", "5000");
    properties.put("mail.smtp.quitwait", "false");
    if (mailConfig.getPort() == 465) {
      properties.put("mail.smtp.ssl.enable", "true");
      properties.put("mail.smtp.starttls.enable", "false");
    } else {
      properties.put("mail.smtp.ssl.enable", "false");
      properties.put("mail.smtp.starttls.enable", "true");
    }
    return sender;
  }

  private void applyFrom(MimeMessageHelper helper, MailService.MailConfig mailConfig)
      throws MessagingException, UnsupportedEncodingException {
    String senderAddress = mailConfig.getFrom().contains("@") ? mailConfig.getFrom() : mailConfig.getUsername();
    String personalName = mailConfig.getFrom().contains("@") ? "" : mailConfig.getFrom();

    if (personalName.isBlank()) {
      helper.setFrom(senderAddress);
      return;
    }

    helper.setFrom(new InternetAddress(senderAddress, personalName, "UTF-8"));
  }

  private List<Integer> buildCandidatePorts(int preferredPort) {
    List<Integer> ports = new ArrayList<>();
    ports.add(preferredPort);
    if (preferredPort != 465) {
      ports.add(465);
    }
    if (preferredPort != 587) {
      ports.add(587);
    }
    return ports;
  }
}