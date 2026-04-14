package com.mewz.blogjava.video;

import com.mewz.blogjava.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "video_danmaku")
public class VideoDanmakuEntity extends BaseEntity {

  @Id
  private String id = UUID.randomUUID().toString();

  @Column(nullable = false)
  private String videoKey;

  @Lob
  @Column(nullable = false, columnDefinition = "LONGTEXT")
  private String text;

  private Double timeInSeconds;

  private Integer modeValue;

  private String color;

  private Boolean borderEnabled;

  @Lob
  @Column(columnDefinition = "LONGTEXT")
  private String styleJson;

  private String userId;

  private String visitorId;

  private String authorName;

  @Lob
  @Column(columnDefinition = "LONGTEXT")
  private String authorAvatar;

  @Column(nullable = false)
  private Boolean anonymous = false;
}

