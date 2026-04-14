package com.mewz.blogjava.comment;

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
@Table(name = "comment_reports")
public class CommentReportEntity {

  @Id
  private String id = UUID.randomUUID().toString();

  @ManyToOne(optional = false)
  @JoinColumn(name = "comment_id")
  private CommentEntity comment;

  private String userId;

  private String visitorId;

  @Column(nullable = false)
  private Instant createdAt = Instant.now();
}

