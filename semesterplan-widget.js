// Semesterplan-Widget für Scriptable (iPhone und iPad)
// Lädt die Termine bei jeder Aktualisierung neu von der Website.
// Änderst du termine.js auf GitHub, zeigt das Widget es beim nächsten Neuladen von selbst an.
//
// Parameter im Widget (lange drücken -> Widget bearbeiten -> Parameter), optional:
//   leer      -> nächste Termine (bei klein: nächster Termin + Klausur-Countdown)
//   klausur   -> nur Klausur-Countdown
//   termine   -> nur Termine, ohne Countdown
//   heute     -> nur heute und morgen

const SITE  = "https://denik-coder.github.io/Adventskalender-2026/";
const DATA  = SITE + "termine.js";
const CACHE = "semesterplan-termine.json";

const HUE = {
  "Analysis & Lineare Algebra": 220, "Logik & Algebra": 255, "BWL: Einführung": 140, "BWL: Marketing": 168,
  "Grundlagen der IT": 282, "Einführung in die Programmierung": 335, "Einführung in die Wirtschaftsinformatik": 192,
  "Vertrags- und Schuldrecht": 105, "Wissenschaftliches Arbeiten": 312, "Präsentations- & Kommunikationskompetenz": 68
};

const fm = FileManager.local();
const cachePfad = fm.joinPath(fm.cacheDirectory(), CACHE);

async function ladeTermine() {
  try {
    const req = new Request(DATA);
    req.timeoutInterval = 15;
    const text = await req.loadString();
    const a = text.indexOf("["), b = text.lastIndexOf("]");
    if (a < 0 || b < a) throw new Error("Format");
    const daten = JSON.parse(text.slice(a, b + 1));
    if (!Array.isArray(daten) || !daten.length) throw new Error("leer");
    fm.writeString(cachePfad, JSON.stringify(daten));
    return { daten: daten, offline: false };
  } catch (e) {
    if (fm.fileExists(cachePfad)) {
      try { return { daten: JSON.parse(fm.readString(cachePfad)), offline: true }; } catch (e2) {}
    }
    return { daten: [], offline: true };
  }
}

const pad = n => String(n).padStart(2, "0");
const keyOf = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
function zeitpunkt(t, feld) {
  const p = t.datum.split("-"), u = (t[feld] || "00:00").split(":");
  return new Date(+p[0], +p[1] - 1, +p[2], +u[0], +u[1]);
}
function farbe(t) {
  if (t.art === "pruefung") return new Color("#ef4444");
  if (t.art === "sonstiges") return new Color("#94a3b8");
  let h = HUE[t.titel];
  if (h == null) { h = 7; for (const c of t.titel) h = (h * 31 + c.charCodeAt(0)) >>> 0; h = h % 360; }
  return Color.dynamic(hsl(h, 0.55, 0.42), hsl(h, 0.70, 0.62));
}
function hsl(h, s, l) {
  const f = n => {
    const k = (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const v = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(v * 255);
  };
  const hex = n => pad(n.toString(16));
  return new Color("#" + hex(f(0)) + hex(f(8)) + hex(f(4)));
}
function tagLabel(d) {
  const heute = new Date(), morgen = new Date(); morgen.setDate(morgen.getDate() + 1);
  if (keyOf(d) === keyOf(heute)) return "HEUTE";
  if (keyOf(d) === keyOf(morgen)) return "MORGEN";
  const wd = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][d.getDay()];
  return wd + ", " + d.getDate() + "." + (d.getMonth() + 1) + ".";
}
function restText(ziel) {
  const ms = ziel - new Date();
  if (ms <= 0) return "jetzt";
  const tage = Math.floor(ms / 864e5);
  if (tage >= 1) return "noch " + tage + (tage === 1 ? " Tag" : " Tage");
  const std = Math.floor(ms / 36e5), min = Math.floor((ms % 36e5) / 6e4);
  return std >= 1 ? "in " + std + " h " + min + " min" : "in " + min + " min";
}

const FARBE_TEXT  = Color.dynamic(new Color("#0f172a"), new Color("#f8fafc"));
const FARBE_GRAU  = Color.dynamic(new Color("#64748b"), new Color("#94a3b8"));
const FARBE_BG    = Color.dynamic(new Color("#ffffff"), new Color("#0f172a"));

function zeileTermin(stack, t, klein) {
  const row = stack.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();

  const strich = row.addStack();
  strich.size = new Size(3, klein ? 22 : 26);
  strich.cornerRadius = 2;
  strich.backgroundColor = farbe(t);
  row.addSpacer(6);

  const txt = row.addStack();
  txt.layoutVertically();
  const titel = txt.addText(t.titel);
  titel.font = Font.semiboldSystemFont(klein ? 11 : 12);
  titel.textColor = FARBE_TEXT;
  titel.lineLimit = 1;

  const info = t.von + "–" + t.bis + (t.raum ? "  " + t.raum : "");
  const sub = txt.addText(info);
  sub.font = Font.systemFont(klein ? 9 : 10);
  sub.textColor = FARBE_GRAU;
  sub.lineLimit = 1;
}

