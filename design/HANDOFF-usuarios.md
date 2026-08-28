# Handoff: Módulo de Usuarios (SIAF)

## Overview
Pantalla de administración de usuarios de un sistema web administrativo (SIAF). Una sola vista contiene:
1. **Listado (grilla)** de usuarios creados, con búsqueda, filtro por perfil, estado y paginación.
2. **Panel lateral deslizable (drawer)** que sirve para **crear** un usuario nuevo y para **editar** uno existente — mismo contenedor, dos modos.

Stack objetivo: **Angular (frontend) + Spring Boot (backend)**.

## About the Design Files
Los archivos de este bundle son **referencias de diseño creadas en HTML** — un prototipo que muestra apariencia y comportamiento previstos, **no código de producción para copiar**.

`Registro de usuarios.dc.html` usa un runtime de prototipado propio (`support.js`, plantilla + clase de lógica al estilo React). **No portes ese runtime.** La tarea es **recrear el diseño en el entorno Angular existente** con sus patrones: componentes standalone o por módulo según la convención del repo, `ReactiveFormsModule` para los formularios, la librería de UI ya adoptada (Angular Material / PrimeNG / Tailwind / SCSS propio) y su capa de servicios HTTP contra la API de Spring Boot. Si el proyecto Angular no existe aún, créalo con Angular CLI y aplica el diseño tal como está documentado.

Toda validación descrita aquí debe existir **en ambos lados**: validadores de Angular para retroalimentación inmediata y validación de servidor en Spring Boot (Bean Validation + reglas de negocio).

## Fidelity
**High-fidelity (hifi).** Colores, tipografía, espaciado, estados y copy son finales. Recrea la UI con fidelidad de píxel usando las librerías del codebase. El copy está en español y debe conservarse literal (ver "Copy exacto").

Sugerencia de descomposición en Angular:
- `UsuariosPageComponent` — layout, breadcrumb, cabecera, tabla, banner de éxito, orquestación del drawer.
- `UsuariosTableComponent` — grilla + toolbar + paginación (`@Input() usuarios`, `@Output() editar`).
- `UsuarioDrawerComponent` — panel lateral con `@Input() usuario | null` (null = modo creación), `@Output() guardado / cerrado`.
- `AppShellComponent` — sidebar colapsable + header de miga de pan (reutilizable por todo el sistema).

---

## Layout general

Canvas de diseño **1440 × 980 px**, fondo `#f4f6fa`, tipografía `Instrument Sans` (Google Fonts, pesos 400/500/600/700).

Raíz: `display: flex` horizontal.
1. `nav` lateral colapsable (224px / 76px).
2. Columna de contenido `flex: 1; min-width: 0; display: flex; flex-direction: column` → header de miga de pan + `main`.
3. Drawer: overlay `position: fixed; inset: 0` por encima de todo (`z-index: 40`), solo cuando está abierto.

### 1. Sidebar de navegación
- Fondo `#0f2647`, texto `#e8eef8`, padding `22px 16px`, `display: flex; flex-direction: column; gap: 26px`, `overflow: hidden`.
- Ancho **224px expandido / 76px colapsado**, `transition: width 180ms ease`.
- **Marca:** cuadro 34×34, `border-radius: 9px`, fondo `#1b4f9c`, letra "S" blanca 14px/700; texto "SIAF" 16px/600, `letter-spacing: -0.01em`; padding lateral 5px.
- **Botón hamburguesa:** alto 44px, `min-width: 44px`, `border-radius: 10px`, fondo `rgba(255,255,255,0.07)`, hover `rgba(255,255,255,0.14)`, padding `0 13px`, `gap: 14px`. Icono: 3 barras de 2px, ancho 18px, `gap: 4px`. Etiqueta "Menú" 13px/500 `#9db2d4`. `aria-label="Alternar menú"`.
- **Ítems** (`gap: 4px`), alto 44px, `border-radius: 10px`, padding `0 13px`, `gap: 14px`, icono SVG 17×17 (`stroke-width: 1.8`, `currentColor`):
  - **Inicio** (icono casa): texto `#9db2d4` 15px/500; hover fondo `rgba(255,255,255,0.08)`, texto `#fff`.
  - **Usuarios** (icono dos personas), **activo** (`aria-current="page"`): fondo `#1b4f9c`, texto `#fff` 15px/600; hover `#21609c`.
