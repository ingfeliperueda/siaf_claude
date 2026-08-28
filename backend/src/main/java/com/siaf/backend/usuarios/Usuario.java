package com.siaf.backend.usuarios;

import com.siaf.backend.catalogos.Unidad;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String username;
  private String nombres;
  private String apellidos;
  private String correo;

  @Enumerated(EnumType.STRING)
  private TipoDocumento tipoDocumento;

  private String numeroDocumento;

  @ManyToOne
  private Unidad unidad;

  @Enumerated(EnumType.STRING)
  private PerfilUsuario perfil;

  @Enumerated(EnumType.STRING)
  private EstadoUsuario estado;

  private String claveHash;

  private LocalDate fechaAlta;
}
