package com.mewz.blogjava.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

  @NotBlank(message = "请输入账号")
  private String username;

  @NotBlank(message = "请输入密码")
  private String password;
}

