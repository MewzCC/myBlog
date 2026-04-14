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
    return ApiResponse.success("Success", null);
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
  public ApiResponse<Void> sendRegisterCode(@Valid @RequestBody VerificationCodeRequest request) {
    authService.sendRegisterCode(request);
    return ApiResponse.successMessage("Verification code sent");
  }

  @PostMapping("/register")
  public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
    return ApiResponse.success(authService.register(request));
  }

  @PostMapping("/password/code")
  public ApiResponse<Void> sendPasswordCode(@Valid @RequestBody VerificationCodeRequest request) {
    authService.sendPasswordResetCode(request);
    return ApiResponse.successMessage("Verification code sent");
  }

  @PostMapping("/password/reset")
  public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
    authService.resetPassword(request);
    return ApiResponse.successMessage("Password reset successful");
  }
}


