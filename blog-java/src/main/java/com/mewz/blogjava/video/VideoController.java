package com.mewz.blogjava.video;

import com.mewz.blogjava.common.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
public class VideoController {

  private final VideoService videoService;

  @PostMapping("/api/upload/video")
  public ApiResponse<VideoUploadResponse> upload(@RequestPart("file") MultipartFile file) {
    return ApiResponse.success(videoService.upload(file));
  }

  @GetMapping("/api/videos/{videoKey}/danmaku")
  public ApiResponse<List<VideoDanmakuItemDto>> getDanmaku(@PathVariable String videoKey) {
    return ApiResponse.success(videoService.getDanmaku(videoKey));
  }

  @PostMapping("/api/videos/{videoKey}/danmaku")
  public ApiResponse<VideoDanmakuItemDto> postDanmaku(
      @PathVariable String videoKey,
      @RequestBody VideoDanmakuItemDto payload,
      @RequestHeader(value = "X-Visitor-Id", required = false) String visitorId) {
    return ApiResponse.success(videoService.addDanmaku(videoKey, payload, visitorId));
  }

  @PostMapping("/api/videos/{videoKey}/events")
  public ApiResponse<Void> postEvent(@PathVariable String videoKey, @Valid @RequestBody VideoEventPayload payload) {
    videoService.bufferEvent(videoKey, payload);
    return ApiResponse.success("Success", null);
  }

  @GetMapping("/api/analytics/videos")
  public ApiResponse<List<VideoAnalyticsItemDto>> analytics() {
    return ApiResponse.success(videoService.getAnalytics());
  }
}
