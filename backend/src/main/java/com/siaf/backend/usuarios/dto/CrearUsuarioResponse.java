package com.siaf.backend.usuarios.dto;

import com.siaf.backend.usuarios.EstadoUsuario;

public record CrearUsuarioResponse(Long id, String username, EstadoUsuario estado) {
}
