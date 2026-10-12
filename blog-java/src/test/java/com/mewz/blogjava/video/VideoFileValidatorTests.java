package com.mewz.blogjava.video;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.mewz.blogjava.common.ApiException;
import com.mewz.blogjava.video.service.VideoFileValidator;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.util.unit.DataSize;

class VideoFileValidatorTests {

  private final VideoFileValidator validator = new VideoFileValidator(DataSize.ofMegabytes(100));
  private final byte[] mp4 = {0, 0, 0, 16, 'f', 't', 'y', 'p', 'i', 's', 'o', 'm', 0, 0, 0, 0};

  @Test
  void acceptsMp4AndWebmHeaders() {
    assertThat(validator.validate(file("video.MP4", "video/mp4", mp4))).isEqualTo("mp4");
    byte[] webm = {0x1a, 0x45, (byte) 0xdf, (byte) 0xa3, (byte) 0x87,
        0x42, (byte) 0x82, (byte) 0x84, 'w', 'e', 'b', 'm'};
    assertThat(validator.validate(file("video.webm", "video/webm", webm))).isEqualTo("webm");
  }

  @Test
  void rejectsActiveContentEvenWithForgedVideoMetadata() {
    assertThatThrownBy(() -> validator.validate(file("attack.html", "video/mp4", mp4)))
        .isInstanceOf(ApiException.class);
    assertThatThrownBy(() -> validator.validate(file("attack.mp4", "text/html", mp4)))
        .isInstanceOf(ApiException.class);
    assertThatThrownBy(() -> validator.validate(file("attack.mp4", "video/mp4", "<script>alert(1)</script>".getBytes())))
        .isInstanceOf(ApiException.class);
    assertThatThrownBy(() -> validator.validate(file("fake.webm", "video/webm", mp4)))
        .isInstanceOf(ApiException.class);
    byte[] avif = mp4.clone();
    System.arraycopy(new byte[]{'a', 'v', 'i', 'f'}, 0, avif, 8, 4);
    assertThatThrownBy(() -> validator.validate(file("image.mp4", "video/mp4", avif)))
        .isInstanceOf(ApiException.class);
  }

  @Test
  void rejectsMissingEmptyAndOversizedFiles() {
    assertThatThrownBy(() -> validator.validate(null)).isInstanceOf(ApiException.class);
    assertThatThrownBy(() -> validator.validate(file("video.mp4", "video/mp4", new byte[0])))
        .isInstanceOf(ApiException.class);
    VideoFileValidator smallLimit = new VideoFileValidator(DataSize.ofBytes(15));
    assertThatThrownBy(() -> smallLimit.validate(file("video.mp4", "video/mp4", mp4)))
        .isInstanceOf(ApiException.class).hasMessageContaining("大小限制");
  }

  private MockMultipartFile file(String name, String mime, byte[] content) {
    return new MockMultipartFile("file", name, mime, content);
  }
}
