package com.mewz.blogjava.article.service;

import com.mewz.blogjava.article.*;
import com.mewz.blogjava.article.mapper.*;

import com.mewz.blogjava.auth.service.AuthService;
import com.mewz.blogjava.auth.UserDto;
import com.mewz.blogjava.comment.mapper.CommentRepository;
import com.mewz.blogjava.common.ActorContext;
import com.mewz.blogjava.common.service.ActorService;
import com.mewz.blogjava.common.ApiException;
import com.mewz.blogjava.meta.service.MetaService;
import com.mewz.blogjava.user.UserAccount;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ArticleService {

  private final ArticleRepository articleRepository;
  private final ArticleReactionRepository articleReactionRepository;
  private final CommentRepository commentRepository;
  private final AuthService authService;
  private final ActorService actorService;
  private final MetaService metaService;

  @Transactional(readOnly = true)
  public ArticleListResponse getArticles(
      Integer page,
      Integer pageSize,
      String keyword,
      String category,
      String tag,
      boolean includeAllStatuses) {
    int safePage = page == null || page < 1 ? 1 : page;
    int safePageSize = pageSize == null || pageSize < 1 ? 10 : pageSize;

    Stream<ArticleEntity> stream = articleRepository.findAll().stream();
    if (!includeAllStatuses) {
      stream = stream.filter(article -> article.getStatus() == ArticleStatus.APPROVED);
    }
    if (keyword != null && !keyword.isBlank()) {
      String normalized = keyword.trim().toLowerCase(Locale.ROOT);
      stream = stream.filter(article ->
          article.getTitle().toLowerCase(Locale.ROOT).contains(normalized)
              || article.getSummary().toLowerCase(Locale.ROOT).contains(normalized)
              || article.getContent().toLowerCase(Locale.ROOT).contains(normalized));
    }
    if (category != null && !category.isBlank()) {
      String normalized = category.trim().toLowerCase(Locale.ROOT);
      stream = stream.filter(article ->
          article.getCategory().toLowerCase(Locale.ROOT).equals(normalized)
              || article.getCategory().replace("-", "").equalsIgnoreCase(normalized));
    }
    if (tag != null && !tag.isBlank()) {
      String normalized = tag.trim().toLowerCase(Locale.ROOT);
      stream = stream.filter(article -> article.getTags().stream()
          .map(value -> value.toLowerCase(Locale.ROOT))
          .anyMatch(value -> value.equals(normalized)));
    }

    List<ArticleEntity> filtered = stream
        .sorted(Comparator.comparing(ArticleEntity::getPublishDate).reversed())
        .toList();

    int fromIndex = Math.min((safePage - 1) * safePageSize, filtered.size());
    int toIndex = Math.min(fromIndex + safePageSize, filtered.size());
    List<ArticleSummaryDto> list = filtered.subList(fromIndex, toIndex).stream()
        .map(this::toSummary)
        .toList();
    return new ArticleListResponse(list, filtered.size());
  }

  @Transactional
  public ArticleDetailDto getArticleDetail(String id, String visitorId) {
    ArticleEntity article = articleRepository.findById(id)
        .orElseThrow(() -> new ApiException(404, "Article not found"));
    if (article.getStatus() != ArticleStatus.APPROVED && !isAdmin()) {
      throw new ApiException(404, "Article not found");
    }

    article.setViews(article.getViews() + 1);

    ActorContext actor = actorService.getActor(visitorId);
    ArticleDetailDto detail = toDetail(article, actor);
    detail.setViews(article.getViews());
    return detail;
  }

  @Transactional
  public ArticleDetailDto createArticle(CreateArticleRequest request) {
    UserAccount author = authService.getAuthenticatedUser();
    ArticleEntity article = new ArticleEntity();
    article.setTitle(request.getTitle().trim());
    article.setSummary(request.getSummary().trim());
    article.setContent(request.getContent());
    article.setCover(request.getCover());
    article.setCategory(request.getCategory().trim().toLowerCase(Locale.ROOT));
    article.setTags(Set.copyOf(request.getTags().stream().map(String::trim).filter(value -> !value.isBlank()).toList()));
    article.setPublishDate(Instant.now());
    article.setAuthor(author);
    article.setStatus(author.getRoleList().contains("admin") ? ArticleStatus.APPROVED : ArticleStatus.PENDING);
    articleRepository.save(article);
    metaService.refreshCaches();
    return toDetail(article, actorService.getActor(null));
  }

  @Transactional
  public ArticleReactionResult toggleLike(String articleId, String visitorId) {
    return toggleReaction(articleId, "like", visitorId);
  }

  @Transactional
  public ArticleFavoriteResult toggleFavorite(String articleId, String visitorId) {
    ArticleReactionResult result = toggleReaction(articleId, "favorite", visitorId);
    return new ArticleFavoriteResult(result.count(), result.active());
  }

  @Transactional(readOnly = true)
  public ArticleEntity getEntity(String id) {
    return articleRepository.findById(id).orElseThrow(() -> new ApiException(404, "Article not found"));
  }

  public ArticleSummaryDto toSummary(ArticleEntity article) {
    UserDto author = authService.toUserDto(article.getAuthor());
    return ArticleSummaryDto.builder()
        .id(article.getId())
        .title(article.getTitle())
        .summary(article.getSummary())
        .cover(article.getCover())
        .publishDate(article.getPublishDate())
        .views(article.getViews())
        .likes(article.getLikes())
        .comments(commentRepository.countByArticleId(article.getId()))
        .tags(article.getTags().stream().toList())
        .category(article.getCategory())
        .author(author)
        .status(article.getStatus().name().toLowerCase(Locale.ROOT))
        .build();
  }

  public ArticleDetailDto toDetail(ArticleEntity article, ActorContext actor) {
    long likes = articleReactionRepository.countByArticleIdAndReactionType(article.getId(), "like");
    long favorites = articleReactionRepository.countByArticleIdAndReactionType(article.getId(), "favorite");
    article.setLikes(likes);
    article.setFavorites(favorites);
    articleRepository.save(article);

    boolean liked = hasReaction(article.getId(), "like", actor);
    boolean favorited = hasReaction(article.getId(), "favorite", actor);

    return ArticleDetailDto.builder()
        .id(article.getId())
        .title(article.getTitle())
        .summary(article.getSummary())
        .cover(article.getCover())
        .publishDate(article.getPublishDate())
        .views(article.getViews())
        .likes(likes)
        .comments(commentRepository.countByArticleId(article.getId()))
        .tags(article.getTags().stream().toList())
        .category(article.getCategory())
        .author(authService.toUserDto(article.getAuthor()))
        .status(article.getStatus().name().toLowerCase(Locale.ROOT))
        .content(article.getContent())
        .favorites(favorites)
        .isLiked(liked)
        .isFavorited(favorited)
        .build();
  }

  private ArticleReactionResult toggleReaction(String articleId, String type, String visitorId) {
    ArticleEntity article = getEntity(articleId);
    ActorContext actor = actorService.getActor(visitorId);

    ArticleReactionEntity existing = findReaction(articleId, type, actor);
    boolean active;
    if (existing != null) {
      articleReactionRepository.delete(existing);
      active = false;
    } else {
      ArticleReactionEntity entity = new ArticleReactionEntity();
      entity.setArticle(article);
      entity.setReactionType(type);
      if (actor.isAuthenticated()) {
        entity.setUserId(actor.getUserId());
      } else {
        entity.setVisitorId(actor.getVisitorId());
      }
      articleReactionRepository.save(entity);
      active = true;
    }

    long count = articleReactionRepository.countByArticleIdAndReactionType(articleId, type);
    if ("like".equals(type)) {
      article.setLikes(count);
    } else {
      article.setFavorites(count);
    }
    articleRepository.save(article);
    return new ArticleReactionResult(count, active);
  }

  private boolean hasReaction(String articleId, String type, ActorContext actor) {
    return findReaction(articleId, type, actor) != null;
  }

  private ArticleReactionEntity findReaction(String articleId, String type, ActorContext actor) {
    if (actor.isAuthenticated()) {
      return articleReactionRepository.findByArticleIdAndReactionTypeAndUserId(articleId, type, actor.getUserId()).orElse(null);
    }
    return articleReactionRepository.findByArticleIdAndReactionTypeAndVisitorId(articleId, type, actor.getVisitorId()).orElse(null);
  }

  private boolean isAdmin() {
    try {
      return authService.getAuthenticatedUser().getRoleList().contains("admin");
    } catch (ApiException ignored) {
      return false;
    }
  }

  public record ArticleReactionResult(long count, boolean active) {
  }

  public record ArticleFavoriteResult(long favorites, boolean isFavorited) {
  }
}


