package com.siaf.backend.config;

import com.siaf.backend.catalogos.Unidad;
import com.siaf.backend.catalogos.UnidadRepository;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("dev")
public class DevDataSeeder {

  @Bean
  public CommandLineRunner sembrarUnidades(UnidadRepository unidadRepository) {
    return args -> {
      if (unidadRepository.count() > 0) {
        return;
      }
      List.of("Dirección de Presupuesto", "Oficina de Contabilidad", "Tesorería", "Abastecimiento")
          .forEach(nombre -> unidadRepository.save(new Unidad(null, nombre)));
    };
  }
}
