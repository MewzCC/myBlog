package com.mewz.blogjava.auth.controller;

import com.mewz.blogjava.auth.*;
import com.mewz.blogjava.auth.service.AuthService;

import com.mewz.blogjava.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;

  @PostMapping("/login")
  public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
    return ApiResponse.success(authService.login(request));
  }

  @PostMapping("/logout")
  public ApiResponse<Void> logout(@RequestHeader(value = "Authorization", required = false) String authorization) {
    String token = authorization != null && authorization.startsWith("Bearer ")
        ? authorization.substring(7)
        : null;
    authService.logout(token);
    return ApiResponse.success("退出成功", null);
  }

  @GetMapping("/me")
  public ApiResponse<UserDto> me() {
    return ApiResponse.success(authService.getCurrentUser());
  }

  @PutMapping("/me")
  public ApiResponse<UserDto> updateMe(@Valid @RequestBody UserUpdateRequest request) {
    return ApiResponse.success(authService.updateCurrentUser(request));
  }

  @PostMapping("/register/code")
  public ApiResponse<VerificationCodeResult> sendRegisterCode(@Valid @RequestBody VerificationCodeRequest request) {
    VerificationCodeResult result = authService.sendRegisterCode(request);
    String message = "email".equals(result.getDelivery()) ? "验证码已发送" : "开发环境验证码已生成";
    return ApiResponse.success(message, result);
  }

  @PostMapping("/register")
  public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
    return ApiResponse.success(authService.register(request));
  }

  @PostMapping("/password/code")
  public ApiResponse<VerificationCodeResult> sendPasswordCode(@Valid @RequestBody VerificationCodeRequest request) {
    VerificationCodeResult result = authService.sendPasswordResetCode(request);
    String message = "email".equals(result.getDelivery()) ? "验证码已发送" : "开发环境验证码已生成";
    return ApiResponse.success(message, result);
  }

  @PostMapping("/password/reset")
  public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
    authService.resetPassword(request);
    return ApiResponse.successMessage("密码重置成功");
  }
}


