package com.mewz.blogjava.common;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ActorContext {

  private String userId;
  private String userName;
  private String userAvatar;
  private String userEmail;
  private boolean authenticated;
  private boolean admin;
  private String visitorId;

  public String principalKey() {
    return authenticated ? "user:" + userId : "visitor:" + visitorId;
  }
}