async function baue() {
  const { daten, offline } = await ladeTermine();
  const w = new ListWidget();
  w.backgroundColor = FARBE_BG;
  w.setPadding(12, 13, 12, 13);
  w.url = SITE + "semesterplaner.html";

  const familie = config.runsInWidget ? config.widgetFamily : "medium";
  const klein = familie === "small";
  const param = (args.widgetParameter || "").trim().toLowerCase();

  if (!daten.length) {
    const t = w.addText("Keine Termine geladen");
    t.font = Font.semiboldSystemFont(13); t.textColor = FARBE_TEXT;
    const s = w.addText("Prüfe die Internetverbindung.");
    s.font = Font.systemFont(10); s.textColor = FARBE_GRAU;
    return w;
  }

  const jetzt = new Date();
  let kommend = daten
    .filter(t => t && t.datum && t.von && t.bis && t.titel)
    .map(t => ({ t: t, start: zeitpunkt(t, "von"), ende: zeitpunkt(t, "bis") }))
    .filter(x => x.ende > jetzt)
    .sort((a, b) => a.start - b.start);

  if (param === "heute") {
    const grenze = new Date(); grenze.setDate(grenze.getDate() + 2); grenze.setHours(0, 0, 0, 0);
    kommend = kommend.filter(x => x.start < grenze);
  }

  const klausur = daten
    .map(t => ({ t: t, start: zeitpunkt(t, "von") }))
    .filter(x => x.t.art === "pruefung" && x.start > jetzt)
    .sort((a, b) => a.start - b.start)[0];

  // Kopfzeile
  const kopf = w.addStack();
  kopf.layoutHorizontally();
  kopf.centerAlignContent();
  const sym = kopf.addImage(SFSymbol.named("calendar").image);
  sym.imageSize = new Size(12, 12);
  sym.tintColor = new Color("#38bdf8");
  kopf.addSpacer(5);
  const titel = kopf.addText(offline ? "Semesterplan · offline" : "Semesterplan");
  titel.font = Font.semiboldSystemFont(11);
  titel.textColor = new Color("#38bdf8");
  kopf.addSpacer();

  if (!klein && klausur && param !== "termine") {
    const st = kopf.addStack();
    st.layoutVertically();
    const a = st.addText(restText(klausur.start));
    a.font = Font.boldSystemFont(11);
    a.textColor = new Color("#ef4444");
    a.rightAlignText();
    const b = st.addText(klausur.t.titel);
    b.font = Font.systemFont(9);
    b.textColor = FARBE_GRAU;
    b.lineLimit = 1;
    b.rightAlignText();
  }
  w.addSpacer(8);

  // Nur Klausur-Countdown
  if (param === "klausur") {
    if (!klausur) {
      const t = w.addText("Keine Klausur mehr"); t.font = Font.semiboldSystemFont(13); t.textColor = FARBE_TEXT;
      return w;
    }
    const a = w.addText(restText(klausur.start));
    a.font = Font.boldSystemFont(klein ? 18 : 24);
    a.textColor = new Color("#ef4444");
    w.addSpacer(3);
    const b = w.addText(klausur.t.titel);
    b.font = Font.semiboldSystemFont(klein ? 11 : 13);
    b.textColor = FARBE_TEXT; b.lineLimit = 2;
    const c = w.addText(tagLabel(klausur.start) + "  " + klausur.t.von);
    c.font = Font.systemFont(10); c.textColor = FARBE_GRAU;
    return w;
  }

  if (!kommend.length) {
    const t = w.addText(param === "heute" ? "Heute und morgen nichts" : "Keine Termine mehr");
    t.font = Font.semiboldSystemFont(13); t.textColor = FARBE_TEXT;
    return w;
  }

  const maxZeilen = klein ? 2 : familie === "medium" ? 3 : 7;
  let letzterTag = null, gezeigt = 0;

  for (const x of kommend) {
    if (gezeigt >= maxZeilen) break;
    const tag = keyOf(x.start);
    if (tag !== letzterTag && !klein) {
      if (letzterTag !== null) w.addSpacer(6);
      const l = w.addText(tagLabel(x.start));
      l.font = Font.boldSystemFont(9);
      l.textColor = FARBE_GRAU;
      w.addSpacer(3);
      letzterTag = tag;
    }
    zeileTermin(w, x.t, klein);
    gezeigt++;
    if (gezeigt < maxZeilen) w.addSpacer(5);
  }

  if (klein && klausur) {
    w.addSpacer(5);
    const a = w.addText(restText(klausur.start) + " · " + klausur.t.titel);
    a.font = Font.semiboldSystemFont(9);
    a.textColor = new Color("#ef4444");
    a.lineLimit = 1;
  }

  w.addSpacer();
  return w;
}

const widget = await baue();
if (config.runsInWidget) Script.setWidget(widget);
else await widget.presentMedium();
Script.complete();
