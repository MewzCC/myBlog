package com.mewz.blogjava.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerificationCodeRequest {

  @Email(message = "Please enter a valid email")
  @NotBlank(message = "Email is required")
  private String email;
}
