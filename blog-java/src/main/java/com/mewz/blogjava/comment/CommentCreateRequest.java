package com.mewz.blogjava.comment;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentCreateRequest {

  @NotBlank(message = "评论内容不能为空")
  private String content;

  private String parentId;
}

