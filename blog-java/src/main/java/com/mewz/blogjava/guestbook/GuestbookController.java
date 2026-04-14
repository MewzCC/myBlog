package com.mewz.blogjava.guestbook;

import com.mewz.blogjava.common.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/guestbook/messages")
@RequiredArgsConstructor
public class GuestbookController {

  private final GuestbookService guestbookService;

  @GetMapping
  public ApiResponse<List<GuestbookMessageDto>> list() {
    return ApiResponse.success(guestbookService.getMessages());
  }

  @PostMapping
  public ApiResponse<GuestbookMessageDto> create(
      @Valid @RequestBody GuestbookCreateRequest request,
      @RequestHeader(value = "X-Visitor-Id", required = false) String visitorId) {
    return ApiResponse.success(guestbookService.createMessage(request, visitorId));
  }
}
