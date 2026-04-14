package com.mewz.blogjava.settings;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "site_settings")
public class SiteSetting {

  @Id
  private Long id = 1L;

  @Column(nullable = false)
  private boolean enableGuestbook = true;

  @Column(nullable = false)
  private boolean enableUserEdit = false;

  @Column(nullable = false)
  private boolean enableSocials = true;
}
