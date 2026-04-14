package com.mewz.blogjava.user;

import com.mewz.blogjava.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "users")
public class UserAccount extends BaseEntity {

  @Id
  private String id = UUID.randomUUID().toString();

  @Column(nullable = false, unique = true)
  private String email;

  @Column(nullable = false, unique = true)
  private String name;

  @Column(nullable = false)
  private String passwordHash;

  @Column(nullable = false, length = 500)
  private String avatar;

  @Lob
  private String bio;

  @Lob
  private String socialsJson;

  @Column(nullable = false)
  private String roles = "user";

  public List<String> getRoleList() {
    return Arrays.stream(roles.split(","))
        .map(String::trim)
        .filter(value -> !value.isBlank())
        .toList();
  }
}