- Al colapsar, todas las etiquetas ("SIAF", "Menú", "Inicio", "Usuarios") pasan a `opacity: 0`; los iconos permanecen. Conserva `white-space: nowrap`.

### 2. Header de miga de pan
- Fondo `#fff`, `border-bottom: 1px solid #e2e8f1`, padding `14px 48px`, `display: flex; align-items: center; justify-content: space-between; gap: 24px`.
- **Breadcrumb** (`<nav aria-label="Miga de pan">`, `gap: 10px`, 13px): `Inicio` (icono casa 14×14, `gap: 7px`, color `#63708a`) → `/` (`#b6c0d1`) → `Usuarios` (`#14213a`, peso 600) → **solo cuando el drawer está en modo creación**: `/` + `Nuevo registro` (`#14213a`, peso 600). En Angular, alimenta la miga desde la data de rutas.
- **Derecha** (13px, `#63708a`): "Ayuda", divisor vertical 1×18px `#e2e8f1`, "¿Ya tienes cuenta? **Inicia sesión**".

### 3. `main`
`flex: 1`, padding `36px 48px 64px`, `display: flex; flex-direction: column; gap: 28px`.

---

## Bloque A — Cabecera de página
`display: flex; align-items: flex-end; justify-content: space-between; gap: 32px`.
- `h1` **"Usuarios"** 30px/600, `letter-spacing: -0.025em`, color `#14213a`.
- Párrafo 15px `#63708a`, `max-width: 70ch`, `text-wrap: pretty`: "Administra las cuentas de tu unidad. El registro habilita el perfil; los permisos finales los asigna el administrador."
- **Botón primario "Crear nuevo usuario"**: alto 46px, padding `0 22px`, `border-radius: 9px`, sin borde, fondo `#1b4f9c`, texto blanco 15px/600, `display: flex; gap: 9px`, icono "+" 16×16 (`stroke-width: 2.4`), hover `filter: brightness(1.1)`. Abre el drawer en **modo creación**.

## Bloque B — Card de la grilla
Contenedor: fondo `#fff`, `border: 1px solid #e2e8f1`, `border-radius: 16px`, `box-shadow: 0 1px 2px rgba(15,38,71,0.04)`, `overflow: hidden`.

**B.1 Toolbar** — padding `18px 24px`, `border-bottom: 1px solid #edf1f6`, `display: flex; justify-content: space-between; align-items: center; gap: 20px`.
- Izquierda: `h2` "Usuarios creados" 16px/600 + badge con el conteo: 12px/600 color `#1b4f9c`, fondo `#e8effa`, `border-radius: 99px`, padding `3px 9px`.
- Derecha (`gap: 10px`): **buscador** (contenedor 260px, `position: relative`; icono lupa 15×15 `#8b96aa` en `left: 12px`; input alto 40px, `padding: 0 12px 0 34px`, borde `#d3dbe7`, radio 9px, 14px, placeholder "Buscar por nombre o usuario") y **select de perfil** (alto 40px, ancho 168px, radio 9px, 14px `#3a465c`; opciones: "Todos los perfiles", Registrador, Autorizador, Consulta).

**B.2 Tabla** — `width: 100%; border-collapse: collapse; font-size: 14px`.
- `thead tr` fondo `#fafbfd`; cada `th`: padding `11px 24px` (primera y última) o `11px 16px`, 11px/600, `text-transform: uppercase`, `letter-spacing: 0.06em`, color `#8b96aa`, `border-bottom: 1px solid #edf1f6`. Columnas: **Usuario · Nombre completo · Unidad · Perfil · Estado · Alta · Acciones** (esta última `text-align: right`).
- `tbody tr`: `border-bottom: 1px solid #f2f5f9`, hover fondo `#fafbfd`.
- Celdas: padding `14px 24px` (primera) / `14px 16px` (resto) / `10px 24px` (acciones). "Usuario" peso 600 `#14213a`; "Nombre completo" y "Perfil" `#3a465c`; "Unidad" `#63708a`; "Alta" `#8b96aa` con `font-variant-numeric: tabular-nums`.
- **Badge de estado:** `inline-flex; gap: 6px`, 12px/600, `border-radius: 99px`, padding `4px 10px`, con punto de 6px del mismo color del texto:
  - Activo → texto `#2f7d52`, fondo `#edf7f1`
  - Pendiente → texto `#b9861d`, fondo `#fdf6e7`
  - Inactivo → texto `#7a8699`, fondo `#f1f4f8`
