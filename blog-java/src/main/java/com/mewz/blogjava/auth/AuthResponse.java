package com.mewz.blogjava.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {

  private String token;
  private UserDto user;
}

