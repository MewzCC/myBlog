package com.mewz.blogjava.article.mapper;

import com.mewz.blogjava.article.*;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ArticleRepository extends JpaRepository<ArticleEntity, String>, JpaSpecificationExecutor<ArticleEntity> {

  // Fetch only the to-one relation here: fetching tags would paginate in memory.
  @EntityGraph(attributePaths = "author")
  Page<ArticleEntity> findAll(Specification<ArticleEntity> specification, Pageable pageable);

  @EntityGraph(attributePaths = {"author", "tags"})
  List<ArticleEntity> findAll();

  @EntityGraph(attributePaths = {"author", "tags"})
  Optional<ArticleEntity> findById(String id);

  List<ArticleEntity> findByStatusOrderByPublishDateDesc(ArticleStatus status);

  long countByAuthorIdAndStatus(String authorId, ArticleStatus status);

  @EntityGraph(attributePaths = "tags")
  List<ArticleEntity> findByAuthorIdAndStatus(String authorId, ArticleStatus status);
}


