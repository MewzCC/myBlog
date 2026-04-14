package com.mewz.blogjava.comment;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CommentActionResponse {

  private long likes;
  private boolean isLiked;
}
