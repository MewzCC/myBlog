package com.mewz.blogjava.settings;

import com.mewz.blogjava.settings.service.SiteSettingsService;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class SiteSettingsServiceTests {

  @Autowired
  private SiteSettingsService siteSettingsService;

  @Test
  void updatesSettings() {
    UpdateSiteSettingsRequest request = new UpdateSiteSettingsRequest();
    request.setEnableGuestbook(false);
    request.setEnableUserEdit(true);
    request.setEnableSocials(false);

    SiteSettingsDto updated = siteSettingsService.update(request);

    assertThat(updated.isEnableGuestbook()).isFalse();
    assertThat(updated.isEnableUserEdit()).isTrue();
    assertThat(updated.isEnableSocials()).isFalse();
  }
}

