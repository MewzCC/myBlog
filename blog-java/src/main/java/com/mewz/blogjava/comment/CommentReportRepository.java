package com.mewz.blogjava.comment;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentReportRepository extends JpaRepository<CommentReportEntity, String> {

  Optional<CommentReportEntity> findByCommentIdAndUserId(String commentId, String userId);

  Optional<CommentReportEntity> findByCommentIdAndVisitorId(String commentId, String visitorId);
}
