package com.mewz.blogjava.meta;

import com.mewz.blogjava.article.ArticleEntity;
import com.mewz.blogjava.article.ArticleRepository;
import com.mewz.blogjava.article.ArticleStatus;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MetaService {

  private final ArticleRepository articleRepository;

  public List<CategoryDto> getCategories() {
    Map<String, Long> counts = approvedArticles().collect(Collectors.groupingBy(ArticleEntity::getCategory, Collectors.counting()));
    return counts.entrySet().stream()
        .map(entry -> new CategoryDto(entry.getKey(), humanize(entry.getKey()), entry.getValue()))
        .sorted(Comparator.comparing(CategoryDto::getCount).reversed())
        .toList();
  }

  public List<TagDto> getTags() {
    Map<String, Long> counts = approvedArticles()
        .flatMap(article -> article.getTags().stream())
        .collect(Collectors.groupingBy(tag -> tag, Collectors.counting()));
    return counts.entrySet().stream()
        .map(entry -> new TagDto(slugify(entry.getKey()), entry.getKey(), entry.getValue()))
        .sorted(Comparator.comparing(TagDto::getCount).reversed())
        .toList();
  }

  private java.util.stream.Stream<ArticleEntity> approvedArticles() {
    return articleRepository.findAll().stream().filter(article -> article.getStatus() == ArticleStatus.APPROVED);
  }

  private String humanize(String raw) {
    if (raw == null || raw.isBlank()) {
      return "Unknown";
    }
    return raw.substring(0, 1).toUpperCase(Locale.ROOT) + raw.substring(1);
  }

  private String slugify(String raw) {
    return raw.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-");
  }
}
