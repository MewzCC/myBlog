package com.mewz.blogjava.comment.mapper;

import com.mewz.blogjava.comment.*;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentReactionRepository extends JpaRepository<CommentReactionEntity, String> {

  Optional<CommentReactionEntity> findByCommentIdAndUserId(String commentId, String userId);

  Optional<CommentReactionEntity> findByCommentIdAndVisitorId(String commentId, String visitorId);

  long countByCommentId(String commentId);
}


