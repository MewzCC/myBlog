package com.mewz.blogjava.guestbook;

import com.mewz.blogjava.auth.UserDto;
import java.time.Instant;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GuestbookMessageDto {

  private String id;
  private String content;
  private Instant createdAt;
  private UserDto user;
}

