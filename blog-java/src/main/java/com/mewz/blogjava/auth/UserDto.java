package com.mewz.blogjava.auth;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDto {

  private String id;
  private String name;
  private String avatar;
  private List<String> roles;
  private String bio;
  private SocialLinks socials;
  private UserStats stats;
}
