package com.mewz.blogjava.comment;

import com.mewz.blogjava.article.ArticleEntity;
import com.mewz.blogjava.common.BaseEntity;
import com.mewz.blogjava.user.UserAccount;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "comments")
public class CommentEntity extends BaseEntity {

  @Id
  private String id = UUID.randomUUID().toString();

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "article_id")
  private ArticleEntity article;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "parent_id")
  private CommentEntity parent;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private UserAccount user;

  private String visitorId;

  @Column(nullable = false)
  private String authorName;

  @Column(nullable = false, length = 500)
  private String authorAvatar;

  @Lob
  @Column(nullable = false)
  private String content;
}

