package com.mewz.blogjava.user.controller;

import com.mewz.blogjava.auth.service.AuthService;
import com.mewz.blogjava.auth.UserDto;
import com.mewz.blogjava.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/blogger")
@RequiredArgsConstructor
public class BloggerController {

  private final AuthService authService;

  @GetMapping("/profile")
  public ApiResponse<UserDto> profile() {
    return ApiResponse.success(authService.getBloggerProfile());
  }
}


