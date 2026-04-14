package com.mewz.blogjava.admin;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminArticleReviewItemDto {

  private String id;
  private String title;
  private String author;
  private String date;
  private String status;
  private String content;
}