- **Columna Acciones** (alineada a la derecha, `inline-flex; gap: 6px`):
  - Botón **"Editar"**: alto 34px, padding `0 13px`, `border-radius: 8px`, borde `#d3dbe7`, fondo `#fff`, texto `#1b4f9c` 13px/600, icono lápiz 14×14, `gap: 7px`; hover fondo `#e8effa`, borde `#b9cbe6`. Abre el drawer en **modo edición** con el registro cargado.
  - Botón **más acciones** (icono ⋮): 34×34, radio 8px, borde `#d3dbe7`, color `#8b96aa`, hover fondo `#f2f5fa` color `#3a465c`. Menú no diseñado — define con el equipo (p. ej. Ver detalle, Restablecer contraseña, Desactivar).

**B.3 Paginación** — padding `14px 24px`, fondo `#fafbfd`, `border-top: 1px solid #edf1f6`, `display: flex; justify-content: space-between; align-items: center; gap: 20px`.
- Izquierda: texto 13px `#8b96aa` → "Mostrando N de M usuarios".
- Derecha (`gap: 8px`): botones "Anterior" (deshabilitado: color `#8b96aa`, `cursor: not-allowed`) y "Siguiente" (color `#3a465c` peso 500, hover fondo `#f2f5fa`); ambos alto 34px, padding `0 14px`, radio 8px, borde `#d3dbe7`, 13px.

## Bloque C — Banner de éxito
Aparece bajo la grilla tras crear o guardar (y desaparece al reabrir el drawer). `display: flex; gap: 14px; align-items: flex-start`, fondo `#edf7f1`, `border: 1px solid #c6e4d2`, `border-radius: 12px`, padding `18px 20px`. Círculo 22px fondo `#2f7d52` con "✓" blanco 13px/700. Título 15px/700 `#1f5638`; cuerpo 14px `#3d6b52`, `line-height: 1.55`.
- Creación → "Solicitud enviada" / "Revisa el correo <correo> para verificar la cuenta. La asignación de permisos queda a cargo del administrador de tu unidad."
- Edición → "Cambios guardados" / "Se actualizaron los datos de <usuario>. Los cambios de perfil quedan pendientes de aprobación del administrador."

---

## Bloque D — Drawer de creación / edición

**Overlay:** `position: fixed; inset: 0`, fondo `rgba(15,38,71,0.42)`, `display: flex; justify-content: flex-end`, `z-index: 40`. El área libre a la izquierda cierra el panel al hacer clic.

**Panel:** `<aside role="dialog" aria-modal="true">`, ancho **560px**, alto 100%, fondo `#fff`, `box-shadow: -18px 0 48px rgba(15,38,71,0.18)`, `display: flex; flex-direction: column`. En la implementación real: animación de entrada (slide-in desde la derecha ~200ms ease-out), cierre con `Esc`, `focus trap` y foco inicial en el primer campo.

**D.1 Header** — padding `22px 28px`, `border-bottom: 1px solid #edf1f6`, `display: flex; align-items: flex-start; justify-content: space-between; gap: 20px`.
- Avatar 44×44, `border-radius: 11px`, fondo `#e8effa`, color `#1b4f9c`, 16px/700: **iniciales** (nombre + apellido) en edición, **"+"** en creación.
- Título 18px/600, `letter-spacing: -0.015em`, con `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`: nombre completo en edición, **"Nuevo usuario"** en creación.
- Submeta 13px `#8b96aa`, `tabular-nums`: `"<usuario> · alta <dd/mm/aaaa>"` en edición, `"Paso 1 de 3 · datos de la cuenta"` en creación.
- Botón cerrar 34×34, radio 8px, borde `#d3dbe7`, color `#63708a`, hover fondo `#f2f5fa` color `#14213a`, icono ✕ 15×15.

**D.2 Cuerpo** — `flex: 1; overflow-y: auto`, padding `26px 28px`, `display: flex; flex-direction: column; gap: 26px`.
Encabezado de cada sección: 12px/600, `text-transform: uppercase`, `letter-spacing: 0.07em`, color `#8b96aa`.
Estilo de campos en el drawer: `label` columna `gap: 7px`; etiqueta 13px/500 `#3a465c`; control alto **44px**, padding `0 13px` (select `0 11px`), borde `1px solid #d3dbe7`, radio 9px, 15px, color `#14213a`, fondo `#fff`, `box-sizing: border-box; width: 100%; min-width: 0`. Grillas: `repeat(2, minmax(0, 1fr))`, `gap: 16px 20px`. Foco `outline: 2px solid #1b4f9c; outline-offset: 2px`.

