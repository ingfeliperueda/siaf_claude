export type PerfilUsuario = 'REGISTRADOR' | 'AUTORIZADOR' | 'CONSULTA';
export type EstadoUsuario = 'ACTIVO' | 'PENDIENTE' | 'INACTIVO';
export type TipoDocumento = 'DNI' | 'CARNE_EXTRANJERIA' | 'PASAPORTE';

export interface Usuario {
  id: number;
  username: string;
  nombres: string;
  apellidos: string;
  correo: string;
  unidadId: number;
  unidad: string;
  perfil: PerfilUsuario;
  estado: EstadoUsuario;
  fechaAlta: string;
}

export interface UsuarioDetalle extends Usuario {
  actividadReciente: ActividadUsuario[];
}

export interface ActividadUsuario {
  fecha: string;
  descripcion: string;
}

export interface CrearUsuarioRequest {
  nombres: string;
  apellidos: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  correo: string;
  unidadId: number;
  perfil: PerfilUsuario;
  clave: string;
}

export interface ActualizarUsuarioRequest {
  nombres: string;
  apellidos: string;
  correo: string;
  unidadId: number;
  perfil: PerfilUsuario;
  estado: EstadoUsuario;
}

export interface ActualizarUsuarioResponse {
  perfilPendienteAprobacion: boolean;
}

export interface CrearUsuarioResponse {
  id: number;
  username: string;
  estado: 'PENDIENTE_VERIFICACION';
}

export interface SugerenciaUsername {
  username: string;
  disponible: boolean;
}

export interface Catalogo {
  codigo: string;
  nombre: string;
}

export interface Unidad {
  id: number;
  nombre: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

export interface UsuariosFiltro {
  q?: string;
  perfil?: PerfilUsuario;
  page?: number;
  size?: number;
}
