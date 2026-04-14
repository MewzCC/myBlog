package com.mewz.blogjava.article.controller;

import com.mewz.blogjava.article.*;
import com.mewz.blogjava.article.service.ArticleService;

import com.mewz.blogjava.comment.CommentCreateRequest;
import com.mewz.blogjava.comment.CommentDto;
import com.mewz.blogjava.comment.service.CommentService;
import com.mewz.blogjava.common.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

  private final ArticleService articleService;
  private final CommentService commentService;

  @GetMapping
  public ApiResponse<ArticleListResponse> list(
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer pageSize,
      @RequestParam(required = false) String keyword,
      @RequestParam(required = false) String category,
      @RequestParam(required = false) String tag) {
    return ApiResponse.success(articleService.getArticles(page, pageSize, keyword, category, tag, false));
  }

  @GetMapping("/{id}")
  public ApiResponse<ArticleDetailDto> detail(
      @PathVariable String id,
      @RequestHeader(value = "X-Visitor-Id", required = false) String visitorId) {
    return ApiResponse.success(articleService.getArticleDetail(id, visitorId));
  }

  @PostMapping
  public ApiResponse<ArticleDetailDto> create(@Valid @RequestBody CreateArticleRequest request) {
    return ApiResponse.success(articleService.createArticle(request));
  }

  @PostMapping("/{id}/like")
  public ApiResponse<Map<String, Object>> like(
      @PathVariable String id,
      @RequestHeader(value = "X-Visitor-Id", required = false) String visitorId) {
    ArticleService.ArticleReactionResult result = articleService.toggleLike(id, visitorId);
    return ApiResponse.success(Map.of("likes", result.count(), "isLiked", result.active()));
  }

  @PostMapping("/{id}/favorite")
  public ApiResponse<Map<String, Object>> favorite(
      @PathVariable String id,
      @RequestHeader(value = "X-Visitor-Id", required = false) String visitorId) {
    ArticleService.ArticleFavoriteResult result = articleService.toggleFavorite(id, visitorId);
    return ApiResponse.success(Map.of("favorites", result.favorites(), "isFavorited", result.isFavorited()));
  }

  @GetMapping("/{id}/comments")
  public ApiResponse<List<CommentDto>> comments(@PathVariable String id) {
    return ApiResponse.success(commentService.getComments(id));
  }

  @PostMapping("/{id}/comments")
  public ApiResponse<CommentDto> addComment(
      @PathVariable String id,
      @Valid @RequestBody CommentCreateRequest request,
      @RequestHeader(value = "X-Visitor-Id", required = false) String visitorId) {
    return ApiResponse.success(commentService.addComment(id, request, visitorId));
  }
}