- **Datos personales** — Nombres · Apellidos · *(solo creación)* Tipo de documento (select DNI / Carné de extranjería / Pasaporte) · *(solo creación)* Número de documento (`tabular-nums`, placeholder "Sin espacios ni guiones") · Correo electrónico institucional (`grid-column: span 2`).
- **Asignación** — Unidad o dependencia (`span 2`; opciones: Dirección de Presupuesto, Oficina de Contabilidad, Tesorería, Abastecimiento) · Perfil (Registrador / Autorizador / Consulta) · *(solo edición)* Estado de la cuenta (Activo / Pendiente / Inactivo).
  - *(solo edición)* **Aviso de cambio de perfil**, visible cuando el perfil seleccionado difiere del original: `display: flex; gap: 10px`, fondo `#fdf6e7`, borde `1px solid #f0e0bd`, radio 10px, padding `13px 15px`; icono de alerta 16×16 trazo `#8a6412`; texto 13px `#7a5a12`, `line-height: 1.5`: "El cambio de perfil de **<original>** a **<nuevo>** requiere aprobación del administrador de la unidad."
- **Acceso — modo creación** (`gap: 18px`):
  - **Usuario del sistema**: campo de solo lectura (`readOnly`, `aria-readonly="true"`, `tabindex="-1"`, `cursor: default`), fondo `#f7f9fc`, 15px/600, `padding-right: 92px`, placeholder "Se genera automáticamente"; badge **"Auto"** superpuesto (`position: absolute; right: 12px`): 11px/600 uppercase, `letter-spacing: 0.06em`, color `#1b4f9c`, fondo `#e8effa`, radio 5px, padding `4px 8px`, icono "destello" 11×11, `gap: 6px`. Ayuda 12px `#8b96aa`: "Inicial del nombre + primer apellido. <Disponible. | Completa nombres y apellidos.>"
  - **Contraseña** y **Confirmar contraseña** en grilla de 2 columnas (`align-items: start`). En el prototipo son `type="text"` para ver el valor; **en producción `type="password"` con botón mostrar/ocultar**.
    - Medidor de fuerza: 4 barras `height: 4px; flex: 1; border-radius: 99px`, `gap: 6px`, `margin-top: 2px`; debajo, texto 12px `#8b96aa`: "Seguridad: **<nivel>** · mínimo 10 caracteres, una mayúscula y un número."
    - Bajo Confirmar: mensaje 12px según estado (ver Interacciones).
  - **Checkbox de términos**: fondo `#f7f9fc`, borde `1px solid #e6ecf4`, radio 11px, padding `14px 16px`, `gap: 12px`; input 18×18 `accent-color: #1b4f9c`, `margin-top: 2px`; texto 13px `line-height: 1.55` `#3a465c` con enlaces "términos de uso" y "política de tratamiento de datos personales".
- **Acceso — modo edición** (`gap: 12px`): dos filas `display: flex; justify-content: space-between; align-items: center`, radio 11px, padding `14px 16px`, borde `#e6ecf4`:
  1. "Usuario del sistema" 13px/600 + "<usuario> · no editable" 13px `#63708a`; fondo `#f7f9fc`; badge "Auto" a la derecha.
  2. "Contraseña" + "Última actualización: 12/08/2026"; botón "Enviar restablecimiento" alto 36px, padding `0 14px`, radio 8px, borde `#d3dbe7`, texto `#1b4f9c` 13px/600, hover fondo `#e8effa` borde `#b9cbe6`.
- **Actividad reciente** *(solo edición)* — lista `gap: 11px`; cada fila `display: flex; gap: 11px; align-items: baseline`, 13px: fecha en columna fija de 74px, color `#8b96aa`, `tabular-nums`; descripción `#3a465c`. Datos de ejemplo: "21/08/2026 Último inicio de sesión", "14/08/2026 Perfil actualizado por jvaldez", "12/08/2026 Cuenta creada". Debe venir de auditoría real.

