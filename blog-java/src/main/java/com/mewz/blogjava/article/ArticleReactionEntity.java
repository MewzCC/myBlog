package com.mewz.blogjava.article;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "article_reactions")
public class ArticleReactionEntity {

  @Id
  private String id = UUID.randomUUID().toString();

  @ManyToOne(optional = false)
  @JoinColumn(name = "article_id")
  private ArticleEntity article;

  @Column(nullable = false)
  private String reactionType;

  private String userId;

  private String visitorId;

  @Column(nullable = false)
  private Instant createdAt = Instant.now();
}
