package com.mewz.blogjava.admin.service;

import com.mewz.blogjava.admin.AdminArticleReviewItemDto;

import com.mewz.blogjava.article.ArticleEntity;
import com.mewz.blogjava.article.mapper.ArticleRepository;
import com.mewz.blogjava.article.ArticleStatus;
import com.mewz.blogjava.common.ApiException;
import com.mewz.blogjava.meta.service.MetaService;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

  private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")
      .withZone(ZoneId.systemDefault());

  private final ArticleRepository articleRepository;
  private final MetaService metaService;

  public List<AdminArticleReviewItemDto> getReviewArticles(String keyword) {
    return articleRepository.findAll().stream()
        .sorted(Comparator.comparing(ArticleEntity::getPublishDate).reversed())
        .filter(article -> keyword == null || keyword.isBlank()
            || article.getTitle().toLowerCase(Locale.ROOT).contains(keyword.toLowerCase(Locale.ROOT))
            || article.getAuthor().getName().toLowerCase(Locale.ROOT).contains(keyword.toLowerCase(Locale.ROOT)))
        .map(this::toReviewItem)
        .toList();
  }

  @Transactional
  public void approve(String articleId) {
    ArticleEntity article = findArticle(articleId);
    article.setStatus(ArticleStatus.APPROVED);
    articleRepository.save(article);
    metaService.refreshCaches();
  }

  @Transactional
  public void reject(String articleId) {
    ArticleEntity article = findArticle(articleId);
    article.setStatus(ArticleStatus.REJECTED);
    articleRepository.save(article);
    metaService.refreshCaches();
  }

  private ArticleEntity findArticle(String articleId) {
    return articleRepository.findById(articleId).orElseThrow(() -> new ApiException(404, "文章不存在"));
  }

  private AdminArticleReviewItemDto toReviewItem(ArticleEntity article) {
    return AdminArticleReviewItemDto.builder()
        .id(article.getId())
        .title(article.getTitle())
        .author(article.getAuthor().getName())
        .date(FORMATTER.format(article.getPublishDate()))
        .status(article.getStatus().name().toLowerCase(Locale.ROOT))
        .content(article.getContent())
        .build();
  }
}


