package com.mewz.blogjava.video;

import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import lombok.Data;

@Data
public class VideoEventPayload {

  @NotBlank(message = "viewerId 不能为空")
  private String viewerId;

  @NotBlank(message = "事件类型不能为空")
  private String event;

  private long at;

  private Map<String, Object> data;
}

