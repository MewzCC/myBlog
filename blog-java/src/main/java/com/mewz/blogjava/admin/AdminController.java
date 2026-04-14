package com.mewz.blogjava.admin;

import com.mewz.blogjava.common.ApiResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/articles")
@RequiredArgsConstructor
public class AdminController {

  private final AdminService adminService;

  @GetMapping
  public ApiResponse<List<AdminArticleReviewItemDto>> list(@RequestParam(required = false) String keyword) {
    return ApiResponse.success(adminService.getReviewArticles(keyword));
  }

  @PostMapping("/{id}/approve")
  public ApiResponse<Void> approve(@PathVariable String id) {
    adminService.approve(id);
    return ApiResponse.successMessage("Article approved");
  }

  @PostMapping("/{id}/reject")
  public ApiResponse<Void> reject(@PathVariable String id) {
    adminService.reject(id);
    return ApiResponse.successMessage("Article rejected");
  }
}
