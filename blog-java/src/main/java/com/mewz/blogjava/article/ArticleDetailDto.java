package com.mewz.blogjava.article;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class ArticleDetailDto extends ArticleSummaryDto {

  private String content;
  private long favorites;
  private boolean isLiked;
  private boolean isFavorited;
}
