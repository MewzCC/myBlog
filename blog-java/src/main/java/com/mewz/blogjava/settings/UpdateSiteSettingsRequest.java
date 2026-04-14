package com.mewz.blogjava.settings;

import lombok.Data;

@Data
public class UpdateSiteSettingsRequest {

  private boolean enableGuestbook;
  private boolean enableUserEdit;
  private boolean enableSocials;
}

