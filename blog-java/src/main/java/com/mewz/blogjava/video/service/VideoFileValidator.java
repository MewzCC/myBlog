package com.mewz.blogjava.video.service;

import com.mewz.blogjava.common.ApiException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.unit.DataSize;
import org.springframework.web.multipart.MultipartFile;

@Component
public class VideoFileValidator {

  private static final Set<String> MP4_BRANDS = Set.of("isom", "iso2", "iso3", "iso4", "iso5", "iso6",
      "mp41", "mp42", "avc1", "M4V ", "MSNV", "dash");
  private final DataSize maxFileSize;

  public VideoFileValidator(@Value("${spring.servlet.multipart.max-file-size:100MB}") DataSize maxFileSize) {
    this.maxFileSize = maxFileSize;
  }

  public String validate(MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new ApiException(400, "请选择要上传的视频文件");
    }
    if (file.getSize() > maxFileSize.toBytes()) {
      throw new ApiException(400, "视频文件超出大小限制");
    }
    String filename = file.getOriginalFilename();
    String extension = filename == null || !filename.contains(".") ? ""
        : filename.substring(filename.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    String expectedMime = switch (extension) {
      case "mp4" -> "video/mp4";
      case "webm" -> "video/webm";
      default -> throw new ApiException(400, "仅支持 MP4 或 WebM 视频");
    };
    if (!expectedMime.equalsIgnoreCase(file.getContentType())) {
      throw new ApiException(400, "视频扩展名与文件类型不匹配");
    }
    try (InputStream input = file.getInputStream()) {
      byte[] header = input.readNBytes(4096);
      boolean valid = extension.equals("mp4") ? isMp4(header, file.getSize()) : isWebm(header);
      if (!valid) {
        throw new ApiException(400, "文件内容不是有效的 MP4 或 WebM 视频");
      }
    } catch (IOException ex) {
      throw new ApiException(400, "无法读取视频文件");
    }
    return extension;
  }

  private boolean isMp4(byte[] header, long size) {
    if (header.length < 16 || !"ftyp".equals(new String(header, 4, 4, StandardCharsets.US_ASCII))) {
      return false;
    }
    long boxSize = ((header[0] & 255L) << 24) | ((header[1] & 255L) << 16)
        | ((header[2] & 255L) << 8) | (header[3] & 255L);
    return boxSize >= 16 && boxSize <= size
        && MP4_BRANDS.contains(new String(header, 8, 4, StandardCharsets.US_ASCII));
  }

  private boolean isWebm(byte[] header) {
    if (header.length < 4 || (header[0] & 255) != 0x1a || (header[1] & 255) != 0x45
        || (header[2] & 255) != 0xdf || (header[3] & 255) != 0xa3) {
      return false;
    }
    // EBML DocType element (0x4282), length 4, value "webm".
    byte[] docType = {0x42, (byte) 0x82, (byte) 0x84, 'w', 'e', 'b', 'm'};
    for (int offset = 4; offset <= header.length - docType.length; offset++) {
      boolean matches = true;
      for (int i = 0; i < docType.length; i++) {
        if (header[offset + i] != docType[i]) {
          matches = false;
          break;
        }
      }
      if (matches) return true;
    }
    return false;
  }
}
