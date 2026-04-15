package com.mewz.blogjava.article;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.Data;

@Data
public class CreateArticleRequest {

  @NotBlank(message = "请输入文章标题")
  private String title;

  @NotBlank(message = "请输入文章内容")
  private String content;

  @NotBlank(message = "请输入文章摘要")
  private String summary;

  private String cover;

  @NotBlank(message = "请选择文章分类")
  private String category;

  @NotEmpty(message = "请至少填写一个标签")
  private List<String> tags;
}

