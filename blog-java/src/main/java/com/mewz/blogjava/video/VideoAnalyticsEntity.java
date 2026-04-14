package com.mewz.blogjava.video;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "video_analytics")
public class VideoAnalyticsEntity {

  @Id
  private String videoKey;

  @Column(nullable = false)
  private long plays = 0L;

  @Column(nullable = false)
  private long uniqueViewers = 0L;

  @Column(nullable = false)
  private long events = 0L;

  @Column(nullable = false)
  private long lastEventAt = 0L;
}
