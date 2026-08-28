package com.siaf.backend.common;

import java.util.List;
import org.springframework.data.domain.Page;

public record PageResponse<T>(List<T> content, long totalElements, int totalPages) {

  public static <T> PageResponse<T> de(Page<T> pagina) {
    return new PageResponse<>(pagina.getContent(), pagina.getTotalElements(), pagina.getTotalPages());
  }
}