**D.3 Footer** — padding `18px 28px`, `border-top: 1px solid #edf1f6`, fondo `#fafbfd`, `display: flex; align-items: center; justify-content: space-between; gap: 20px`.
- Izquierda: *(edición)* botón **"Desactivar cuenta"** alto 44px, padding `0 16px`, radio 9px, borde `1px solid #f0d6d2`, fondo `#fff`, texto `#b3341f` 14px/600, hover fondo `#fdf1ef` (debe pedir confirmación); *(creación)* texto de estado 13px `#8b96aa`: "Completa los campos obligatorios" / "Listo para enviar".
- Derecha (`gap: 10px`): **"Cancelar"** (alto 44px, padding `0 18px`, radio 9px, borde `#d3dbe7`, fondo `#fff`, texto `#3a465c` 14px/500, hover `#f2f5fa`) y botón primario alto 44px, padding `0 22px`, radio 9px, texto blanco 14px/600: **"Crear usuario"** en creación (deshabilitado hasta que el formulario sea válido: fondo `#c0cbdb`, `cursor: not-allowed`; habilitado `#1b4f9c`, hover `filter: brightness(1.1)`) o **"Guardar cambios"** en edición (siempre habilitado en el prototipo; en producción, habilitar solo si el formulario es válido y `dirty`).

---

## Interactions & Behavior

### Sidebar
El botón hamburguesa alterna 224px ↔ 76px con `transition: width 180ms ease` y opacidad 1→0 en las etiquetas. Estado inicial: expandido.

### Búsqueda de la grilla
Filtra en vivo sobre `usuario` y `nombre` (case-insensitive, `includes`). El badge de conteo y el texto "Mostrando N de M" reflejan el resultado filtrado. En producción: filtrado y paginación en servidor (`?q=&perfil=&page=&size=`) con `debounceTime(300)`.

### Apertura del drawer
- **"Crear nuevo usuario"** → modo creación: limpia todos los campos (nombres, apellidos, tipo/número de documento, correo, contraseñas, términos), unidad = "Dirección de Presupuesto", perfil = "Registrador", oculta el banner de éxito.
- **"Editar"** en una fila → modo edición: precarga nombres/apellidos partiendo `nombre` por el primer espacio (primer token = nombres, resto = apellidos), correo, unidad, perfil y estado del registro; guarda el registro original para comparar el perfil.
- **Cancelar**, **✕** o clic en el scrim cierran sin guardar.

### Generación del usuario del sistema (modo creación)
Se recalcula al cambiar Nombres o Apellidos:
1. Normalizar: `NFD`, quitar diacríticos (`/[\u0300-\u036f]/g`), quitar todo lo que no sea letra A–Z o espacio, `trim()`, `toLowerCase()`.
2. Tokenizar por espacios; si nombres o apellidos quedan vacíos → usuario vacío y nota "Completa nombres y apellidos."
3. Usuario = **primera letra del primer nombre + primer apellido completo**. Ej.: "María Fernanda" + "Rojas Peña" → `mrojas`.

En producción la generación se cierra en el servidor: misma regla, verificación de unicidad y sufijo numérico si colisiona (`mrojas2`). Expón `GET /api/usuarios/sugerir-username?nombres=&apellidos=` y consúmelo desde Angular con `debounceTime(300)` + `distinctUntilChanged()`; el campo permanece `readOnly`.

### Medidor de fuerza de contraseña
Puntaje 0–4, +1 por condición: longitud ≥ 10 · contiene mayúscula `/[A-Z]/` · contiene dígito `/[0-9]/` · contiene no alfanumérico `/[^A-Za-z0-9]/` **o** longitud ≥ 14.

| Puntaje | Etiqueta | Color de barras activas |
|---|---|---|
| 0 | Sin definir | texto `#8b96aa`, barras `#dde3ec` |
| 1 | Débil | `#c0392b` |
| 2 | Aceptable | `#b9861d` |
| 3 | Buena | `#1b4f9c` |
| 4 | Fuerte | `#2f7d52` |

Barras inactivas siempre `#dde3ec`.

### Confirmación de contraseña
- Vacío: borde `#d3dbe7`, "Repite la contraseña." color `#8b96aa`.
- Coincide: borde `#a8cdb7`, "Las contraseñas coinciden." color `#2f7d52`.
- No coincide: borde `#e0a9a0`, "Las contraseñas no coinciden." color `#b3341f`.

