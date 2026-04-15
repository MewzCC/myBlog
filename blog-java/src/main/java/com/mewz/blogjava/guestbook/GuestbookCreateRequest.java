package com.mewz.blogjava.guestbook;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GuestbookCreateRequest {

  @NotBlank(message = "留言内容不能为空")
  private String content;
}

