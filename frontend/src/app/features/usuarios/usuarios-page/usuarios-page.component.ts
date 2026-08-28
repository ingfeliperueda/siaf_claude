import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../models/usuario.model';
import { UsuariosService } from '../services/usuarios.service';
import { UsuarioDrawerComponent } from '../usuario-drawer/usuario-drawer.component';
import { UsuariosTableComponent } from '../usuarios-table/usuarios-table.component';

@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [FormsModule, UsuariosTableComponent, UsuarioDrawerComponent],
  templateUrl: './usuarios-page.component.html',
  styleUrl: './usuarios-page.component.scss'
})
export class UsuariosPageComponent implements OnInit {
  private readonly usuariosService = inject(UsuariosService);

  readonly usuarios = signal<Usuario[]>([]);
  readonly totalUsuarios = signal(0);
  readonly busqueda = signal('');
  readonly cajonAbierto = signal(false);
  readonly editado = signal<Usuario | null>(null);
  readonly mensajeExito = signal<{ titulo: string; cuerpo: string } | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.usuariosService.listar({ q: this.busqueda() }).subscribe((pagina) => {
      this.usuarios.set(pagina.content);
      this.totalUsuarios.set(pagina.totalElements);
    });
  }

  onBusquedaChange(valor: string): void {
    this.busqueda.set(valor);
    this.cargar();
  }

  abrirCreacion(): void {
    this.editado.set(null);
    this.mensajeExito.set(null);
    this.cajonAbierto.set(true);
  }

  abrirEdicion(usuario: Usuario): void {
    this.editado.set(usuario);
    this.mensajeExito.set(null);
    this.cajonAbierto.set(true);
  }

  cerrarDrawer(): void {
    this.cajonAbierto.set(false);
  }

  onGuardado(): void {
    const enEdicion = this.editado() !== null;
    this.cajonAbierto.set(false);
    this.mensajeExito.set(
      enEdicion
        ? { titulo: 'Cambios guardados', cuerpo: 'Los cambios de perfil quedan pendientes de aprobación del administrador.' }
        : { titulo: 'Solicitud enviada', cuerpo: 'Revisa el correo para verificar la cuenta. La asignación de permisos queda a cargo del administrador de tu unidad.' }
    );
    this.cargar();
  }
}