### Validez del formulario de creación
Habilita "Crear usuario" solo si: puntaje ≥ 3 **y** las contraseñas coinciden **y** el checkbox de términos está marcado **y** el correo contiene "@" (en producción: validador de email real + dominio institucional si aplica; documento obligatorio y con formato por tipo). El texto de estado del footer refleja lo mismo.

### Guardar
El prototipo cierra el drawer y muestra el banner de éxito correspondiente. En la implementación real: estado de carga en el botón (spinner + `disabled`), llamada al backend, refresco de la grilla, `toast`/banner de resultado, y manejo de errores por campo (409 duplicado de correo/documento/usuario, 400 validación, 403 sin permiso).

### Estados no diseñados (definir con el equipo)
Grilla vacía / sin resultados de búsqueda, skeleton de carga, error de red, menú de "más acciones", confirmación de desactivación, y los pasos 2 y 3 del alta (verificación de correo y aprobación de permisos).

### Responsive
El prototipo es de ancho fijo 1440px. Recomendado: bajo ~1100px las grillas del drawer pasan a 1 columna; bajo ~900px el sidebar arranca colapsado y se abre como overlay, el drawer ocupa el 100% del ancho, y la tabla se convierte en tarjetas apiladas (o scroll horizontal con la primera columna fija).

---

## State Management

| Estado | Tipo | Uso |
|---|---|---|
| `menuAbierto` | boolean | sidebar expandido (inicial `true`) |
| `busqueda` | string | filtro de la grilla |
| `cajonAbierto` | boolean | drawer visible |
| `editado` | registro \| null | `null` = modo creación; si no, el registro en edición |
| `nombres`, `apellidos` | string | datos personales |
| `tipoDoc`, `numeroDoc` | string | documento (solo creación) |
| `correo` | string | correo institucional |
| `unidad`, `perfil` | string/id | asignación |
| `estadoEdit` | enum | estado de cuenta (solo edición) |
| `clave`, `claveConf` | string | credenciales (solo creación) |
| `acepta` | boolean | términos (solo creación) |
| `enviado`, `exitoEdicion`, `exitoUsuario` | boolean/string | banner de éxito |

Derivados (no se almacenan): lista filtrada y conteos, `usuario` generado, puntaje/etiqueta/color de fuerza, coincidencia de contraseñas, validez global, `perfilCambiado`, títulos y textos del drawer. En Angular: `computed()` sobre señales o `combineLatest` sobre `valueChanges`.

Datos de ejemplo de la grilla (5 filas del prototipo): cvargas / Carlos Vargas Loayza / Dirección de Presupuesto / Autorizador / Activo / 12-08-2026 · lquispe / Lucía Quispe Alarcón / Oficina de Contabilidad / Registrador / Activo / 05-08-2026 · jmendoza / Jorge Mendoza Ríos / Tesorería / Registrador / Pendiente / 02-08-2026 · acastro / Ana Castro Bermúdez / Abastecimiento / Consulta / Activo / 28-07-2026 · rsalinas / Ricardo Salinas Paz / Dirección de Presupuesto / Consulta / Inactivo / 19-07-2026.

### Contrato sugerido (Spring Boot)
- `GET /api/catalogos/tipos-documento` → `[{ codigo, nombre }]`
- `GET /api/catalogos/unidades` → `[{ id, nombre }]`
- `GET /api/catalogos/perfiles` → `[{ codigo, nombre }]`
- `GET /api/usuarios?q=&perfil=&page=&size=` → `{ content: [{ id, username, nombres, apellidos, unidad, perfil, estado, fechaAlta }], totalElements, totalPages }`
- `GET /api/usuarios/{id}` → detalle + `actividadReciente: [{ fecha, descripcion }]`
- `GET /api/usuarios/sugerir-username?nombres=&apellidos=` → `{ username, disponible }`
- `POST /api/usuarios` → alta (sin `claveConf`); `201 { id, username, estado: "PENDIENTE_VERIFICACION" }`, `400` validación, `409` duplicado.
- `PUT /api/usuarios/{id}` → actualización de datos, unidad, perfil y estado; si cambia el perfil, la respuesta marca `perfilPendienteAprobacion: true`.
- `POST /api/usuarios/{id}/restablecer-password` → envía correo de restablecimiento.
- `POST /api/usuarios/{id}/desactivar` → baja lógica.
- Contraseña sobre TLS, almacenada con BCrypt; el alta queda `PENDIENTE_VERIFICACION` hasta consumir el token de correo y sin permisos hasta la aprobación del administrador. Protege todo el módulo con la autoridad correspondiente (p. ej. `@PreAuthorize("hasRole('ADMIN_UNIDAD')")`).

