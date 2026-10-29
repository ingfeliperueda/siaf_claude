// Genera los iconos y la imagen destacada de la tienda usando los dibujos del propio juego.
// Uso: node app/hacer-iconos.js   (necesita Playwright)
const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const juego = "file://" + path.join(__dirname, "..", "index.html"), out = path.join(__dirname, "iconos");
  const b = await chromium.launch();
  const shot = async (w, h, file, scene) => {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await p.goto(juego); await p.waitForTimeout(400);
    await p.evaluate(sc => {
      chooseDevice("pc"); state = "icono"; settings.a11y.motion = true; setLang(sc.lang || "es");
      GUN_K = 48; DART_K = 48; for (const k in GUN_SPR) delete GUN_SPR[k]; DART_SPR.clear();
      window.draw = () => {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const S = Math.min(VW, VH), cx = VW / 2, cy = VH / 2;
        const g = ctx.createRadialGradient(cx, cy * 0.9, S * 0.05, cx, cy, S * 0.75);
        g.addColorStop(0, "#ffb347"); g.addColorStop(0.35, "#c2561a"); g.addColorStop(1, "#1a0c06");
        ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
        // estalactitas
        ctx.fillStyle = "rgba(20,10,5,0.75)";
        for (let i = 0; i < 9; i++) { const x = i / 8 * VW, h = S * (0.08 + (i % 3) * 0.05); ctx.beginPath(); ctx.moveTo(x - S * 0.07, 0); ctx.lineTo(x, h); ctx.lineTo(x + S * 0.07, 0); ctx.fill(); }
        const k = sc.safe ? 0.78 : 1;
        if (sc.wide) {
          ctx.save(); ctx.translate(VW * 0.24, VH * 0.58); ctx.scale(S * 0.012, S * 0.012); drawHeroStatic(0, 0, -0.25, "cohete", 0); ctx.restore();
          ctx.fillStyle = "#fff3dc"; ctx.font = `900 ${VH * 0.16}px ${TITLE_FONT}`; ctx.textAlign = "center"; ctx.shadowColor = "rgba(0,0,0,0.7)"; ctx.shadowBlur = 18;
          ctx.fillText(sc.title, VW * 0.64, VH * 0.5, VW * 0.6); ctx.font = `bold ${VH * 0.06}px system-ui`; ctx.fillStyle = "#ffe2a8"; ctx.fillText(sc.sub, VW * 0.64, VH * 0.64); ctx.shadowBlur = 0;
          for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(VW * (0.42 + i * 0.12), VH * 0.82); ctx.rotate(-0.15); ctx.scale(S * 0.018, S * 0.018); drawDartShape(["#3fb7ff", "#ff4fa3", "#9be15d", "#ffd23f"][i], "#ff6a00"); ctx.restore(); }
          return;
        }
        // lanzador grande en diagonal y dos dardos volando
        ctx.save(); ctx.translate(cx - S * 0.1 * k, cy + S * 0.1 * k); ctx.rotate(-0.5); ctx.scale(S * 0.028 * k, S * 0.028 * k); drawGun("pistola", 1, { recoil: 0, spin: 0, reload: 0, t: 0 }); ctx.restore();
        for (const [dx, dy, c] of [[0.3, -0.3, "#3fb7ff"], [0.38, -0.12, "#ff4fa3"]]) { ctx.save(); ctx.translate(cx + S * dx * k, cy + S * dy * k); ctx.rotate(-0.5); ctx.scale(S * 0.016 * k, S * 0.016 * k); drawDartShape(c, "#ff6a00"); ctx.restore(); }
        const sg = ctx.createRadialGradient(cx + S * 0.2 * k, cy - S * 0.12 * k, 0, cx + S * 0.2 * k, cy - S * 0.12 * k, S * 0.1); sg.addColorStop(0, "rgba(255,255,220,0.85)"); sg.addColorStop(1, "rgba(255,255,220,0)");
        ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx + S * 0.2 * k, cy - S * 0.12 * k, S * 0.1, 0, 7); ctx.fill();
      };
    }, scene);
    await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(out, file) });
    await p.close();
  };
  await shot(512, 512, "icono-512.png", {});
  await shot(192, 192, "icono-192.png", {});
  await shot(180, 180, "icono-apple-180.png", {});
  await shot(512, 512, "icono-maskable-512.png", { safe: true });
  await shot(1024, 500, "imagen-destacada-1024x500.png", { wide: true, lang: "es", title: "ABISMO BLASTER", sub: "5 mundos · 75 niveles · jefes y secretos" });
  await shot(1024, 500, "imagen-destacada-en-1024x500.png", { wide: true, lang: "en", title: "ABYSS BLASTER", sub: "5 worlds · 75 levels · bosses and secrets" });
  await b.close();
  console.log("Iconos creados en", out);
})();
