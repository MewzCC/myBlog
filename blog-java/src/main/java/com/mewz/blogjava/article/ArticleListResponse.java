package com.mewz.blogjava.article;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ArticleListResponse {

  private List<ArticleSummaryDto> list;
  private long total;
}
