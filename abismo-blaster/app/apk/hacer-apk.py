#!/usr/bin/env python3
"""Crea la app de Android (APK) del juego sin necesitar Android Studio ni el SDK de Android.

Uso (desde abismo-blaster/app):
    npm run construir            # primero actualiza www/
    python3 apk/hacer-apk.py     # crea apk/AbismoBlaster.apk

Necesita Java (javac, jar, keytool, jarsigner). La primera vez descarga dx (el
compilador de Android) de Maven Central y crea una clave de firma en apk/clave/.
Guarda esa clave: hace falta la misma para instalar encima las versiones nuevas.
"""
import os, struct, subprocess, sys, tempfile, urllib.request, zipfile

AQUI = os.path.dirname(os.path.abspath(__file__))
WWW = os.path.join(AQUI, "..", "www")
SALIDA = os.path.join(AQUI, "AbismoBlaster.apk")
PAQUETE = "com.abismodeespuma.juego"
NOMBRE = "Abismo Blaster"
VERSION_CODE, VERSION_NAME = 1, "1.0"
MIN_SDK, TARGET_SDK = 24, 29  # target 29: basta la firma v1 (jarsigner)
ICONO = os.path.join(WWW, "iconos", "icono-192.png")
DX_URL = "https://repo1.maven.org/maven2/com/google/android/tools/dx/1.7/dx-1.7.jar"
CLAVE = os.path.join(AQUI, "clave", "abismo.keystore")
CLAVE_PASS = os.environ.get("APK_CLAVE", "abismo-de-espuma")  # contraseña de la clave creada con el nombre antiguo del juego

# IDs de los atributos android:* (de public.xml del framework)
A = {"theme": 0x01010000, "label": 0x01010001, "icon": 0x01010002, "name": 0x01010003,
     "exported": 0x01010010, "configChanges": 0x0101001f, "minSdkVersion": 0x0101020c,
     "versionCode": 0x0101021b, "versionName": 0x0101021c, "targetSdkVersion": 0x01010270,
     "allowBackup": 0x01010280, "hardwareAccelerated": 0x010102d3}
TEMA = 0x0103000a       # @android:style/Theme.Black.NoTitleBar.Fullscreen
ICONO_ID = 0x7f010000   # @drawable/icono (definido en resources.arsc)
T_REF, T_STR, T_DEC, T_HEX, T_BOOL = 0x01, 0x03, 0x10, 0x11, 0x12
NS = "http://schemas.android.com/apk/res/android"


def run(*cmd):
    subprocess.run(cmd, check=True)


