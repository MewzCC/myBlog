package com.mewz.blogjava.guestbook;

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
@Table(name = "guestbook_messages")
public class GuestbookMessageEntity extends BaseEntity {

  @Id
  private String id = UUID.randomUUID().toString();

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
