package com.mewz.blogjava.common;

import jakarta.validation.ConstraintViolationException;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ApiException.class)
  public ResponseEntity<ApiResponse<Void>> handleApi(ApiException ex) {
    return ResponseEntity.status(resolveStatus(ex.getCode()))
        .body(ApiResponse.error(ex.getCode(), ex.getMessage()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
    String message = ex.getBindingResult().getFieldErrors().stream()
        .map(error -> error.getDefaultMessage() == null ? error.getField() : error.getDefaultMessage())
        .findFirst()
        .orElse("Invalid request");
    return ResponseEntity.badRequest().body(ApiResponse.error(400, message));
  }

  @ExceptionHandler(BindException.class)
  public ResponseEntity<ApiResponse<Void>> handleBind(BindException ex) {
    String message = ex.getFieldErrors().stream()
        .map(error -> error.getDefaultMessage() == null ? error.getField() : error.getDefaultMessage())
        .findFirst()
        .orElse("Invalid request");
    return ResponseEntity.badRequest().body(ApiResponse.error(400, message));
  }

  @ExceptionHandler(ConstraintViolationException.class)
  public ResponseEntity<ApiResponse<Void>> handleConstraint(ConstraintViolationException ex) {
    String message = ex.getConstraintViolations().stream()
        .map(violation -> violation.getMessage())
        .collect(Collectors.joining("; "));
    return ResponseEntity.badRequest().body(ApiResponse.error(400, message));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResponse<Void>> handleUnknown(Exception ex) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(ApiResponse.error(500, ex.getMessage() == null ? "Server error" : ex.getMessage()));
  }

  private HttpStatus resolveStatus(int code) {
    if (code == 401) {
      return HttpStatus.UNAUTHORIZED;
    }
    if (code == 403) {
      return HttpStatus.FORBIDDEN;
    }
    if (code == 404) {
      return HttpStatus.NOT_FOUND;
    }
    if (code == 400) {
      return HttpStatus.BAD_REQUEST;
    }
    return HttpStatus.OK;
  }
}