def pool(strings):
    """Bloque de cadenas (ResStringPool) en UTF-16."""
    offs, data = [], b""
    for s in strings:
        offs.append(len(data))
        u = s.encode("utf-16-le")
        data += struct.pack("<H", len(u) // 2) + u + b"\0\0"
    data += b"\0" * (-len(data) % 4)
    start = 28 + 4 * len(strings)
    body = b"".join(struct.pack("<I", o) for o in offs) + data
    return struct.pack("<HHIIIIII", 0x0001, 28, 28 + len(body), len(strings), 0, 0, start, 0) + body


def manifest():
    """AndroidManifest.xml en formato binario (AXML)."""
    elems = [  # (profundidad, etiqueta, [(nombre, tipo, valor)])
        ("manifest", [("package", T_STR, PAQUETE), ("versionCode", T_DEC, VERSION_CODE), ("versionName", T_STR, VERSION_NAME)], [
            ("uses-sdk", [("minSdkVersion", T_DEC, MIN_SDK), ("targetSdkVersion", T_DEC, TARGET_SDK)], []),
            ("application", [("theme", T_REF, TEMA), ("label", T_STR, NOMBRE), ("icon", T_REF, ICONO_ID),
                             ("allowBackup", T_BOOL, True), ("hardwareAccelerated", T_BOOL, True)], [
                ("activity", [("name", T_STR, PAQUETE + ".MainActivity"), ("exported", T_BOOL, True),
                              ("configChanges", T_HEX, 0xdb0)], [  # orientation|screenSize|keyboard|... sin reiniciar
                    ("intent-filter", [], [
                        ("action", [("name", T_STR, "android.intent.action.MAIN")], []),
                        ("category", [("name", T_STR, "android.intent.category.LAUNCHER")], []),
                    ]),
                ]),
            ]),
        ]),
    ]
    # primero los nombres con ID de recurso (en el orden del mapa), después el resto
    ids = sorted(A, key=A.get)
    strings = list(ids)
    def idx(s):
        if s not in strings: strings.append(s)
        return strings.index(s)
    idx("android"); idx(NS)

    def walk(e, out):
        tag, attrs, kids = e
        out.append(("start", tag, attrs))
        for k in kids: walk(k, out)
        out.append(("end", tag, None))
    ev = []
    for e in elems: walk(e, ev)
    for kind, tag, attrs in ev:
        idx(tag)
        for n, t, v in attrs or []:
            idx(n)
            if t == T_STR: idx(v)

    nodes = struct.pack("<HHIII", 0x0100, 16, 24, 1, 0xFFFFFFFF) + struct.pack("<II", idx("android"), idx(NS))
    for kind, tag, attrs in ev:
        if kind == "end":
            nodes += struct.pack("<HHIIIII", 0x0103, 16, 24, 1, 0xFFFFFFFF, 0xFFFFFFFF, idx(tag))
            continue
        atts = b""
        for n, t, v in sorted(attrs, key=lambda a: A.get(a[0], 0)):
            ns = idx(NS) if n in A else 0xFFFFFFFF
            data = idx(v) if t == T_STR else (0xFFFFFFFF if v is True else int(v))
            raw = idx(v) if t == T_STR else 0xFFFFFFFF
            atts += struct.pack("<IIIHBBI", ns, idx(n), raw, 8, 0, t, data)
        n = len(attrs)
        nodes += struct.pack("<HHIII", 0x0102, 16, 36 + 20 * n, 1, 0xFFFFFFFF)
        nodes += struct.pack("<IIHHHHHH", 0xFFFFFFFF, idx(tag), 20, 20, n, 0, 0, 0) + atts
    nodes += struct.pack("<HHIIIII", 0x0101, 16, 24, 1, 0xFFFFFFFF, idx("android"), idx(NS))

    resmap = struct.pack("<HHI", 0x0180, 8, 8 + 4 * len(ids)) + b"".join(struct.pack("<I", A[n]) for n in ids)
    body = pool(strings) + resmap + nodes
    return struct.pack("<HHI", 0x0003, 8, 8 + len(body)) + body


def recursos(ruta_icono):
    """resources.arsc con un único recurso: @drawable/icono."""
    tipos, claves = pool(["drawable"]), pool(["icono"])
    nombre = PAQUETE.encode("utf-16-le").ljust(256, b"\0")
    spec = struct.pack("<HHIBBHI", 0x0202, 16, 20, 1, 0, 0, 1) + struct.pack("<I", 0)
    config = struct.pack("<I", 64) + b"\0" * 60
    entrada = struct.pack("<HHI", 8, 0, 0) + struct.pack("<HBBI", 8, 0, T_STR, 0)
    tipo_h = 20 + len(config)
    tipo = struct.pack("<HHIBBHII", 0x0201, tipo_h, tipo_h + 4 + len(entrada), 1, 0, 0, 1, tipo_h + 4) + config
    tipo += struct.pack("<I", 0) + entrada
    cab = 288
    paquete_body = tipos + claves + spec + tipo
    paquete = struct.pack("<HHII", 0x0200, cab, cab + len(paquete_body), 0x7f) + nombre
    paquete += struct.pack("<IIIII", cab, 1, cab + len(tipos), 1, 0) + paquete_body
    cadenas = pool([ruta_icono])
    return struct.pack("<HHII", 0x0002, 12, 12 + len(cadenas) + len(paquete), 1) + cadenas + paquete


def dex(tmp):
    """Compila MainActivity.java a classes.dex."""
    dx = os.path.join(AQUI, "clave", "dx-1.7.jar")
    if not os.path.exists(dx):
        os.makedirs(os.path.dirname(dx), exist_ok=True)
        print("Descargando dx…"); urllib.request.urlretrieve(DX_URL, dx)
    stubs = [os.path.join(r, f) for r, _, fs in os.walk(os.path.join(AQUI, "stubs")) for f in fs]
    src = [os.path.join(r, f) for r, _, fs in os.walk(os.path.join(AQUI, "java")) for f in fs]
    sd, cd = os.path.join(tmp, "stubs"), os.path.join(tmp, "clases")
    run("javac", "--release", "8", "-nowarn", "-d", sd, *stubs)
    run("javac", "--release", "8", "-nowarn", "-cp", sd, "-d", cd, *src)
    # dx 1.7 solo acepta clases de Java 6: el código no usa nada de Java 8, así que basta cambiar la versión
    for r, _, fs in os.walk(cd):
        for f in fs:
            p = os.path.join(r, f); b = bytearray(open(p, "rb").read()); b[6:8] = struct.pack(">H", 50)
            open(p, "wb").write(b)
    out = os.path.join(tmp, "classes.dex")
    run("java", "-cp", dx, "com.android.dx.command.Main", "--dex", "--output=" + out, cd)
    return open(out, "rb").read()


def main():
    if not os.path.exists(os.path.join(WWW, "index.html")):
        sys.exit("Falta www/index.html: ejecuta antes «npm run construir».")
    with tempfile.TemporaryDirectory() as tmp:
        sin_firmar = os.path.join(tmp, "app.apk")
        icono_apk = "res/drawable/icono.png"
        with zipfile.ZipFile(sin_firmar, "w", zipfile.ZIP_DEFLATED) as z:
            z.writestr("AndroidManifest.xml", manifest())
            z.writestr(zipfile.ZipInfo("resources.arsc"), recursos(icono_apk), zipfile.ZIP_STORED)
            z.writestr("classes.dex", dex(tmp))
            z.write(ICONO, icono_apk, zipfile.ZIP_STORED)
            for r, _, fs in os.walk(WWW):
                for f in sorted(fs):
                    if f == "sw.js": continue  # el service worker no hace falta dentro de la app
                    p = os.path.join(r, f)
                    z.write(p, "assets/" + os.path.relpath(p, WWW).replace(os.sep, "/"))
        if not os.path.exists(CLAVE):
            os.makedirs(os.path.dirname(CLAVE), exist_ok=True)
            run("keytool", "-genkeypair", "-keystore", CLAVE, "-storepass", CLAVE_PASS, "-keypass", CLAVE_PASS,
                "-alias", "abismo", "-keyalg", "RSA", "-keysize", "2048", "-validity", "10000",
                "-dname", "CN=Abismo Blaster")
        run("jarsigner", "-keystore", CLAVE, "-storepass", CLAVE_PASS, "-sigalg", "SHA256withRSA",
            "-digestalg", "SHA-256", "-signedjar", SALIDA, sin_firmar, "abismo")
    print("Listo:", os.path.relpath(SALIDA), f"({os.path.getsize(SALIDA) // 1024} KB)")


if __name__ == "__main__":
    main()
