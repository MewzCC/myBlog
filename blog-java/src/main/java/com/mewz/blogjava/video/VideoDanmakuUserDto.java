package com.mewz.blogjava.video;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VideoDanmakuUserDto {

  private String id;
  private String name;
  private String avatar;
  private boolean anonymous;
}

