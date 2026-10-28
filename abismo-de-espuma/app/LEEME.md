# Abismo de Espuma · Cómo publicarlo en las tiendas

El juego está en `../index.html`. Esta carpeta prepara la versión para tiendas:

| Archivo o carpeta | Para qué sirve |
|---|---|
| `construir.js` | Crea `www/` a partir de `../index.html`: fuentes incluidas, manifiesto, iconos y juego sin conexión |
| `www/` | El juego listo para subir (web, itch.io, Google Play o App Store) |
| `android/` | Proyecto de Android Studio (Capacitor), ya con los iconos del juego |
| `capacitor.config.json` | Nombre e identificador de la app (`com.abismodeespuma.juego`) |
| `iconos/` | Iconos y la imagen destacada de Google Play |
| `capturas/` | Capturas para las fichas, en español e inglés |
| `ficha-tienda.md` | Textos de la ficha y respuestas del cuestionario de contenido |
| `privacidad.html` | Política de privacidad (también se copia a `www/`) |
| `fuentes/` | Fuentes Cinzel y Bangers (licencia SIL OFL, incluida) |

**Cada vez que cambies el juego**, vuelve a preparar la versión para tiendas:

```bash
cd abismo-de-espuma/app
npm install            # solo la primera vez
npm run construir      # actualiza www/
npx cap sync           # copia www/ a los proyectos de Android e iOS
```

Si cambias el aspecto del juego: `npm run iconos`, `npm run capturas` y `python3 iconos-android.py`.

**Antes de publicar:**
1. Cambia `[tu correo de contacto]` en `privacidad.html` por un correo real y vuelve a ejecutar `npm run construir`.
2. Si quieres otro identificador de app, cámbialo en `capacitor.config.json` antes de subir la primera versión. Luego ya no se puede cambiar.

---

## Opción 1 · itch.io (gratis, la más fácil)

1. Crea una cuenta en https://itch.io y pulsa **Upload new project**.
2. En **Kind of project** elige **HTML**.
3. Comprime en un `.zip` el **contenido** de `www/` (que `index.html` quede en la raíz del zip) y súbelo. Marca **This file will be played in the browser**.
4. Tamaño de la ventana: 1280×800, y activa **Mobile friendly** y **Fullscreen button**.
5. Añade la portada, las capturas y la descripción de `ficha-tienda.md`, y publica.

## Opción 2 · Web propia (gratis)

Sube el contenido de `www/` a GitHub Pages, Netlify o Cloudflare Pages. En el celular se puede instalar como app desde el menú del navegador («Añadir a pantalla de inicio») y funciona sin internet.

## Opción 3 · Google Play (25 USD, un solo pago)

1. Crea una cuenta de desarrollador en https://play.google.com/console. Tiene que ser de un adulto y pide verificar la identidad.
2. Instala **Android Studio**: https://developer.android.com/studio
3. En esta carpeta ejecuta `npm install` y después `npm run android`. Se abre el proyecto en Android Studio.
4. Para probarlo, conecta tu celular (con la depuración USB activada) y pulsa ▶ Run.
5. Para subirlo: **Build › Generate Signed App Bundle / APK › Android App Bundle**. Crea una clave de firma nueva y **guárdala bien**: sin ella no podrás publicar actualizaciones.
6. En Play Console: **Crear app**, sube el `.aab`, rellena la ficha con `ficha-tienda.md`, las imágenes de `iconos/` y `capturas/`, el enlace a la política de privacidad y el cuestionario de contenido.
7. Las cuentas personales nuevas tienen que hacer antes una **prueba cerrada con al menos 12 personas durante 14 días**. Después ya se puede pedir la publicación.

> Alternativa sin Android Studio: publica `www/` en una web (opción 2) y genera el paquete en https://www.pwabuilder.com (Android › Google Play).

## Opción 4 · App Store de Apple (99 USD al año)

1. Hace falta una **Mac** con **Xcode** y una cuenta de Apple Developer: https://developer.apple.com/programs/
2. En la Mac, dentro de esta carpeta: `npm install`, `npx cap add ios` y `npm run ios`. Se abre Xcode.
3. En Xcode elige tu equipo de firma (**Signing & Capabilities**) y pruébalo en un iPhone o en el simulador.
4. **Product › Archive** y luego **Distribute App › App Store Connect**.
5. En https://appstoreconnect.apple.com crea la app, rellena la ficha y las capturas de iPhone, y envíala a revisión.

---

## Lista de comprobación

- [ ] El nombre del juego y su contenido no usan marcas de otros (ya no aparecen Nerf ni Super Soaker).
- [ ] Correo de contacto puesto en `privacidad.html` y la política publicada en una web.
- [ ] El juego probado en un celular real (táctil, sonido, guardado).
- [ ] Clave de firma de Android guardada en un lugar seguro.
- [ ] Cuestionario de contenido y público objetivo rellenados (ver `ficha-tienda.md`).
