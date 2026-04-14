package com.mewz.blogjava.article.mapper;

import com.mewz.blogjava.article.*;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ArticleReactionRepository extends JpaRepository<ArticleReactionEntity, String> {

  Optional<ArticleReactionEntity> findByArticleIdAndReactionTypeAndUserId(String articleId, String reactionType, String userId);

  Optional<ArticleReactionEntity> findByArticleIdAndReactionTypeAndVisitorId(String articleId, String reactionType, String visitorId);

  long countByArticleIdAndReactionType(String articleId, String reactionType);
}


