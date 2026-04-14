package com.mewz.blogjava.comment;

import com.mewz.blogjava.article.ArticleEntity;
import com.mewz.blogjava.article.ArticleService;
import com.mewz.blogjava.auth.AuthService;
import com.mewz.blogjava.auth.UserDto;
import com.mewz.blogjava.common.ActorContext;
import com.mewz.blogjava.common.ActorService;
import com.mewz.blogjava.common.ApiException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentService {

  private final CommentRepository commentRepository;
  private final CommentReactionRepository commentReactionRepository;
  private final CommentReportRepository commentReportRepository;
  private final ArticleService articleService;
  private final ActorService actorService;
  private final AuthService authService;

  public List<CommentDto> getComments(String articleId) {
    List<CommentEntity> entities = commentRepository.findByArticleIdOrderByCreatedAtAsc(articleId);
    Map<String, List<CommentDto>> children = new HashMap<>();
    List<CommentDto> root = new ArrayList<>();

    for (CommentEntity entity : entities) {
      CommentDto dto = toDto(entity);
      if (entity.getParent() == null) {
        root.add(dto);
      } else {
        children.computeIfAbsent(entity.getParent().getId(), key -> new ArrayList<>()).add(dto);
      }
    }

    root.forEach(item -> attachReplies(item, children));
    root.sort(Comparator.comparing(CommentDto::getCreatedAt));
    return root;
  }

  @Transactional
  public CommentDto addComment(String articleId, CommentCreateRequest request, String visitorId) {
    ArticleEntity article = articleService.getEntity(articleId);
    ActorContext actor = actorService.getActor(visitorId);

    CommentEntity entity = new CommentEntity();
    entity.setArticle(article);
    entity.setContent(request.getContent().trim());
    if (request.getParentId() != null && !request.getParentId().isBlank()) {
      CommentEntity parent = commentRepository.findById(request.getParentId())
          .orElseThrow(() -> new ApiException(404, "Parent comment not found"));
      if (!parent.getArticle().getId().equals(articleId)) {
        throw new ApiException(400, "Parent comment does not belong to this article");
      }
      entity.setParent(parent);
    }
    if (actor.isAuthenticated()) {
      entity.setUser(authService.getAuthenticatedUser());
      entity.setVisitorId(null);
      entity.setAuthorName(actor.getUserName());
      entity.setAuthorAvatar(actor.getUserAvatar());
    } else {
      entity.setVisitorId(actor.getVisitorId());
      entity.setAuthorName("访客");
      entity.setAuthorAvatar(actor.getUserAvatar());
    }
    CommentEntity saved = commentRepository.save(entity);
    return toDto(saved);
  }

  @Transactional
  public CommentActionResponse toggleLike(String commentId, String visitorId) {
    CommentEntity comment = commentRepository.findById(commentId)
        .orElseThrow(() -> new ApiException(404, "Comment not found"));
    ActorContext actor = actorService.getActor(visitorId);
    CommentReactionEntity existing = actor.isAuthenticated()
        ? commentReactionRepository.findByCommentIdAndUserId(commentId, actor.getUserId()).orElse(null)
        : commentReactionRepository.findByCommentIdAndVisitorId(commentId, actor.getVisitorId()).orElse(null);

    boolean isLiked;
    if (existing != null) {
      commentReactionRepository.delete(existing);
      isLiked = false;
    } else {
      CommentReactionEntity entity = new CommentReactionEntity();
      entity.setComment(comment);
      if (actor.isAuthenticated()) {
        entity.setUserId(actor.getUserId());
      } else {
        entity.setVisitorId(actor.getVisitorId());
      }
      commentReactionRepository.save(entity);
      isLiked = true;
    }
    return new CommentActionResponse(commentReactionRepository.countByCommentId(commentId), isLiked);
  }

  @Transactional
  public void deleteComment(String commentId, String visitorId) {
    CommentEntity comment = commentRepository.findById(commentId)
        .orElseThrow(() -> new ApiException(404, "Comment not found"));
    ActorContext actor = actorService.getActor(visitorId);

    boolean canDelete = actor.isAuthenticated()
        ? actor.getUserId().equals(comment.getUser() == null ? null : comment.getUser().getId())
        : actor.getVisitorId().equals(comment.getVisitorId());
    if (!canDelete && !actor.isAdmin()) {
      throw new ApiException(403, "You cannot delete this comment");
    }
    deleteRecursively(comment);
  }

  @Transactional
  public void reportComment(String commentId, String visitorId) {
    CommentEntity comment = commentRepository.findById(commentId)
        .orElseThrow(() -> new ApiException(404, "Comment not found"));
    ActorContext actor = actorService.getActor(visitorId);
    boolean exists = actor.isAuthenticated()
        ? commentReportRepository.findByCommentIdAndUserId(commentId, actor.getUserId()).isPresent()
        : commentReportRepository.findByCommentIdAndVisitorId(commentId, actor.getVisitorId()).isPresent();
    if (exists) {
      return;
    }
    CommentReportEntity report = new CommentReportEntity();
    report.setComment(comment);
    if (actor.isAuthenticated()) {
      report.setUserId(actor.getUserId());
    } else {
      report.setVisitorId(actor.getVisitorId());
    }
    commentReportRepository.save(report);
  }

  private void attachReplies(CommentDto parent, Map<String, List<CommentDto>> children) {
    List<CommentDto> replies = children.getOrDefault(parent.getId(), List.of());
    replies.forEach(item -> attachReplies(item, children));
    parent.setReplies(replies);
  }

  private CommentDto toDto(CommentEntity entity) {
    UserDto user = UserDto.builder()
        .id(entity.getUser() == null ? entity.getVisitorId() : entity.getUser().getId())
        .name(entity.getAuthorName())
        .avatar(entity.getAuthorAvatar())
        .build();
    return CommentDto.builder()
        .id(entity.getId())
        .content(entity.getContent())
        .createdAt(entity.getCreatedAt())
        .user(user)
        .likes(commentReactionRepository.countByCommentId(entity.getId()))
        .replies(new ArrayList<>())
        .build();
  }

  private void deleteRecursively(CommentEntity comment) {
    for (CommentEntity child : commentRepository.findByParentId(comment.getId())) {
      deleteRecursively(child);
    }
    commentRepository.delete(comment);
  }
}
