package com.mewz.blogjava.video;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VideoAssetRepository extends JpaRepository<VideoAssetEntity, String> {

  Optional<VideoAssetEntity> findByVideoKey(String videoKey);
}
