import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ActualizarUsuarioRequest,
  ActualizarUsuarioResponse,
  Catalogo,
  CrearUsuarioRequest,
  CrearUsuarioResponse,
  PageResponse,
  SugerenciaUsername,
  Unidad,
  Usuario,
  UsuarioDetalle,
  UsuariosFiltro
} from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/usuarios`;

  listar(filtro: UsuariosFiltro): Observable<PageResponse<Usuario>> {
    let params = new HttpParams();
    if (filtro.q) params = params.set('q', filtro.q);
    if (filtro.perfil) params = params.set('perfil', filtro.perfil);
    if (filtro.page !== undefined) params = params.set('page', filtro.page);
    if (filtro.size !== undefined) params = params.set('size', filtro.size);
    return this.http.get<PageResponse<Usuario>>(this.baseUrl, { params });
  }

  obtener(id: number): Observable<UsuarioDetalle> {
    return this.http.get<UsuarioDetalle>(`${this.baseUrl}/${id}`);
  }

  sugerirUsername(nombres: string, apellidos: string): Observable<SugerenciaUsername> {
    const params = new HttpParams().set('nombres', nombres).set('apellidos', apellidos);
    return this.http.get<SugerenciaUsername>(`${this.baseUrl}/sugerir-username`, { params });
  }

  crear(request: CrearUsuarioRequest): Observable<CrearUsuarioResponse> {
    return this.http.post<CrearUsuarioResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: ActualizarUsuarioRequest): Observable<ActualizarUsuarioResponse> {
    return this.http.put<ActualizarUsuarioResponse>(`${this.baseUrl}/${id}`, request);
  }

  restablecerPassword(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/restablecer-password`, {});
  }

  desactivar(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/desactivar`, {});
  }
}

@Injectable({ providedIn: 'root' })
export class CatalogosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/catalogos`;

  tiposDocumento(): Observable<Catalogo[]> {
    return this.http.get<Catalogo[]>(`${this.baseUrl}/tipos-documento`);
  }

  unidades(): Observable<Unidad[]> {
    return this.http.get<Unidad[]>(`${this.baseUrl}/unidades`);
  }

  perfiles(): Observable<Catalogo[]> {
    return this.http.get<Catalogo[]>(`${this.baseUrl}/perfiles`);
  }
}
