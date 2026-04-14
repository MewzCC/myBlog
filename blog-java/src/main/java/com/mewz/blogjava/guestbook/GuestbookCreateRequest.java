package com.mewz.blogjava.guestbook;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GuestbookCreateRequest {

  @NotBlank(message = "Message content is required")
  private String content;
}

