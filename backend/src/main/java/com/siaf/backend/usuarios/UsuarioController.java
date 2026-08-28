package com.siaf.backend.usuarios;

import com.siaf.backend.common.PageResponse;
import com.siaf.backend.usuarios.dto.ActualizarUsuarioRequest;
import com.siaf.backend.usuarios.dto.ActualizarUsuarioResponse;
import com.siaf.backend.usuarios.dto.CrearUsuarioRequest;
import com.siaf.backend.usuarios.dto.CrearUsuarioResponse;
import com.siaf.backend.usuarios.dto.SugerenciaUsernameDto;
import com.siaf.backend.usuarios.dto.UsuarioDetalleDto;
import com.siaf.backend.usuarios.dto.UsuarioDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
@PreAuthorize("hasRole('ADMIN_UNIDAD')")
public class UsuarioController {

  private final UsuarioService usuarioService;

  public UsuarioController(UsuarioService usuarioService) {
    this.usuarioService = usuarioService;
  }

  @GetMapping
  public PageResponse<UsuarioDto> listar(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) PerfilUsuario perfil,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
    return usuarioService.listar(q, perfil, page, size);
  }

  @GetMapping("/{id}")
  public UsuarioDetalleDto obtener(@PathVariable Long id) {
    return usuarioService.obtener(id);
  }

  @GetMapping("/sugerir-username")
  public SugerenciaUsernameDto sugerirUsername(
      @RequestParam String nombres, @RequestParam String apellidos) {
    return usuarioService.sugerirUsername(nombres, apellidos);
  }

  @PostMapping
  public ResponseEntity<CrearUsuarioResponse> crear(@Valid @RequestBody CrearUsuarioRequest request) {
    CrearUsuarioResponse response = usuarioService.crear(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @PutMapping("/{id}")
  public ActualizarUsuarioResponse actualizar(
      @PathVariable Long id, @Valid @RequestBody ActualizarUsuarioRequest request) {
    return usuarioService.actualizar(id, request);
  }

  @PostMapping("/{id}/restablecer-password")
  public ResponseEntity<Void> restablecerPassword(@PathVariable Long id) {
    usuarioService.restablecerPassword(id);
    return ResponseEntity.ok().build();
  }

  @PostMapping("/{id}/desactivar")
  public ResponseEntity<Void> desactivar(@PathVariable Long id) {
    usuarioService.desactivar(id);
    return ResponseEntity.ok().build();
  }
}
