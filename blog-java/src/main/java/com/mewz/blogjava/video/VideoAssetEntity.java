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
@Table(name = "video_assets")
public class VideoAssetEntity extends BaseEntity {

  @Id
  private String id = UUID.randomUUID().toString();

  @Column(nullable = false, unique = true)
  private String videoKey;

  @Column(nullable = false)
  private String filePath;

  @Column(nullable = false)
  private String publicUrl;

  @Column(nullable = false)
  private String mime;

  @Column(nullable = false)
  private long size;

  @Lob
  private String poster;

  @Lob
  private String thumbnailsVtt;
}