---

## Design Tokens

**Colores**

| Uso | Hex |
|---|---|
| Azul institucional oscuro (sidebar) | `#0f2647` |
| Azul primario | `#1b4f9c` |
| Azul primario hover | `#21609c` |
| Azul enlace hover | `#133a75` |
| Azul claro (badge, hover sutil) | `#e8effa` |
| Borde azul claro | `#b9cbe6` |
| Texto sobre azul oscuro | `#e8eef8` |
| Texto secundario sobre azul oscuro | `#9db2d4` |
| Fondo de página | `#f4f6fa` |
| Superficie | `#ffffff` |
| Superficie sutil | `#f7f9fc` / `#fafbfd` |
| Scrim del drawer | `rgba(15,38,71,0.42)` |
| Texto principal | `#14213a` |
| Texto de etiqueta | `#3a465c` |
| Texto secundario | `#63708a` |
| Texto terciario / ayuda | `#8b96aa` |
| Placeholder | `#9aa4b6` |
| Borde de campo | `#d3dbe7` |
| Borde de contenedor | `#e2e8f1` |
| Divisores | `#edf1f6` / `#e6ecf4` / `#f2f5f9` |
| Separador de miga de pan | `#b6c0d1` |
| Botón deshabilitado | `#c0cbdb` |
| Barra de fuerza inactiva | `#dde3ec` |
| Error / destructivo | `#b3341f` (borde `#f0d6d2`, fondo hover `#fdf1ef`) |
| Error (fuerza débil) | `#c0392b` |
| Advertencia | `#b9861d` — aviso: fondo `#fdf6e7`, borde `#f0e0bd`, texto `#7a5a12`, icono `#8a6412` |
| Éxito | `#2f7d52` — banner: fondo `#edf7f1`, borde `#c6e4d2`, título `#1f5638`, cuerpo `#3d6b52` |
| Estado inactivo (badge) | texto `#7a8699`, fondo `#f1f4f8` |
| Borde de campo válido / inválido | `#a8cdb7` / `#e0a9a0` |

**Tipografía** — `Instrument Sans` (Google Fonts), pesos 400/500/600/700.

| Rol | Tamaño / peso |
|---|---|
| H1 de página | 30px / 600, `letter-spacing: -0.025em` |
| Título del drawer | 18px / 600, `letter-spacing: -0.015em` |
| H2 de card | 16px / 600 |
| Cuerpo y valores de campo | 15px / 400 (usuario generado 600) |
| Ítem de menú | 15px / 500 (activo 600) |
| Tabla (celdas) | 14px / 400 (usuario 600) |
| Botones | 14–15px / 600 (secundario 500) |
| Etiqueta de campo | 13px / 500 |
| Miga de pan, meta, estado, actividad | 13px / 400 (último ítem 600) |
| Ayuda, mensajes de validación | 12px / 400 |
| Encabezado de sección del drawer | 12px / 600, uppercase, `letter-spacing: 0.07em` |
| Encabezado de tabla | 11px / 600, uppercase, `letter-spacing: 0.06em` |
| Badge "Auto" | 11px / 600, uppercase, `letter-spacing: 0.06em` |
| Badge de estado / conteo | 12px / 600 |

**Espaciado** — escala: 2, 4, 6, 7, 9, 10, 11, 12, 13, 14, 16, 18, 20, 21, 22, 24, 26, 28, 32, 36, 48, 64 px. Padding del drawer `26px 28px`; padding de `main` `36px 48px 64px`; gap vertical de bloques 28px; gaps de grilla `16px 20px` (drawer).

**Radios** — 5px (badge Auto), 8px (botones pequeños, iconos), 9px (campos, botones, marca), 10px (ítems de menú, aviso), 11px (avatar, filas de acceso, checkbox), 12px (banner), 16px (card de la grilla), 99px / 50% (badges, barras, puntos).

**Sombras**
- Card de la grilla: `0 1px 2px rgba(15,38,71,0.04)`
- Drawer: `-18px 0 48px rgba(15,38,71,0.18)`

**Alturas de control** — botones/campos de página 46px · campos y botones del drawer 44px · botones de tabla y toolbar 34–40px · ítems de menú 44px (mínimo táctil).

