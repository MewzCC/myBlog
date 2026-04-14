package com.mewz.blogjava.video;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "video_events")
public class VideoEventEntity {

  @Id
  private String id = UUID.randomUUID().toString();

  @Column(nullable = false)
  private String videoKey;

  @Column(nullable = false)
  private String viewerId;

  @Column(nullable = false)
  private String event;

  @Column(nullable = false)
  private Long eventAt;

  @Lob
  private String dataJson;

  @Column(nullable = false)
  private Instant createdAt = Instant.now();
}

