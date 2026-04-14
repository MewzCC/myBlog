package com.mewz.blogjava.video.mapper;

import com.mewz.blogjava.video.*;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VideoDanmakuRepository extends JpaRepository<VideoDanmakuEntity, String> {

  List<VideoDanmakuEntity> findByVideoKeyOrderByCreatedAtAsc(String videoKey);
}


