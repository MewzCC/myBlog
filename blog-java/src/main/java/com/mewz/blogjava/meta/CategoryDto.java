package com.mewz.blogjava.meta;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CategoryDto {

  private String id;
  private String name;
  private long count;
}

