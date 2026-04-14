package com.mewz.blogjava.article;

import com.mewz.blogjava.auth.UserDto;
import java.time.Instant;
import java.util.List;
import lombok.Data;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
public class ArticleSummaryDto {

  private String id;
  private String title;
  private String summary;
  private String cover;
  private Instant publishDate;
  private long views;
  private long likes;
  private long comments;
  private List<String> tags;
  private String category;
  private UserDto author;
  private String status;
}

