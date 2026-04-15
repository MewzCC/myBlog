package com.mewz.blogjava.video.service;

import com.mewz.blogjava.video.*;
import com.mewz.blogjava.video.mapper.*;

import com.mewz.blogjava.common.ActorContext;
import com.mewz.blogjava.common.service.ActorService;
import com.mewz.blogjava.common.ApiException;
import com.mewz.blogjava.common.JsonHelper;
import com.mewz.blogjava.config.StorageProperties;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class VideoService {

  private static final String EVENT_QUEUE = "video:events:queue";
  private static final String VIDEO_KEYS = "video:analytics:keys";
  private static final Logger log = LoggerFactory.getLogger(VideoService.class);

  private final VideoAssetRepository videoAssetRepository;
  private final VideoDanmakuRepository videoDanmakuRepository;
  private final VideoEventRepository videoEventRepository;
  private final VideoAnalyticsRepository videoAnalyticsRepository;
  private final StorageProperties storageProperties;
  private final JsonHelper jsonHelper;
  private final StringRedisTemplate redisTemplate;
  private final ActorService actorService;

  @PostConstruct
  public void ensureUploadDir() throws IOException {
    Files.createDirectories(Paths.get(storageProperties.getUploadDir()));
  }

  @Transactional
  public VideoUploadResponse upload(MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new ApiException(400, "请选择要上传的视频文件");
    }
    try {
      String originalName = Optional.ofNullable(file.getOriginalFilename()).orElse("video.mp4");
      String safeName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
      String videoKey = "video_" + UUID.randomUUID().toString().replace("-", "");
      String storedFileName = videoKey + "-" + safeName;
      Path target = Paths.get(storageProperties.getUploadDir()).resolve(storedFileName);
      Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

      VideoAssetEntity entity = new VideoAssetEntity();
      entity.setVideoKey(videoKey);
      entity.setFilePath(target.toString());
      entity.setPublicUrl(storageProperties.getPublicPrefix() + storedFileName);
      entity.setMime(Optional.ofNullable(file.getContentType()).orElse("application/octet-stream"));
      entity.setSize(file.getSize());
      videoAssetRepository.save(entity);

      addVideoKeyToCache(videoKey);
      return new VideoUploadResponse(videoKey, entity.getPublicUrl(), entity.getMime(), entity.getSize(), entity.getPoster(), entity.getThumbnailsVtt());
    } catch (IOException ex) {
      throw new ApiException(500, "视频保存失败");
    }
  }

  public List<VideoDanmakuItemDto> getDanmaku(String videoKey) {
    return videoDanmakuRepository.findByVideoKeyOrderByCreatedAtAsc(videoKey).stream()
        .map(this::toDanmakuItem)
        .toList();
  }

  @Transactional
  public VideoDanmakuItemDto addDanmaku(String videoKey, VideoDanmakuItemDto payload, String visitorId) {
    ensureVideo(videoKey);
    ActorContext actor = actorService.getActor(visitorId);
    VideoDanmakuEntity entity = new VideoDanmakuEntity();
    entity.setVideoKey(videoKey);
    entity.setText(payload.getText());
    entity.setTimeInSeconds(payload.getTime());
    entity.setModeValue(payload.getMode());
    entity.setColor(payload.getColor());
    entity.setBorderEnabled(Boolean.TRUE.equals(payload.getBorder()));
    entity.setStyleJson(jsonHelper.toJson(payload.getStyle() == null ? Map.of() : payload.getStyle()));
    entity.setAnonymous(!actor.isAuthenticated());
    entity.setAuthorName(actor.isAuthenticated() ? actor.getUserName() : "匿名访客");
    entity.setAuthorAvatar(actor.getUserAvatar());
    if (actor.isAuthenticated()) {
      entity.setUserId(actor.getUserId());
    } else {
      entity.setVisitorId(actor.getVisitorId());
    }
    return toDanmakuItem(videoDanmakuRepository.save(entity));
  }

  public void bufferEvent(String videoKey, VideoEventPayload payload) {
    ensureVideo(videoKey);
    Map<String, Object> event = Map.of(
        "videoKey", videoKey,
        "viewerId", payload.getViewerId(),
        "event", payload.getEvent(),
        "at", payload.getAt(),
        "data", payload.getData() == null ? Map.of() : payload.getData(),
        "createdAt", Instant.now().toString());

    try {
      redisTemplate.opsForList().rightPush(EVENT_QUEUE, jsonHelper.toJson(event));
      redisTemplate.opsForSet().add(VIDEO_KEYS, videoKey);
      String analyticsKey = analyticsKey(videoKey);
      redisTemplate.opsForHash().increment(analyticsKey, "events", 1);
      redisTemplate.opsForHash().put(analyticsKey, "lastEventAt", String.valueOf(payload.getAt()));
      if ("play".equalsIgnoreCase(payload.getEvent())) {
        redisTemplate.opsForHash().increment(analyticsKey, "plays", 1);
        redisTemplate.opsForSet().add(uniqueViewersKey(videoKey), payload.getViewerId());
      }
    } catch (Exception ex) {
      log.debug("Redis is unavailable, persisting video event directly for {}", videoKey);
      persistEvent(event);
      refreshAnalyticsFromDatabase(videoKey);
    }
  }

  public List<VideoAnalyticsItemDto> getAnalytics() {
    Set<String> keys = new HashSet<>(videoAnalyticsRepository.findAll().stream().map(VideoAnalyticsEntity::getVideoKey).toList());
    try {
      Set<String> redisKeys = redisTemplate.opsForSet().members(VIDEO_KEYS);
      if (redisKeys != null) {
        keys.addAll(redisKeys);
      }
    } catch (Exception ex) {
      log.debug("Redis is unavailable while loading video analytics keys");
    }

    List<VideoAnalyticsItemDto> items = new ArrayList<>();
    for (String videoKey : keys) {
      VideoAnalyticsEntity persisted = videoAnalyticsRepository.findById(videoKey).orElseGet(() -> {
        VideoAnalyticsEntity entity = new VideoAnalyticsEntity();
        entity.setVideoKey(videoKey);
        return entity;
      });
      try {
        Map<Object, Object> hash = redisTemplate.opsForHash().entries(analyticsKey(videoKey));
        long plays = hash.containsKey("plays") ? Long.parseLong(String.valueOf(hash.get("plays"))) : persisted.getPlays();
        long events = hash.containsKey("events") ? Long.parseLong(String.valueOf(hash.get("events"))) : persisted.getEvents();
        long lastEventAt = hash.containsKey("lastEventAt") ? Long.parseLong(String.valueOf(hash.get("lastEventAt"))) : persisted.getLastEventAt();
        Long uniqueViewers = redisTemplate.opsForSet().size(uniqueViewersKey(videoKey));
        items.add(new VideoAnalyticsItemDto(videoKey, plays, uniqueViewers == null ? persisted.getUniqueViewers() : uniqueViewers, events, lastEventAt));
      } catch (Exception ex) {
        items.add(new VideoAnalyticsItemDto(
            videoKey,
            persisted.getPlays(),
            persisted.getUniqueViewers(),
            persisted.getEvents(),
            persisted.getLastEventAt()));
      }
    }
    return items;
  }

  @Scheduled(fixedDelay = 30000)
  @Transactional
  public void flushEventQueue() {
    String payload;
    Set<String> touched = new HashSet<>();
    try {
      while ((payload = redisTemplate.opsForList().leftPop(EVENT_QUEUE)) != null) {
        Map<String, Object> event = jsonHelper.readMap(payload);
        if (event.isEmpty()) {
          continue;
        }
        persistEvent(event);
        touched.add(String.valueOf(event.get("videoKey")));
      }
    } catch (Exception ex) {
      return;
    }

    for (String videoKey : touched) {
      refreshAnalyticsFromCache(videoKey);
    }
  }

  private void ensureVideo(String videoKey) {
    videoAssetRepository.findByVideoKey(videoKey)
        .orElseThrow(() -> new ApiException(404, "视频不存在"));
  }

  private VideoDanmakuItemDto toDanmakuItem(VideoDanmakuEntity entity) {
    return VideoDanmakuItemDto.builder()
        .text(entity.getText())
        .time(entity.getTimeInSeconds())
        .mode(entity.getModeValue())
        .color(entity.getColor())
        .border(entity.getBorderEnabled())
        .style(jsonHelper.readMap(entity.getStyleJson()))
        .user(VideoDanmakuUserDto.builder()
            .id(entity.getUserId() == null ? entity.getVisitorId() : entity.getUserId())
            .name(entity.getAuthorName())
            .avatar(entity.getAuthorAvatar())
            .anonymous(Boolean.TRUE.equals(entity.getAnonymous()))
            .build())
        .build();
  }

  private String analyticsKey(String videoKey) {
    return "video:analytics:" + videoKey;
  }

  private String uniqueViewersKey(String videoKey) {
    return "video:analytics:" + videoKey + ":viewers";
  }

  private void addVideoKeyToCache(String videoKey) {
    try {
      redisTemplate.opsForSet().add(VIDEO_KEYS, videoKey);
    } catch (Exception ex) {
      log.debug("Redis is unavailable while caching video key {}", videoKey);
    }
  }

  private void persistEvent(Map<String, Object> event) {
    VideoEventEntity entity = new VideoEventEntity();
    entity.setVideoKey(String.valueOf(event.get("videoKey")));
    entity.setViewerId(String.valueOf(event.get("viewerId")));
    entity.setEvent(String.valueOf(event.get("event")));
    entity.setEventAt(Long.parseLong(String.valueOf(event.get("at"))));
    entity.setDataJson(jsonHelper.toJson(event.get("data")));
    entity.setCreatedAt(Instant.parse(String.valueOf(event.get("createdAt"))));
    videoEventRepository.save(entity);
  }

  private void refreshAnalyticsFromCache(String videoKey) {
    try {
      VideoAnalyticsEntity analytics = videoAnalyticsRepository.findById(videoKey).orElseGet(() -> {
        VideoAnalyticsEntity entity = new VideoAnalyticsEntity();
        entity.setVideoKey(videoKey);
        return entity;
      });
      Map<Object, Object> hash = redisTemplate.opsForHash().entries(analyticsKey(videoKey));
      analytics.setPlays(hash.containsKey("plays") ? Long.parseLong(String.valueOf(hash.get("plays"))) : analytics.getPlays());
      analytics.setEvents(hash.containsKey("events") ? Long.parseLong(String.valueOf(hash.get("events"))) : analytics.getEvents());
      analytics.setLastEventAt(hash.containsKey("lastEventAt") ? Long.parseLong(String.valueOf(hash.get("lastEventAt"))) : analytics.getLastEventAt());
      Long uniqueViewers = redisTemplate.opsForSet().size(uniqueViewersKey(videoKey));
      analytics.setUniqueViewers(uniqueViewers == null ? analytics.getUniqueViewers() : uniqueViewers);
      videoAnalyticsRepository.save(analytics);
    } catch (Exception ex) {
      refreshAnalyticsFromDatabase(videoKey);
    }
  }

  private void refreshAnalyticsFromDatabase(String videoKey) {
    VideoAnalyticsEntity analytics = videoAnalyticsRepository.findById(videoKey).orElseGet(() -> {
      VideoAnalyticsEntity entity = new VideoAnalyticsEntity();
      entity.setVideoKey(videoKey);
      return entity;
    });
    analytics.setEvents(videoEventRepository.countByVideoKey(videoKey));
    analytics.setPlays(videoEventRepository.countByVideoKeyAndEvent(videoKey, "play"));
    analytics.setUniqueViewers(videoEventRepository.countDistinctViewerIdByVideoKey(videoKey));
    videoEventRepository.findAll().stream()
        .filter(item -> videoKey.equals(item.getVideoKey()))
        .mapToLong(VideoEventEntity::getEventAt)
        .max()
        .ifPresent(analytics::setLastEventAt);
    videoAnalyticsRepository.save(analytics);
  }
}


