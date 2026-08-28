# SIAF

Sistema Integrado de Administración Financiera. Monorepo con frontend Angular y backend Spring Boot.

## Estructura

```
siaf_claude/
├── frontend/   Angular 19 (standalone components, Angular Material, Reactive Forms)
├── backend/    Spring Boot 3.5 + Maven (Java 21)
└── design/     Handoff de diseño (prototipo .dc.html) — solo referencia, no se porta
```

## Módulo implementado

**Usuarios** (`design/HANDOFF-usuarios.md`): listado con búsqueda/filtro/paginación y drawer de creación/edición. Ver ese documento para el detalle de diseño, tokens, copy y contrato de API que sigue el backend.

## Frontend (`frontend/`)

```
src/app/
├── core/                 interceptors, guards, servicios singleton
├── shared/app-shell/     layout: sidebar + breadcrumb + router-outlet
└── features/usuarios/    usuarios-page, usuarios-table, usuario-drawer, service, models
```

```bash
cd frontend
npm install
npm start            # http://localhost:4200
npm test             # Karma + Jasmine
npm run build
```

`src/environments/environment.ts` apunta a `http://localhost:8080/api`.

## Backend (`backend/`)

```
src/main/java/com/siaf/backend/
├── usuarios/     entidad, repositorio, servicio, controller, DTOs
├── catalogos/    unidades / tipos de documento / perfiles
├── common/       PageResponse, manejo de excepciones
└── config/       seguridad (Basic Auth de desarrollo), CORS, seed de datos
```

```bash
cd backend
mvn spring-boot:run   # http://localhost:8080, perfil "dev" (H2 en memoria)
mvn test
```

Usuario de desarrollo (solo para probar la API mientras no exista login real): `admin.unidad` / `changeit`.

Perfil `prod`: variables `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` (PostgreSQL).

### Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/catalogos/tipos-documento` \| `/unidades` \| `/perfiles` | catálogos |
| GET | `/api/usuarios` | listado (`q`, `perfil`, `page`, `size`) |
| GET | `/api/usuarios/{id}` | detalle |
| GET | `/api/usuarios/sugerir-username` | genera y verifica disponibilidad |
| POST | `/api/usuarios` | alta (`PENDIENTE_VERIFICACION`) |
| PUT | `/api/usuarios/{id}` | actualización (marca `perfilPendienteAprobacion`) |
| POST | `/api/usuarios/{id}/restablecer-password` | placeholder de restablecimiento |
| POST | `/api/usuarios/{id}/desactivar` | baja lógica |

## Pendiente

- Autenticación real (JWT/SSO) — hoy el backend usa un usuario en memoria solo para desarrollo.
- Recrear la UI con fidelidad de píxel completa siguiendo `design/HANDOFF-usuarios.md` (colores, spacing y estados están aplicados; faltan animaciones de entrada del drawer, responsive <1100px y estados vacíos/skeleton).
- Envío real de correos (verificación de alta, restablecimiento de contraseña) y flujo de aprobación de cambio de perfil.
