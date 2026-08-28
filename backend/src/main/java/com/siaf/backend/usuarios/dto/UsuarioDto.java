package com.siaf.backend.usuarios.dto;

import com.siaf.backend.usuarios.EstadoUsuario;
import com.siaf.backend.usuarios.PerfilUsuario;
import com.siaf.backend.usuarios.Usuario;
import java.time.LocalDate;

public record UsuarioDto(
    Long id,
    String username,
    String nombres,
    String apellidos,
    String correo,
    Long unidadId,
    String unidad,
    PerfilUsuario perfil,
    EstadoUsuario estado,
    LocalDate fechaAlta) {

  public static UsuarioDto de(Usuario usuario) {
    return new UsuarioDto(
        usuario.getId(),
        usuario.getUsername(),
        usuario.getNombres(),
        usuario.getApellidos(),
        usuario.getCorreo(),
        usuario.getUnidad().getId(),
        usuario.getUnidad().getNombre(),
        usuario.getPerfil(),
        usuario.getEstado(),
        usuario.getFechaAlta());
  }
}