**Transición** — ancho del sidebar `180ms ease`; entrada del drawer ~200ms ease-out (a implementar).

---

## Copy exacto
Implementar literalmente (o como valores por defecto en `es` si hay i18n):

- Navegación: "SIAF", "Menú", "Inicio", "Usuarios"
- Miga de pan: "Inicio" / "Usuarios" / "Nuevo registro"
- Header: "Ayuda", "¿Ya tienes cuenta?", "Inicia sesión"
- Página: "Usuarios", "Administra las cuentas de tu unidad. El registro habilita el perfil; los permisos finales los asigna el administrador.", "Crear nuevo usuario"
- Grilla: "Usuarios creados", "Buscar por nombre o usuario", "Todos los perfiles", "Usuario", "Nombre completo", "Unidad", "Perfil", "Estado", "Alta", "Acciones", "Editar", "Activo", "Pendiente", "Inactivo", "Mostrando N de M usuarios", "Anterior", "Siguiente"
- Drawer: "Nuevo usuario", "Paso 1 de 3 · datos de la cuenta", "<usuario> · alta <fecha>", "Datos personales", "Asignación", "Acceso", "Actividad reciente"
- Etiquetas: "Nombres", "Apellidos", "Tipo de documento", "Número de documento", "Correo electrónico institucional", "Unidad o dependencia", "Perfil", "Estado de la cuenta", "Usuario del sistema", "Contraseña", "Confirmar contraseña"
- Ayudas: "Sin espacios ni guiones", "Se genera automáticamente", "Inicial del nombre + primer apellido.", "Disponible.", "Completa nombres y apellidos.", "Seguridad: … · mínimo 10 caracteres, una mayúscula y un número.", "Repite la contraseña.", "Las contraseñas coinciden.", "Las contraseñas no coinciden.", "<usuario> · no editable", "Última actualización: 12/08/2026", "Auto"
- Aviso: "El cambio de perfil de <original> a <nuevo> requiere aprobación del administrador de la unidad."
- Términos: "Declaro que la información registrada es veraz y acepto los términos de uso y la política de tratamiento de datos personales."
- Acciones: "Enviar restablecimiento", "Desactivar cuenta", "Cancelar", "Crear usuario", "Guardar cambios", "Completa los campos obligatorios", "Listo para enviar"
- Éxito: "Solicitud enviada", "Revisa el correo <correo> para verificar la cuenta. La asignación de permisos queda a cargo del administrador de tu unidad.", "Cambios guardados", "Se actualizaron los datos de <usuario>. Los cambios de perfil quedan pendientes de aprobación del administrador."

## Accesibilidad
- Todos los campos con `label` asociado (`for`/`id` en Angular).
- Drawer: `role="dialog"`, `aria-modal="true"`, `aria-label` descriptivo, cierre con `Esc`, focus trap, foco inicial en el primer campo, y devolución del foco al botón que lo abrió al cerrar.
- Menú activo con `aria-current="page"`; hamburguesa con `aria-label` y `aria-expanded`.
- Breadcrumb en `<nav aria-label="Miga de pan">` con `<ol>` semántico.
- Campo autogenerado: `readOnly` + `aria-readonly="true"` + `tabindex="-1"`.
- Foco visible en todos los controles: `outline: 2px solid #1b4f9c; outline-offset: 2px`.
- Mensajes de validación anunciados (`aria-live="polite"`, `aria-describedby`) y nunca dependientes solo del color; los badges de estado incluyen texto además del punto de color.
- Objetivos táctiles ≥ 44px; tabla con `<th scope="col">` y `<caption>` accesible.

## Assets
Sin imágenes ni fuentes en archivo. Los iconos (casa, usuarios, hamburguesa, lupa, +, lápiz, ⋮, ✕, alerta, destello) son **SVG inline dibujados a mano** en el prototipo (viewBox 24×24, trazo 1.8–2.4, `currentColor`) — sustitúyelos por los equivalentes de la librería de iconos del codebase (Material Icons, Lucide, etc.). Única dependencia externa: la fuente **Instrument Sans** vía Google Fonts.

## Files
- `Registro de usuarios.dc.html` — el prototipo (plantilla + lógica). Referencia visual y de comportamiento.
- `support.js` — runtime del entorno de prototipado. **No se porta**; solo permite abrir el HTML en un navegador.
