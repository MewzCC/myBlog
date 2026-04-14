package com.mewz.blogjava.article.mapper;

import com.mewz.blogjava.article.*;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ArticleRepository extends JpaRepository<ArticleEntity, String> {

  List<ArticleEntity> findByStatusOrderByPublishDateDesc(ArticleStatus status);
}


