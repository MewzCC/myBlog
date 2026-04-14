package com.mewz.blogjava.video.mapper;

import com.mewz.blogjava.video.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface VideoEventRepository extends JpaRepository<VideoEventEntity, String> {

  long countByVideoKey(String videoKey);

  long countByVideoKeyAndEvent(String videoKey, String event);

  @Query("select count(distinct e.viewerId) from VideoEventEntity e where e.videoKey = :videoKey")
  long countDistinctViewerIdByVideoKey(String videoKey);
}


