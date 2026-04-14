package com.mewz.blogjava.comment;

import com.mewz.blogjava.common.ApiResponse;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

  private final CommentService commentService;

  @PostMapping("/{id}/like")
  public ApiResponse<Map<String, Object>> like(
      @PathVariable String id,
      @RequestHeader(value = "X-Visitor-Id", required = false) String visitorId) {
    CommentActionResponse response = commentService.toggleLike(id, visitorId);
    return ApiResponse.success(Map.of("likes", response.getLikes(), "isLiked", response.isLiked()));
  }

  @DeleteMapping("/{id}")
  public ApiResponse<Void> delete(
      @PathVariable String id,
      @RequestHeader(value = "X-Visitor-Id", required = false) String visitorId) {
    commentService.deleteComment(id, visitorId);
    return ApiResponse.successMessage("Comment deleted");
  }

  @PostMapping("/{id}/report")
  public ApiResponse<Void> report(
      @PathVariable String id,
      @RequestHeader(value = "X-Visitor-Id", required = false) String visitorId) {
    commentService.reportComment(id, visitorId);
    return ApiResponse.successMessage("Comment reported");
  }
}
