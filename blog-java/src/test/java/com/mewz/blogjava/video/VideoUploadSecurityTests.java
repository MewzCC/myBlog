package com.mewz.blogjava.video;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mewz.blogjava.config.SecurityConfig;
import com.mewz.blogjava.security.AuthStateCacheService;
import com.mewz.blogjava.security.service.JwtService;
import com.mewz.blogjava.user.mapper.UserRepository;
import com.mewz.blogjava.video.controller.VideoController;
import com.mewz.blogjava.video.service.VideoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(VideoController.class)
@Import(SecurityConfig.class)
class VideoUploadSecurityTests {

  @Autowired private MockMvc mvc;
  @MockBean private VideoService videoService;
  @MockBean private JwtService jwtService;
  @MockBean private UserRepository userRepository;
  @MockBean private AuthStateCacheService authStateCacheService;

  private final MockMultipartFile file = new MockMultipartFile("file", "video.mp4", "video/mp4", new byte[]{1});

  @Test
  void deniesAnonymousUploads() throws Exception {
    mvc.perform(multipart("/api/upload/video").file(file)).andExpect(status().isForbidden());
    verifyNoInteractions(videoService);
  }

  @Test
  @WithMockUser(roles = "USER")
  void deniesRegularUserUploads() throws Exception {
    mvc.perform(multipart("/api/upload/video").file(file)).andExpect(status().isForbidden());
    verifyNoInteractions(videoService);
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void permitsAdminUploads() throws Exception {
    when(videoService.upload(any())).thenReturn(new VideoUploadResponse("video_test", "/uploads/video_test.mp4",
        "video/mp4", 1, null, null));
    mvc.perform(multipart("/api/upload/video").file(file)).andExpect(status().isOk());
    verify(videoService).upload(any());
  }
}
