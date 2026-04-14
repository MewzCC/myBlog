package com.mewz.blogjava.comment;

import com.mewz.blogjava.auth.UserDto;
import java.time.Instant;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CommentDto {

  private String id;
  private String content;
  private Instant createdAt;
  private UserDto user;
  private long likes;
  private List<CommentDto> replies;
}
