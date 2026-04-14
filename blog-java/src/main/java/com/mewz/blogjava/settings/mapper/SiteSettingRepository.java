package com.mewz.blogjava.settings.mapper;

import com.mewz.blogjava.settings.*;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SiteSettingRepository extends JpaRepository<SiteSetting, Long> {
}


