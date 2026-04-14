package com.mewz.blogjava.video;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VideoUploadResponse {

  private String videoKey;
  private String url;
  private String mime;
  private long size;
  private String poster;
  private String thumbnailsVtt;
}
