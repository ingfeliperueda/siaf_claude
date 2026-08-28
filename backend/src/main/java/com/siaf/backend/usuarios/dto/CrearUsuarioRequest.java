package com.siaf.backend.usuarios.dto;

import com.siaf.backend.usuarios.PerfilUsuario;
import com.siaf.backend.usuarios.TipoDocumento;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CrearUsuarioRequest(
    @NotBlank String nombres,
    @NotBlank String apellidos,
    @NotNull TipoDocumento tipoDocumento,
    @NotBlank String numeroDocumento,
    @NotBlank @Email String correo,
    @NotNull Long unidadId,
    @NotNull PerfilUsuario perfil,
    @NotBlank @Size(min = 10) String clave) {
}
