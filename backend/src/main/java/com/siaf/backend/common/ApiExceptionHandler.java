package com.siaf.backend.common;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, String>> handleValidacion(MethodArgumentNotValidException ex) {
    Map<String, String> errores = new LinkedHashMap<>();
    ex.getBindingResult()
        .getFieldErrors()
        .forEach(error -> errores.put(error.getField(), error.getDefaultMessage()));
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errores);
  }

  @ExceptionHandler(RecursoDuplicadoException.class)
  public ResponseEntity<Map<String, String>> handleDuplicado(RecursoDuplicadoException ex) {
    return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", ex.getMessage()));
  }

  @ExceptionHandler(RecursoNoEncontradoException.class)
  public ResponseEntity<Map<String, String>> handleNoEncontrado(RecursoNoEncontradoException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("mensaje", ex.getMessage()));
  }
}
