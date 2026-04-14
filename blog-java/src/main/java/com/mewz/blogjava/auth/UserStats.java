package com.mewz.blogjava.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserStats {

  private long articles;
  private long tags;
  private long categories;
}
