package com.mewz.blogjava.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

  @Email(message = "Please enter a valid email")
  @NotBlank(message = "Email is required")
  private String email;

  @NotBlank(message = "Verification code is required")
  private String code;

  @Size(min = 8, message = "Password must be at least 8 characters")
  private String password;
}
