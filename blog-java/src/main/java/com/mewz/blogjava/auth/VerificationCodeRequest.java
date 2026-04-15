package com.mewz.blogjava.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerificationCodeRequest {

  @Email(message = "请输入正确的邮箱地址")
  @NotBlank(message = "请输入邮箱地址")
  private String email;
}

