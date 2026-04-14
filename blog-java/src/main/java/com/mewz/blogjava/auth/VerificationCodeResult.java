package com.mewz.blogjava.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class VerificationCodeResult {

  private String delivery;
  private String debugCode;
}
