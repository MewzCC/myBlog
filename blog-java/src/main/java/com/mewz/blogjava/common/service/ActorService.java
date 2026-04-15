package com.mewz.blogjava.common.service;

import com.mewz.blogjava.common.ActorContext;
import com.mewz.blogjava.common.ApiException;

import com.mewz.blogjava.security.JwtUserPrincipal;
import com.mewz.blogjava.user.UserAccount;
import com.mewz.blogjava.user.mapper.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ActorService {

  private final UserRepository userRepository;

  public ActorContext getActor(String visitorId) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication != null && authentication.getPrincipal() instanceof JwtUserPrincipal) {
      JwtUserPrincipal principal = (JwtUserPrincipal) authentication.getPrincipal();
      UserAccount user = userRepository.findById(principal.getId())
          .orElseThrow(() -> new ApiException(401, "用户不存在或登录已失效"));
      return ActorContext.builder()
          .authenticated(true)
          .admin(user.getRoleList().contains("admin"))
          .userId(user.getId())
          .userName(user.getName())
          .userAvatar(user.getAvatar())
          .userEmail(user.getEmail())
          .visitorId(visitorId)
          .build();
    }
    return ActorContext.builder()
        .authenticated(false)
        .admin(false)
        .visitorId(visitorId == null || visitorId.isBlank() ? "anonymous" : visitorId)
        .userName("访客")
        .userAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=Visitor")
        .build();
  }
}


