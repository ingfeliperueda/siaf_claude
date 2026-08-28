import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Usuario } from '../models/usuario.model';

@Component({
  selector: 'app-usuarios-table',
  standalone: true,
  imports: [],
  templateUrl: './usuarios-table.component.html',
  styleUrl: './usuarios-table.component.scss'
})
export class UsuariosTableComponent {
  @Input({ required: true }) usuarios: Usuario[] = [];
  @Output() readonly editar = new EventEmitter<Usuario>();
}
