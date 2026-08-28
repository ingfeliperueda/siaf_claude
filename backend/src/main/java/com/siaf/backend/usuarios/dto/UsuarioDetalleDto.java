package com.siaf.backend.usuarios.dto;

import com.siaf.backend.usuarios.EstadoUsuario;
import com.siaf.backend.usuarios.PerfilUsuario;
import java.time.LocalDate;
import java.util.List;

public record UsuarioDetalleDto(
    Long id,
    String username,
    String nombres,
    String apellidos,
    String correo,
    Long unidadId,
    String unidad,
    PerfilUsuario perfil,
    EstadoUsuario estado,
    LocalDate fechaAlta,
    List<ActividadDto> actividadReciente) {

  public record ActividadDto(String fecha, String descripcion) {
  }
}
