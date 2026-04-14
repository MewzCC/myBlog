package com.mewz.blogjava.video;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VideoAnalyticsItemDto {

  private String videoKey;
  private long plays;
  private long uniqueViewers;
  private long events;
  private long lastEventAt;
}

