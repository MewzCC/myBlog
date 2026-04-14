package com.mewz.blogjava.comment;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentCreateRequest {

  @NotBlank(message = "Comment content is required")
  private String content;

  private String parentId;
}

