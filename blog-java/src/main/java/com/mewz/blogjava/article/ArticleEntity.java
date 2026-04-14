package com.mewz.blogjava.article;

import com.mewz.blogjava.common.BaseEntity;
import com.mewz.blogjava.user.UserAccount;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "articles")
public class ArticleEntity extends BaseEntity {

  @Id
  private String id = UUID.randomUUID().toString();

  @Column(nullable = false, length = 200)
  private String title;

  @Column(nullable = false, length = 500)
  private String summary;

  @Lob
  @Column(nullable = false, columnDefinition = "LONGTEXT")
  private String content;

  @Lob
  @Column(columnDefinition = "LONGTEXT")
  private String cover;

  @Column(nullable = false)
  private String category;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "article_tags", joinColumns = @JoinColumn(name = "article_id"))
  @Column(name = "tag_name")
  private Set<String> tags = new LinkedHashSet<>();

  @Column(nullable = false)
  private Instant publishDate;

  @Column(nullable = false)
  private long views = 0L;

  @Column(nullable = false)
  private long likes = 0L;

  @Column(nullable = false)
  private long favorites = 0L;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "author_id")
  private UserAccount author;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ArticleStatus status = ArticleStatus.APPROVED;
}

