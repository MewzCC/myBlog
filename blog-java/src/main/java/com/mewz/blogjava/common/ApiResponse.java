package com.mewz.blogjava.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApiResponse<T> {

  private int code;
  private String message;
  private T data;

  public static <T> ApiResponse<T> success(T data) {
    return new ApiResponse<>(200, "成功", data);
  }

  public static <T> ApiResponse<T> success(String message, T data) {
    return new ApiResponse<>(200, message, data);
  }

  public static ApiResponse<Void> successMessage(String message) {
    return new ApiResponse<>(200, message, null);
  }

  public static ApiResponse<Void> error(int code, String message) {
    return new ApiResponse<>(code, message, null);
  }
}

