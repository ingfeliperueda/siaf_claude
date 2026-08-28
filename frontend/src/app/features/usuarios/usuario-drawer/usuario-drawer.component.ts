import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { EstadoUsuario, PerfilUsuario, TipoDocumento, Usuario } from '../models/usuario.model';
import { UsuariosService } from '../services/usuarios.service';

function normalizarToken(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z ]/g, '')
    .trim()
    .toLowerCase();
}

function passwordScore(clave: string): number {
  let puntaje = 0;
  if (clave.length >= 10) puntaje++;
  if (/[A-Z]/.test(clave)) puntaje++;
  if (/[0-9]/.test(clave)) puntaje++;
  if (/[^A-Za-z0-9]/.test(clave) || clave.length >= 14) puntaje++;
  return puntaje;
}

@Component({
  selector: 'app-usuario-drawer',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './usuario-drawer.component.html',
  styleUrl: './usuario-drawer.component.scss'
})
export class UsuarioDrawerComponent implements OnChanges {
  @Input() usuario: Usuario | null = null;
  @Output() readonly guardado = new EventEmitter<void>();
  @Output() readonly cerrado = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly usuariosService = inject(UsuariosService);

  readonly form = this.fb.nonNullable.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    tipoDocumento: this.fb.nonNullable.control<TipoDocumento>('DNI'),
    numeroDocumento: [''],
    correo: ['', [Validators.required, Validators.email]],
    unidadId: [1, Validators.required],
    perfil: this.fb.nonNullable.control<PerfilUsuario>('REGISTRADOR', Validators.required),
    estado: this.fb.nonNullable.control<EstadoUsuario>('ACTIVO'),
    clave: [''],
    claveConf: [''],
    acepta: [false]
  });

  get modoEdicion(): boolean {
    return this.usuario !== null;
  }

  get usernameGenerado(): string {
    const nombres = normalizarToken(this.form.value.nombres ?? '');
    const apellidos = normalizarToken(this.form.value.apellidos ?? '');
    const primerNombre = nombres.split(' ').filter(Boolean)[0];
    const primerApellido = apellidos.split(' ').filter(Boolean)[0];
    if (!primerNombre || !primerApellido) return '';
    return `${primerNombre[0]}${primerApellido}`;
  }

  get fuerzaPassword(): number {
    return passwordScore(this.form.value.clave ?? '');
  }

  get contraseniasCoinciden(): boolean {
    const { clave, claveConf } = this.form.value;
    return !!claveConf && clave === claveConf;
  }

  get formularioValido(): boolean {
    if (this.modoEdicion) return this.form.valid;
    return (
      this.form.valid &&
      this.fuerzaPassword >= 3 &&
      this.contraseniasCoinciden &&
      !!this.form.value.acepta
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!('usuario' in changes)) return;

    if (this.usuario) {
      const [primerNombre, ...resto] = this.usuario.nombres.split(' ');
      this.form.patchValue({
        nombres: primerNombre ?? '',
        apellidos: [...resto, ...this.usuario.apellidos.split(' ')].join(' ').trim() || this.usuario.apellidos,
        correo: this.usuario.correo,
        unidadId: this.usuario.unidadId,
        perfil: this.usuario.perfil,
        estado: this.usuario.estado
      });
    } else {
      this.form.reset({
        nombres: '',
        apellidos: '',
        tipoDocumento: 'DNI',
        numeroDocumento: '',
        correo: '',
        unidadId: 1,
        perfil: 'REGISTRADOR',
        estado: 'ACTIVO',
        clave: '',
        claveConf: '',
        acepta: false
      });
    }
  }

  guardar(): void {
    if (!this.formularioValido) return;
    const valor = this.form.getRawValue();

    const accion$: Observable<unknown> = this.usuario
      ? this.usuariosService.actualizar(this.usuario.id, {
          nombres: valor.nombres,
          apellidos: valor.apellidos,
          correo: valor.correo,
          unidadId: valor.unidadId,
          perfil: valor.perfil,
          estado: valor.estado
        })
      : this.usuariosService.crear({
          nombres: valor.nombres,
          apellidos: valor.apellidos,
          tipoDocumento: valor.tipoDocumento,
          numeroDocumento: valor.numeroDocumento,
          correo: valor.correo,
          unidadId: valor.unidadId,
          perfil: valor.perfil,
          clave: valor.clave
        });

    accion$.subscribe(() => this.guardado.emit());
  }

  cerrar(): void {
    this.cerrado.emit();
  }
}
