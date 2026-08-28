package com.siaf.backend.catalogos;

import com.siaf.backend.catalogos.dto.CatalogoDto;
import com.siaf.backend.catalogos.dto.UnidadDto;
import com.siaf.backend.usuarios.PerfilUsuario;
import com.siaf.backend.usuarios.TipoDocumento;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/catalogos")
public class CatalogoController {

  private final UnidadRepository unidadRepository;

  public CatalogoController(UnidadRepository unidadRepository) {
    this.unidadRepository = unidadRepository;
  }

  @GetMapping("/tipos-documento")
  public List<CatalogoDto> tiposDocumento() {
    return List.of(TipoDocumento.values()).stream()
        .map(tipo -> new CatalogoDto(tipo.name(), nombreTipoDocumento(tipo)))
        .toList();
  }

  @GetMapping("/perfiles")
  public List<CatalogoDto> perfiles() {
    return List.of(PerfilUsuario.values()).stream()
        .map(perfil -> new CatalogoDto(perfil.name(), nombrePerfil(perfil)))
        .toList();
  }

  @GetMapping("/unidades")
  public List<UnidadDto> unidades() {
    return unidadRepository.findAll().stream()
        .map(unidad -> new UnidadDto(unidad.getId(), unidad.getNombre()))
        .toList();
  }

  private String nombreTipoDocumento(TipoDocumento tipo) {
    return switch (tipo) {
      case DNI -> "DNI";
      case CARNE_EXTRANJERIA -> "Carné de extranjería";
      case PASAPORTE -> "Pasaporte";
    };
  }

  private String nombrePerfil(PerfilUsuario perfil) {
    return switch (perfil) {
      case REGISTRADOR -> "Registrador";
      case AUTORIZADOR -> "Autorizador";
      case CONSULTA -> "Consulta";
    };
  }
}
