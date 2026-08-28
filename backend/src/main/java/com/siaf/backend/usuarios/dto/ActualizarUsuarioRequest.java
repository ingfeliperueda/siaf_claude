package com.siaf.backend.usuarios.dto;

import com.siaf.backend.usuarios.EstadoUsuario;
import com.siaf.backend.usuarios.PerfilUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ActualizarUsuarioRequest(
    @NotBlank String nombres,
    @NotBlank String apellidos,
    @NotBlank @Email String correo,
    @NotNull Long unidadId,
    @NotNull PerfilUsuario perfil,
    @NotNull EstadoUsuario estado) {
}
