package com.mewz.blogjava.auth;

import lombok.Data;

@Data
public class UserUpdateRequest {

  private String name;
  private String avatar;
  private String bio;
  private SocialLinks socials;
}
