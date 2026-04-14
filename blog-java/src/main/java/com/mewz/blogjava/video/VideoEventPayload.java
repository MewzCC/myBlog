package com.mewz.blogjava.video;

import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import lombok.Data;

@Data
public class VideoEventPayload {

  @NotBlank(message = "viewerId is required")
  private String viewerId;

  @NotBlank(message = "event is required")
  private String event;

  private long at;

  private Map<String, Object> data;
}
