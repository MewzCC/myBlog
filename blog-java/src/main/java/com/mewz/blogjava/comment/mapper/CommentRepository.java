package com.mewz.blogjava.comment.mapper;

import com.mewz.blogjava.comment.*;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<CommentEntity, String> {

  List<CommentEntity> findByArticleIdOrderByCreatedAtAsc(String articleId);

  List<CommentEntity> findByParentId(String parentId);

  long countByArticleId(String articleId);
}


