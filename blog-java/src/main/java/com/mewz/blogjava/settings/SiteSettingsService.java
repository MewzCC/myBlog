package com.mewz.blogjava.settings;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SiteSettingsService {

  private final SiteSettingRepository repository;

  public SiteSettingsDto getSettings() {
    SiteSetting entity = getOrCreate();
    return new SiteSettingsDto(entity.isEnableGuestbook(), entity.isEnableUserEdit(), entity.isEnableSocials());
  }

  @Transactional
  public SiteSettingsDto update(UpdateSiteSettingsRequest request) {
    SiteSetting entity = getOrCreate();
    entity.setEnableGuestbook(request.isEnableGuestbook());
    entity.setEnableUserEdit(request.isEnableUserEdit());
    entity.setEnableSocials(request.isEnableSocials());
    repository.save(entity);
    return getSettings();
  }

  private SiteSetting getOrCreate() {
    return repository.findById(1L).orElseGet(() -> repository.save(new SiteSetting()));
  }
}
