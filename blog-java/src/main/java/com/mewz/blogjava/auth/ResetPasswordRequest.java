package com.mewz.blogjava.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {

  @Email(message = "请输入正确的邮箱地址")
  @NotBlank(message = "请输入邮箱地址")
  private String email;

  @NotBlank(message = "请输入验证码")
  private String code;

  @Size(min = 8, message = "密码长度不能少于 8 位")
  private String password;
}

