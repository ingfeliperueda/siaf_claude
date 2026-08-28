package com.siaf.backend.usuarios;

import com.siaf.backend.catalogos.Unidad;
import com.siaf.backend.catalogos.UnidadRepository;
import com.siaf.backend.common.PageResponse;
import com.siaf.backend.common.RecursoDuplicadoException;
import com.siaf.backend.common.RecursoNoEncontradoException;
import com.siaf.backend.usuarios.dto.ActualizarUsuarioRequest;
import com.siaf.backend.usuarios.dto.ActualizarUsuarioResponse;
import com.siaf.backend.usuarios.dto.CrearUsuarioRequest;
import com.siaf.backend.usuarios.dto.CrearUsuarioResponse;
import com.siaf.backend.usuarios.dto.SugerenciaUsernameDto;
import com.siaf.backend.usuarios.dto.UsuarioDetalleDto;
import com.siaf.backend.usuarios.dto.UsuarioDto;
import java.text.Normalizer;
import java.time.LocalDate;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class UsuarioService {

  private static final Pattern NO_LETRAS = Pattern.compile("[^a-zA-Z ]");

  private final UsuarioRepository usuarioRepository;
  private final UnidadRepository unidadRepository;
  private final PasswordEncoder passwordEncoder;

  public UsuarioService(
      UsuarioRepository usuarioRepository, UnidadRepository unidadRepository, PasswordEncoder passwordEncoder) {
    this.usuarioRepository = usuarioRepository;
    this.unidadRepository = unidadRepository;
    this.passwordEncoder = passwordEncoder;
  }

  public PageResponse<UsuarioDto> listar(String q, PerfilUsuario perfil, int page, int size) {
    Specification<Usuario> spec = Specification.where(null);
    if (q != null && !q.isBlank()) {
      String patron = "%" + q.toLowerCase() + "%";
      spec =
          spec.and(
              (root, query, cb) ->
                  cb.or(
                      cb.like(cb.lower(root.get("nombres")), patron),
                      cb.like(cb.lower(root.get("username")), patron)));
    }
    if (perfil != null) {
      spec = spec.and((root, query, cb) -> cb.equal(root.get("perfil"), perfil));
    }

    Page<Usuario> pagina = usuarioRepository.findAll(spec, PageRequest.of(page, size));
    return PageResponse.de(pagina.map(UsuarioDto::de));
  }

  public UsuarioDetalleDto obtener(Long id) {
    Usuario usuario = buscarPorId(id);
    return new UsuarioDetalleDto(
        usuario.getId(),
        usuario.getUsername(),
        usuario.getNombres(),
        usuario.getApellidos(),
        usuario.getCorreo(),
        usuario.getUnidad().getId(),
        usuario.getUnidad().getNombre(),
        usuario.getPerfil(),
        usuario.getEstado(),
        usuario.getFechaAlta(),
        List.of());
  }

  public SugerenciaUsernameDto sugerirUsername(String nombres, String apellidos) {
    String username = generarUsername(nombres, apellidos);
    if (username.isEmpty()) {
      return new SugerenciaUsernameDto("", false);
    }
    String candidato = username;
    int sufijo = 2;
    while (usuarioRepository.existsByUsername(candidato)) {
      candidato = username + sufijo++;
    }
    return new SugerenciaUsernameDto(candidato, true);
  }

  @Transactional
  public CrearUsuarioResponse crear(CrearUsuarioRequest request) {
    if (usuarioRepository.existsByCorreo(request.correo())) {
      throw new RecursoDuplicadoException("Ya existe un usuario con ese correo.");
    }
    if (usuarioRepository.existsByNumeroDocumento(request.numeroDocumento())) {
      throw new RecursoDuplicadoException("Ya existe un usuario con ese número de documento.");
    }
    Unidad unidad = buscarUnidad(request.unidadId());
    String username = sugerirUsername(request.nombres(), request.apellidos()).username();

    Usuario usuario = new Usuario();
    usuario.setUsername(username);
    usuario.setNombres(request.nombres());
    usuario.setApellidos(request.apellidos());
    usuario.setTipoDocumento(request.tipoDocumento());
    usuario.setNumeroDocumento(request.numeroDocumento());
    usuario.setCorreo(request.correo());
    usuario.setUnidad(unidad);
    usuario.setPerfil(request.perfil());
    usuario.setEstado(EstadoUsuario.PENDIENTE_VERIFICACION);
    usuario.setClaveHash(passwordEncoder.encode(request.clave()));
    usuario.setFechaAlta(LocalDate.now());

    Usuario guardado = usuarioRepository.save(usuario);
    return new CrearUsuarioResponse(guardado.getId(), guardado.getUsername(), guardado.getEstado());
  }

  @Transactional
  public ActualizarUsuarioResponse actualizar(Long id, ActualizarUsuarioRequest request) {
    Usuario usuario = buscarPorId(id);
    boolean perfilCambiado = usuario.getPerfil() != request.perfil();

    usuario.setNombres(request.nombres());
    usuario.setApellidos(request.apellidos());
    usuario.setCorreo(request.correo());
    usuario.setUnidad(buscarUnidad(request.unidadId()));
    usuario.setPerfil(request.perfil());
    usuario.setEstado(request.estado());

    return new ActualizarUsuarioResponse(perfilCambiado);
  }

  @Transactional
  public void restablecerPassword(Long id) {
    buscarPorId(id);
    // Punto de extensión: generar token y enviar correo de restablecimiento.
  }

  @Transactional
  public void desactivar(Long id) {
    Usuario usuario = buscarPorId(id);
    usuario.setEstado(EstadoUsuario.INACTIVO);
  }

  private Usuario buscarPorId(Long id) {
    return usuarioRepository
        .findById(id)
        .orElseThrow(() -> new RecursoNoEncontradoException("Usuario " + id + " no encontrado."));
  }

  private Unidad buscarUnidad(Long id) {
    return unidadRepository
        .findById(id)
        .orElseThrow(() -> new RecursoNoEncontradoException("Unidad " + id + " no encontrada."));
  }

  private String generarUsername(String nombres, String apellidos) {
    String primerNombre = primerToken(nombres);
    String primerApellido = primerToken(apellidos);
    if (primerNombre.isEmpty() || primerApellido.isEmpty()) {
      return "";
    }
    return primerNombre.charAt(0) + primerApellido;
  }

  private String primerToken(String valor) {
    String normalizado =
        Normalizer.normalize(valor, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
    normalizado = NO_LETRAS.matcher(normalizado).replaceAll("").trim().toLowerCase();
    String[] tokens = normalizado.split("\\s+");
    return tokens.length > 0 ? tokens[0] : "";
  }
}
