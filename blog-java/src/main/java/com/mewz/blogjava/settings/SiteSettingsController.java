package com.mewz.blogjava.settings;

import com.mewz.blogjava.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class SiteSettingsController {

  private final SiteSettingsService siteSettingsService;

  @GetMapping("/api/site/settings")
  public ApiResponse<SiteSettingsDto> getSettings() {
    return ApiResponse.success(siteSettingsService.getSettings());
  }

  @GetMapping("/api/admin/settings")
  public ApiResponse<SiteSettingsDto> getAdminSettings() {
    return ApiResponse.success(siteSettingsService.getSettings());
  }

  @PutMapping("/api/admin/settings")
  public ApiResponse<SiteSettingsDto> update(@Valid @RequestBody UpdateSiteSettingsRequest request) {
    return ApiResponse.success(siteSettingsService.update(request));
  }
}
