package com.mewz.blogjava.video;

import java.util.Map;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VideoDanmakuItemDto {

  private String text;
  private Double time;
  private Integer mode;
  private String color;
  private Boolean border;
  private Map<String, Object> style;
  private VideoDanmakuUserDto user;
}

