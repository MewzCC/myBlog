package com.mewz.blogjava.meta;

import com.mewz.blogjava.common.ApiResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/meta")
@RequiredArgsConstructor
public class MetaController {

  private final MetaService metaService;

  @GetMapping("/categories")
  public ApiResponse<List<CategoryDto>> categories() {
    return ApiResponse.success(metaService.getCategories());
  }

  @GetMapping("/tags")
  public ApiResponse<List<TagDto>> tags() {
    return ApiResponse.success(metaService.getTags());
  }
}
