package com.mewz.blogjava.guestbook.service;

import com.mewz.blogjava.guestbook.*;
import com.mewz.blogjava.guestbook.mapper.GuestbookMessageRepository;

import com.mewz.blogjava.auth.service.AuthService;
import com.mewz.blogjava.auth.UserDto;
import com.mewz.blogjava.common.ActorContext;
import com.mewz.blogjava.common.service.ActorService;
import com.mewz.blogjava.common.ApiException;
import com.mewz.blogjava.settings.service.SiteSettingsService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GuestbookService {

  private final GuestbookMessageRepository repository;
  private final ActorService actorService;
  private final SiteSettingsService siteSettingsService;
  private final AuthService authService;

  @Transactional(readOnly = true)
  public List<GuestbookMessageDto> getMessages() {
    return repository.findAllByOrderByCreatedAtDesc().stream().map(this::toDto).toList();
  }

  @Transactional
  public GuestbookMessageDto createMessage(GuestbookCreateRequest request, String visitorId) {
    if (!siteSettingsService.getSettings().isEnableGuestbook()) {
      throw new ApiException(403, "Guestbook is disabled");
    }
    ActorContext actor = actorService.getActor(visitorId);
    GuestbookMessageEntity entity = new GuestbookMessageEntity();
    entity.setContent(request.getContent().trim());
    entity.setAuthorName(actor.isAuthenticated() ? actor.getUserName() : "Visitor");
    entity.setAuthorAvatar(actor.getUserAvatar());
    if (actor.isAuthenticated()) {
      entity.setUser(authService.getAuthenticatedUser());
      entity.setVisitorId(null);
    } else {
      entity.setVisitorId(actor.getVisitorId());
    }
    return toDto(repository.save(entity));
  }

  private GuestbookMessageDto toDto(GuestbookMessageEntity entity) {
    return GuestbookMessageDto.builder()
        .id(entity.getId())
        .content(entity.getContent())
        .createdAt(entity.getCreatedAt())
        .user(UserDto.builder()
            .id(entity.getUser() == null ? entity.getVisitorId() : entity.getUser().getId())
            .name(entity.getAuthorName())
            .avatar(entity.getAuthorAvatar())
            .build())
        .build();
  }
}


