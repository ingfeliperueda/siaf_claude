// Hace las capturas de pantalla para las fichas de las tiendas (celular 1080x1920 y horizontal 1920x1080).
// Uso: node app/hacer-capturas.js [es|en]   (necesita Playwright)
const { chromium } = require("playwright");
const path = require("path"), fs = require("fs");
(async () => {
  const lang = process.argv[2] || "es", juego = "file://" + path.join(__dirname, "..", "index.html");
  const out = path.join(__dirname, "capturas", lang); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const formatos = [{ id: "celular", vp: { width: 360, height: 640 }, dpr: 3, dev: "phone", touch: true }, { id: "horizontal", vp: { width: 960, height: 540 }, dpr: 2, dev: "pc", touch: false }];
  for (const f of formatos) {
    const p = await b.newPage({ viewport: f.vp, deviceScaleFactor: f.dpr, hasTouch: f.touch, isMobile: f.touch });
    await p.goto(juego); await p.waitForTimeout(400);
    const ev = (fn, a) => p.evaluate(fn, a);
    await ev(([dev, lang]) => { chooseDevice(dev); setLang(lang); look.country = lang === "es" ? "ES" : "US"; fxAuto = false; }, [f.dev, lang]);
    const shot = async (n, espera = 900) => { await p.waitForTimeout(espera); await p.screenshot({ path: path.join(out, `${f.id}-${n}.png`) }); };
    await shot("1-menu", 1200);
    // partida en el mundo 2, con los monstruos a la vista
    await ev(() => { newGame(); P.weapons = ORDER.slice(0, 6); for (const id of P.weapons) { P.ammo[id] = WEAPONS[id].clip; P.res[id] = WEAPONS[id].res; } P.cur = 4; loadLevel(13); banner = 0; worldCard = 0; P.inv = 0; });
    await ev(() => { const m = monsters[0]; if (m) { P.x = m.x - 110; P.y = m.y; } for (const o of monsters.slice(0, 3)) o.alert = 5; });
    await p.waitForTimeout(600); await ev(() => { keys.KeyF = true; touch.fire = true; }); await shot("2-partida", 700); await ev(() => { keys.KeyF = false; touch.fire = false; });
    // un jefe saliendo del suelo
    await ev(() => { loadLevel(9); banner = 0; P.inv = 99; const a = arenas[0]; P.x = a.cx; P.y = a.cy; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (a.region && a.region.has(y * W + x)) markSeen(x, y); });
    await shot("3-jefe", 2600);
    // el mapa de los mundos
    await ev(() => { saved.prog = { unlocked: 16, stars: { 10: 3, 11: 2, 12: 3, 13: 1, 14: 2, 15: 3 }, beaten: false }; saved.level = 16; store.set(saveKey(), saved); openMap(16); });
    await shot("4-mapa", 1500);
    // un nivel secreto (sala de las runas)
    await ev(() => { loadRun(); loadLevel(2); const pi = tiles.indexOf(PORTAL); if (pi >= 0) { P.x = (pi % W) * 32 + 16; P.y = Math.floor(pi / W) * 32 + 16; update(0.016); } P.inv = 99; });
    await shot("5-secreto", 2600);
    // el editor del personaje
    await ev(() => { openCustom("edit"); });
    await shot("6-personaje", 1200);
    await p.close();
  }
  await b.close();
  console.log("Capturas en", out);
})();
