import { HttpInterceptorFn } from '@angular/common/http';

// Punto de extensión: adjuntar el token de sesión (JWT) cuando exista login.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
