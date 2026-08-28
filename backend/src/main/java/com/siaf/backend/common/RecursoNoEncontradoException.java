package com.siaf.backend.common;

public class RecursoNoEncontradoException extends RuntimeException {

  public RecursoNoEncontradoException(String mensaje) {
    super(mensaje);
  }
}
