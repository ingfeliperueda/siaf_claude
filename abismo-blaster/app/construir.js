// Prepara la versión para tiendas en app/www a partir de ../index.html:
//  - fuentes incluidas dentro del archivo (funciona sin internet)
//  - manifiesto de app, iconos y un service worker para jugar sin conexión
// Uso: node app/construir.js
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const dir = __dirname, www = path.join(dir, "www");
const NOMBRE = "Abismo Blaster", CORTO = "Abismo", COLOR = "#1a0c06";

let html = fs.readFileSync(path.join(dir, "..", "index.html"), "utf8");

// fuentes: @font-face con los woff2 en base64 (licencia SIL OFL, ver app/fuentes)
const fuentes = fs.readFileSync(path.join(dir, "fuentes", "fuentes.txt"), "utf8").trim().split("\n").map(l => l.split("|"));
const css = fuentes.map(([fam, peso, archivo, rango]) => {
  const b64 = fs.readFileSync(path.join(dir, "fuentes", archivo)).toString("base64");
  return `@font-face{font-family:'${fam}';font-style:normal;font-weight:${peso};font-display:swap;src:url(data:font/woff2;base64,${b64}) format('woff2');unicode-range:${rango};}`;
}).join("\n");
const antes = html.length;
html = html.replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\s*/, "")
  .replace(/<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>\s*/, "")
  .replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2[^>]*>/, `<style>\n${css}\n</style>`);
if (html.length === antes || /fonts\.googleapis/.test(html)) throw new Error("No se encontraron los enlaces de Google Fonts en index.html");

// datos de app instalable
html = html.replace("</head>", `<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="${COLOR}">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="${CORTO}">
<link rel="apple-touch-icon" href="iconos/icono-apple-180.png">
<link rel="icon" type="image/png" href="iconos/icono-192.png">
</head>`);
html = html.replace("</body>", `<script>
// juego sin conexión (solo cuando se sirve por http/https; en la app nativa no hace falta)
if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
</script>
</body>`);

fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(path.join(www, "iconos"), { recursive: true });
fs.writeFileSync(path.join(www, "index.html"), html);
for (const f of fs.readdirSync(path.join(dir, "iconos"))) if (f.startsWith("icono")) fs.copyFileSync(path.join(dir, "iconos", f), path.join(www, "iconos", f));
fs.copyFileSync(path.join(dir, "privacidad.html"), path.join(www, "privacidad.html"));

fs.writeFileSync(path.join(www, "manifest.webmanifest"), JSON.stringify({
  name: NOMBRE, short_name: CORTO, lang: "es", start_url: "./index.html", scope: "./",
  display: "fullscreen", orientation: "any", background_color: COLOR, theme_color: COLOR,
  description: "Aventura bajo tierra con lanzadores de dardos de espuma: 4 mundos, 40 niveles, jefes y secretos.",
  categories: ["games", "kids"],
  icons: [
    { src: "iconos/icono-192.png", sizes: "192x192", type: "image/png" },
    { src: "iconos/icono-512.png", sizes: "512x512", type: "image/png" },
    { src: "iconos/icono-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
}, null, 2));

// el service worker cambia de versión cada vez que cambia el juego
const version = crypto.createHash("sha1").update(html).digest("hex").slice(0, 10);
const archivos = ["./", "index.html", "manifest.webmanifest", "privacidad.html", ...fs.readdirSync(path.join(www, "iconos")).map(f => "iconos/" + f)];
fs.writeFileSync(path.join(www, "sw.js"), `// Guarda el juego en el dispositivo para poder jugar sin internet
const CACHE = "abismo-${version}", ARCHIVOS = ${JSON.stringify(archivos)};
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => { if (e.request.method === "GET") e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); });
`);
console.log(`Listo: ${path.relative(process.cwd(), www)} (${Math.round(html.length / 1024)} KB, versión ${version})`);
