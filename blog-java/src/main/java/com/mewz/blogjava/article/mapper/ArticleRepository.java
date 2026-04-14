package com.mewz.blogjava.article.mapper;

import com.mewz.blogjava.article.*;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ArticleRepository extends JpaRepository<ArticleEntity, String> {

  @EntityGraph(attributePaths = {"author", "tags"})
  List<ArticleEntity> findAll();

  @EntityGraph(attributePaths = {"author", "tags"})
  Optional<ArticleEntity> findById(String id);

  List<ArticleEntity> findByStatusOrderByPublishDateDesc(ArticleStatus status);

  long countByAuthorIdAndStatus(String authorId, ArticleStatus status);

  @EntityGraph(attributePaths = "tags")
  List<ArticleEntity> findByAuthorIdAndStatus(String authorId, ArticleStatus status);
}


