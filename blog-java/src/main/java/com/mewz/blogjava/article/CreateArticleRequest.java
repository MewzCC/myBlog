package com.mewz.blogjava.article;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.Data;

@Data
public class CreateArticleRequest {

  @NotBlank(message = "Title is required")
  private String title;

  @NotBlank(message = "Content is required")
  private String content;

  @NotBlank(message = "Summary is required")
  private String summary;

  private String cover;

  @NotBlank(message = "Category is required")
  private String category;

  @NotEmpty(message = "Tags are required")
  private List<String> tags;
}
