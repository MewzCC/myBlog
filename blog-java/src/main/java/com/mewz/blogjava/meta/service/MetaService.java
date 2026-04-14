package com.mewz.blogjava.meta.service;

import com.mewz.blogjava.meta.*;

import com.mewz.blogjava.article.ArticleEntity;
import com.mewz.blogjava.article.mapper.ArticleRepository;
import com.mewz.blogjava.article.ArticleStatus;
import com.mewz.blogjava.common.JsonHelper;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MetaService {

  private static final Logger log = LoggerFactory.getLogger(MetaService.class);
  private static final String CATEGORY_CACHE_KEY = "blog:meta:categories";
  private static final String TAG_CACHE_KEY = "blog:meta:tags";

  private final ArticleRepository articleRepository;
  private final StringRedisTemplate redisTemplate;
  private final JsonHelper jsonHelper;

  @Transactional(readOnly = true)
  public List<CategoryDto> getCategories() {
    List<CategoryDto> cached = readCategoryCache();
    if (!cached.isEmpty()) {
      return cached;
    }
    Map<String, Long> counts = approvedArticles().collect(Collectors.groupingBy(ArticleEntity::getCategory, Collectors.counting()));
    List<CategoryDto> categories = counts.entrySet().stream()
        .map(entry -> new CategoryDto(entry.getKey(), humanize(entry.getKey()), entry.getValue()))
        .sorted(Comparator.comparing(CategoryDto::getCount).reversed())
        .toList();
    writeCache(CATEGORY_CACHE_KEY, categories);
    return categories;
  }

  @Transactional(readOnly = true)
  public List<TagDto> getTags() {
    List<TagDto> cached = readTagCache();
    if (!cached.isEmpty()) {
      return cached;
    }
    Map<String, Long> counts = approvedArticles()
        .flatMap(article -> article.getTags().stream())
        .collect(Collectors.groupingBy(tag -> tag, Collectors.counting()));
    List<TagDto> tags = counts.entrySet().stream()
        .map(entry -> new TagDto(slugify(entry.getKey()), entry.getKey(), entry.getValue()))
        .sorted(Comparator.comparing(TagDto::getCount).reversed())
        .toList();
    writeCache(TAG_CACHE_KEY, tags);
    return tags;
  }

  public void refreshCaches() {
    writeCache(CATEGORY_CACHE_KEY, computeCategories());
    writeCache(TAG_CACHE_KEY, computeTags());
  }

  private List<CategoryDto> computeCategories() {
    Map<String, Long> counts = approvedArticles().collect(Collectors.groupingBy(ArticleEntity::getCategory, Collectors.counting()));
    return counts.entrySet().stream()
        .map(entry -> new CategoryDto(entry.getKey(), humanize(entry.getKey()), entry.getValue()))
        .sorted(Comparator.comparing(CategoryDto::getCount).reversed())
        .toList();
  }

  private List<TagDto> computeTags() {
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
      return "未分类";
    }
    return raw;
  }

  private String slugify(String raw) {
    if (raw == null || raw.isBlank()) {
      return "untitled";
    }
    return raw.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", "-");
  }

  private List<CategoryDto> readCategoryCache() {
    try {
      return jsonHelper.readList(redisTemplate.opsForValue().get(CATEGORY_CACHE_KEY), CategoryDto.class);
    } catch (Exception ex) {
      log.debug("Redis unavailable while reading categories cache");
      return List.of();
    }
  }

  private List<TagDto> readTagCache() {
    try {
      return jsonHelper.readList(redisTemplate.opsForValue().get(TAG_CACHE_KEY), TagDto.class);
    } catch (Exception ex) {
      log.debug("Redis unavailable while reading tags cache");
      return List.of();
    }
  }

  private void writeCache(String key, Object value) {
    try {
      redisTemplate.opsForValue().set(key, jsonHelper.toJson(value));
    } catch (Exception ex) {
      log.debug("Redis unavailable while writing meta cache {}", key);
    }
  }
}
