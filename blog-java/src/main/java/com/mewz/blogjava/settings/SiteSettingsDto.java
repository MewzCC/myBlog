package com.mewz.blogjava.settings;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SiteSettingsDto {

  private boolean enableGuestbook;
  private boolean enableUserEdit;
  private boolean enableSocials;
}

