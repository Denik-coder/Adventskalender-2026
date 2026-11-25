/* ==========================================================================
   GLÜCKSPALAST – versteckte Spielhalle im Semesterplaner
   Fünf Mal auf die Überschrift klicken öffnet sie.
   Alles ist Spielgeld ohne Geldwert. Nichts kann gekauft oder ausgezahlt werden.
   Der Spielstand liegt nur im Browser (localStorage).
   ========================================================================== */
(function () {
  'use strict';

  /* ======================= Hilfsmittel ======================= */

  var Z = {
    // echter Zufall aus dem Browser
    zahl: function () {
      var a = new Uint32Array(1);
      crypto.getRandomValues(a);
      return a[0] / 4294967296;
    },
    bis: function (n) { return Math.floor(Z.zahl() * n); },
    aus: function (arr) { return arr[Z.bis(arr.length)]; }
  };

  function nz(n) { return Number(n || 0).toLocaleString('de-DE'); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function heute() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function datumKurz(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' +
           String(d.getFullYear()).slice(2);
  }

  /* ======================= Gewinnlinien ======================= */

  var LINIEN_10 = [
    [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [2, 2, 2, 2, 2], [0, 1, 2, 1, 0], [2, 1, 0, 1, 2],
    [0, 0, 1, 2, 2], [2, 2, 1, 0, 0], [1, 0, 0, 0, 1], [1, 2, 2, 2, 1], [1, 0, 1, 0, 1]
  ];
  var LINIEN_20 = LINIEN_10.concat([
    [1, 2, 1, 0, 1], [0, 1, 1, 1, 0], [2, 1, 1, 1, 2], [0, 1, 0, 1, 0], [2, 1, 2, 1, 2],
    [1, 1, 0, 1, 1], [1, 1, 2, 1, 1], [0, 2, 0, 2, 0], [2, 0, 2, 0, 2], [0, 2, 2, 2, 0]
  ]);
  var LINIEN_5 = [[1, 1, 1], [0, 0, 0], [2, 2, 2], [0, 1, 2], [2, 1, 0]];

  /* ======================= Die fünf Automaten ======================= */

  function s(id, name, cls, glyph, txt, pay) {
    return { id: id, name: name, cls: cls, glyph: glyph, txt: txt, pay: pay || {} };
  }

  var SPIELE = {

    /* ---------------- ALGE – König der Meere ---------------- */
    alge: {
      id: 'alge', name: 'ALGE – König der Meere', kurz: 'ALGE', icon: '🧜‍♀️',
      walzen: 5, reihen: 3, linien: LINIEN_10, einsatz: 10,
      stufen: [10, 20, 50, 100, 200, 500, 1000],
      farbe: '#3ddc84', feldBg: 'linear-gradient(180deg,#113a2a,#07211a)',
      badge: 'KULT-AUTOMAT', volatil: 'sehr hoch', rtp: '96 %',
      kopfBg: 'linear-gradient(160deg,#0f5132,#07211a)',
      beschreibung: 'Der legendäre Kult-Automat: 5 Walzen, 10 Linien, der Alge-König zahlt bis 5.000× (schon ab 2!). Drei ALGE-Dosen starten bis zu 12 Freispiele mit Spezialsymbol und Multiplikator bis ×10.',
      tags: ['10 Gewinnlinien', 'ALGE-Dose Wild+Scatter', 'Expandierendes Symbol', 'Risikoleiter'],
      wild: 'dose', scatter: 'dose',
      scatterPay: { 3: 2, 4: 20, 5: 200 },
      freispiele: { 3: 8, 4: 10, 5: 12 },
      expandiert: true, risiko: true,
      symbole: [
        s('koenig', 'Der Alge-König', 'k-gold', '🧜‍♀️', null, { 2: 10, 3: 100, 4: 1000, 5: 5000 }),
        s('dreizack', 'Goldener Dreizack', 'k-gold', '🔱', null, { 2: 5, 3: 40, 4: 400, 5: 2000 }),
        s('truhe', 'Schatztruhe', 'k-gold', '🧰', null, { 2: 5, 3: 40, 4: 400, 5: 2000 }),
        s('muschel', 'Perlenmuschel', 'k-gold', '🐚', null, { 2: 5, 3: 30, 4: 100, 5: 750 }),
        s('anker', 'Goldanker', 'k-gold', '⚓', null, { 2: 5, 3: 30, 4: 100, 5: 750 }),
        s('a', 'Ass (A)', 'k-a', null, 'A', { 3: 5, 4: 40, 5: 150 }),
        s('k', 'König (K)', 'k-k', null, 'K', { 3: 5, 4: 40, 5: 150 }),
        s('q', 'Dame (Q)', 'k-q', null, 'Q', { 3: 5, 4: 25, 5: 100 }),
        s('j', 'Bube (J)', 'k-j', null, 'J', { 3: 5, 4: 25, 5: 100 }),
        s('t', 'Zehn (10)', 'k-10', null, '10', { 3: 5, 4: 25, 5: 100 }),
        s('dose', 'ALGE-Dose (Wild & Scatter)', 's-dose', null, 'ALGE', {})
      ],
      gewichte: [
        { koenig: 30, dreizack: 47, truhe: 47, muschel: 55, anker: 55, a: 134, k: 134, q: 134, j: 134, t: 134, dose: 24 },
        { koenig: 30, dreizack: 47, truhe: 47, muschel: 55, anker: 55, a: 134, k: 134, q: 134, j: 134, t: 134, dose: 24 },
        { koenig: 30, dreizack: 47, truhe: 47, muschel: 55, anker: 55, a: 134, k: 134, q: 134, j: 134, t: 134, dose: 24 },
        { koenig: 30, dreizack: 47, truhe: 47, muschel: 55, anker: 55, a: 134, k: 134, q: 134, j: 134, t: 134, dose: 24 },
        { koenig: 30, dreizack: 47, truhe: 47, muschel: 55, anker: 55, a: 134, k: 134, q: 134, j: 134, t: 134, dose: 24 }
      ],
      regeln: [
        '10 feste Gewinnlinien, gewertet wird von links nach rechts. Alle Themen-Symbole (Anker, Muschel, Schatztruhe, Dreizack, Alge-König) zahlen schon ab <b>2 gleichen</b>!',
        '<b>ALGE-Dose</b> ist Wild und Scatter zugleich: Sie ersetzt jedes Symbol und zahlt überall (3 = 2×, 4 = 20×, 5 = 200× Einsatz).',
        '3, 4 oder 5 ALGE-Dosen starten <b>8, 10 oder 12 Freispiele</b>. Vor Beginn wird ein zufälliges <b>Spezialsymbol</b> gezogen.',
        '<b>Freispiel-Multiplikator:</b> startet bei ×1, jeder Gewinn erhöht ihn um 1 bis ×10. Er gilt für alle Gewinne inklusive Spezialsymbol.',
        'In den Freispielen breitet sich das Spezialsymbol über die ganze Walze aus (alle 3 Reihen), sobald genug davon für einen Gewinn gelandet sind – und zahlt auf allen 10 Linien!',
        '<b>Risikoleiter &amp; Kartenrisiko:</b> Nach jedem Gewinn kannst du auf der blinkenden Risikoleiter hochdrücken (inkl. ½ Teilen) oder im Kartenrisiko Rot/Schwarz tippen.'
      ]
    },

    /* ---------------- Frucht-Express ---------------- */
    frucht: {
      id: 'frucht', name: 'Frucht-Express', kurz: 'Frucht-Express', icon: '🍒',
      walzen: 3, reihen: 3, linien: LINIEN_5, einsatz: 20,
      stufen: [20, 40, 100, 200, 500, 1000],
      farbe: '#f4536d', feldBg: 'linear-gradient(180deg,#fdf6ec,#e6d9c6)',
      badge: 'RISIKO-KLASSIKER', volatil: 'niedrig', rtp: '95 %',
      kopfBg: 'linear-gradient(160deg,#7a1024,#2a0a12)',
      beschreibung: 'Der deutsche Spielhallen-Klassiker: drei Walzen, fünf Linien, Hochglanz-Früchte & Doppel-777. Nach jedem Treffer lockt die Risikoleiter!',
      tags: ['5 Gewinnlinien', 'Risikoleiter + Teilen', 'Kirschen ab 2'],
      wild: null, scatter: null, risiko: true, hell: true,
      mischGruppe: ['sieben', 'bar'], mischPay: 20,
      symbole: [
        s('sieben', 'Doppel-777', 's-sieben', null, '7', { 3: 400 }),
        s('bar', 'Dreifach-BAR', 's-bar', null, 'BAR', { 3: 150 }),
        s('glocke', 'Goldglocke', 'k-gold', '🔔', null, { 3: 75 }),
        s('trauben', 'Edel-Trauben', 'k-gold', '🍇', null, { 3: 40 }),
        s('orange', 'Orange', 'k-gold', '🍊', null, { 3: 30 }),
        s('zitrone', 'Zitrone', 'k-gold', '🍋', null, { 3: 25 }),
        s('kirsche', 'Hochglanz-Kirschen', 'k-gold', '🍒', null, { 2: 2, 3: 8 })
      ],
      gewichte: [
        { sieben: 26, bar: 38, glocke: 51, trauben: 66, orange: 74, zitrone: 80, kirsche: 128 },
        { sieben: 26, bar: 38, glocke: 51, trauben: 66, orange: 74, zitrone: 80, kirsche: 128 },
        { sieben: 26, bar: 38, glocke: 51, trauben: 66, orange: 74, zitrone: 80, kirsche: 128 }
      ],
      regeln: [
        'Gewertet wird von links nach rechts auf 5 Linien. Einsatz pro Linie: ein Fünftel des Gesamteinsatzes.',
        'Kirschen zahlen schon ab <b>zwei</b> auf den ersten Walzen.',
        'Drei beliebig gemischte BAR- und 7-Symbole zahlen ebenfalls.',
        '<b>Risikoleiter &amp; Kartenrisiko:</b> Nach jedem Gewinn kannst du auf der Risikoleiter hochdrücken (inkl. ½ Teilen) oder Rot/Schwarz tippen (50/50).'
      ]
    },

    /* ---------------- Sternenjuwelen ---------------- */
    sterne: {
      id: 'sterne', name: 'Sternenjuwelen', kurz: 'Sternenjuwelen', icon: '💎',
      walzen: 5, reihen: 3, linien: LINIEN_20, einsatz: 20,
      stufen: [20, 40, 100, 200, 400, 1000],
      farbe: '#a78bfa', feldBg: 'linear-gradient(180deg,#2a2160,#120d2e)',
      badge: 'MULTI ×10', volatil: 'mittel', rtp: '95,5 %',
      kopfBg: 'linear-gradient(160deg,#3b2a8c,#140d2e)',
      beschreibung: 'Funkelnde Edelsteine im Kosmos. Wilds auf den mittleren Walzen, goldene Sterne zahlen überall und zünden bis zu 20 Freispiele. Jeder Gewinn erhöht den Multiplikator bis ×10.',
      tags: ['20 Gewinnlinien', 'Wild auf Walze 2–4', 'Multiplikator bis ×10'],
      wild: 'wild', scatter: 'stern',
      wildWalzen: [1, 2, 3],
      scatterPay: { 3: 2, 4: 10, 5: 50 },
      freispiele: { 3: 10, 4: 15, 5: 20 },
      risiko: false,
      symbole: [
        s('krone', 'Reichskrone', 'k-gold', '👑', null, { 3: 60, 4: 250, 5: 1250 }),
        s('rubin', 'Kaiser-Rubin', 'k-gold', '💎', null, { 3: 30, 4: 125, 5: 400 }),
        s('ring', 'Saphir-Ring', 'k-gold', '💍', null, { 3: 20, 4: 60, 5: 200 }),
        s('kugel', 'Orakelkugel', 'k-gold', '🔮', null, { 3: 12, 4: 40, 5: 125 }),
        s('komet', 'Komet', 'k-gold', '☄️', null, { 3: 10, 4: 25, 5: 90 }),
        s('mond', 'Goldmond', 'k-gold', '🌙', null, { 3: 6, 4: 20, 5: 75 }),
        s('planet', 'Smaragd-Planet', 'k-gold', '🪐', null, { 3: 6, 4: 20, 5: 60 }),
        s('wild', 'WILD (Walze 2–4)', 's-wild', null, 'WILD', {}),
        s('stern', 'Goldstern (zahlt überall)', 'k-gold', '⭐', null, {})
      ],
      gewichte: [
        { krone: 39, rubin: 55, ring: 67, kugel: 87, komet: 95, mond: 122, planet: 122, stern: 14 },
        { krone: 39, rubin: 55, ring: 67, kugel: 87, komet: 95, mond: 122, planet: 122, stern: 14, wild: 41 },
        { krone: 39, rubin: 55, ring: 67, kugel: 87, komet: 95, mond: 122, planet: 122, stern: 14, wild: 41 },
        { krone: 39, rubin: 55, ring: 67, kugel: 87, komet: 95, mond: 122, planet: 122, stern: 14, wild: 41 },
        { krone: 39, rubin: 55, ring: 67, kugel: 87, komet: 95, mond: 122, planet: 122, stern: 14 }
      ],
      regeln: [
        '20 feste Linien, von links nach rechts. Einsatz pro Linie: ein Zwanzigstel. Linienwerte werden gerundet.',
        '<b>WILD</b> erscheint nur auf den Walzen 2, 3 und 4 und ersetzt alle Symbole außer dem Stern.',
        '<b>Goldstern</b> zahlt überall: 3 = 2×, 4 = 10×, 5 = 50× Einsatz und startet 10 / 15 / 20 Freispiele.',
        '<b>Freispiel-Multiplikator:</b> startet bei ×1, jeder Gewinn erhöht ihn um 1 bis ×10. Weitere Sterne geben zusätzliche Freispiele.'
      ]
    },

    /* ---------------- Drachenhort ---------------- */
    drache: {
      id: 'drache', name: 'Drachenhort', kurz: 'Drachenhort', icon: '🐉',
      walzen: 5, reihen: 3, linien: LINIEN_10, einsatz: 200,
      stufen: [100, 200, 400, 1000, 2000],
      farbe: '#2dd4bf', feldBg: 'linear-gradient(180deg,#123a30,#06211b)',
      badge: 'HOLD & WIN · GRAND', volatil: 'hoch', rtp: '95 %',
      kopfBg: 'linear-gradient(160deg,#7a2410,#2a0d08)',
      beschreibung: 'Geprägte Goldmünzen tragen fette Werte. Sechs oder mehr starten Hold & Win: Münzen kleben fest, jede neue setzt die Respins zurück. Volles Feld knackt den GRAND!',
      tags: ['10 Gewinnlinien', 'Hold & Win', '4 Jackpots'],
      wild: 'wild', scatter: null,
      wildWalzen: [1, 2, 3, 4],
      holdWin: true,
      jackpots: { mini: 4000, minor: 10000, major: 50000 },
      muenzWerte: [1, 1, 1, 2, 2, 2, 3, 3, 5, 5, 8, 10, 15],
      risiko: false,
      symbole: [
        s('drache', 'Kaiserdrache', 'k-gold', '🐉', null, { 3: 80, 4: 300, 5: 1500 }),
        s('umschlag', 'Glücksumschlag', 'k-gold', '🧧', null, { 3: 35, 4: 125, 5: 500 }),
        s('laterne', 'Seidenlaterne', 'k-gold', '🏮', null, { 3: 25, 4: 80, 5: 300 }),
        s('a', 'Ass (A)', 'k-a', null, 'A', { 3: 15, 4: 40, 5: 150 }),
        s('k', 'König (K)', 'k-k', null, 'K', { 3: 12, 4: 35, 5: 125 }),
        s('q', 'Dame (Q)', 'k-q', null, 'Q', { 3: 8, 4: 25, 5: 80 }),
        s('j', 'Bube (J)', 'k-j', null, 'J', { 3: 8, 4: 25, 5: 80 }),
        s('wild', 'Feuer-WILD (Walze 2–5)', 's-wild', '🔥', null, {}),
        s('muenze', 'Goldmünze', 's-muenze', '🪙', null, {})
      ],
      gewichte: [
        { drache: 6, umschlag: 12, laterne: 17, a: 26, k: 32, q: 46, j: 46, muenze: 22 },
        { drache: 6, umschlag: 12, laterne: 17, a: 26, k: 32, q: 46, j: 46, muenze: 22, wild: 9 },
        { drache: 6, umschlag: 12, laterne: 17, a: 26, k: 32, q: 46, j: 46, muenze: 22, wild: 9 },
        { drache: 6, umschlag: 12, laterne: 17, a: 26, k: 32, q: 46, j: 46, muenze: 22, wild: 9 },
        { drache: 6, umschlag: 12, laterne: 17, a: 26, k: 32, q: 46, j: 46, muenze: 22, wild: 9 }
      ],
      regeln: [
        '10 Linien, von links nach rechts. <b>Feuer-WILD</b> auf den Walzen 2 bis 5.',
        '<b>Goldmünzen</b> tragen 1× bis 15× Einsatz oder einen Jackpot (MINI 4.000, MINOR 10.000, MAJOR 50.000).',
        'Ab <b>6 Münzen</b> startet Hold &amp; Win: Die Münzen bleiben liegen, du hast 3 Respins. Jede neue Münze setzt die Respins auf 3 zurück.',
        'Alle 15 Felder voll: Du gewinnst zusätzlich den progressiven <b>GRAND</b>-Jackpot. 1 % jedes Einsatzes fließt in den Topf.'
      ]
    },

    /* ---------------- Grimoire ---------------- */
    grimoire: {
      id: 'grimoire', name: 'Grimoire', kurz: 'Grimoire', icon: '🦉',
      walzen: 5, reihen: 3, linien: LINIEN_10, einsatz: 20,
      stufen: [20, 40, 100, 200, 500, 1000],
      farbe: '#fbbf24', feldBg: 'linear-gradient(180deg,#2e2250,#140e26)',
      badge: 'DAS ZAUBERBUCH', volatil: 'sehr hoch', rtp: '96,5 %',
      kopfBg: 'linear-gradient(160deg,#4c1d95,#1a0d33)',
      beschreibung: 'Drei Zauberbücher öffnen bis zu 12 Freispiele mit Spezialsymbol und Multiplikator bis ×10. Plus echte Risikoleiter!',
      tags: ['10 Gewinnlinien', 'Expandierendes Symbol', 'Risikoleiter'],
      wild: 'buch', scatter: 'buch',
      scatterPay: { 3: 2, 4: 20, 5: 200 },
      freispiele: { 3: 8, 4: 10, 5: 12 },
      expandiert: true, risiko: true,
      symbole: [
        s('sanduhr', 'Sanduhr', 'k-gold', '⏳', null, { 2: 8, 3: 80, 4: 800, 5: 4000 }),
        s('eule', 'Goldene Eule', 'k-gold', '🦉', null, { 2: 4, 3: 25, 4: 250, 5: 1250 }),
        s('elixier', 'Elixier', 'k-gold', '⚗️', null, { 3: 15, 4: 60, 5: 500 }),
        s('leuchter', 'Goldleuchter', 'k-gold', '🕯️', null, { 3: 15, 4: 60, 5: 500 }),
        s('luft', 'Luft-Rune', 's-rune s-rune-luft', null, '△', { 3: 4, 4: 20, 5: 100 }),
        s('erde', 'Erd-Rune', 's-rune s-rune-erde', null, '▽', { 3: 4, 4: 20, 5: 100 }),
        s('wasser', 'Wasser-Rune', 's-rune s-rune-wasser', null, '▽', { 3: 4, 4: 20, 5: 100 }),
        s('feuer', 'Feuer-Rune', 's-rune s-rune-feuer', null, '△', { 3: 4, 4: 20, 5: 100 }),
        s('buch', 'Grimoire (Wild & Scatter)', 's-buch', '📖', null, {})
      ],
      gewichte: [
        { sanduhr: 17, eule: 36, elixier: 50, leuchter: 50, luft: 120, erde: 120, wasser: 120, feuer: 120, buch: 17 },
        { sanduhr: 17, eule: 36, elixier: 50, leuchter: 50, luft: 120, erde: 120, wasser: 120, feuer: 120, buch: 17 },
        { sanduhr: 17, eule: 36, elixier: 50, leuchter: 50, luft: 120, erde: 120, wasser: 120, feuer: 120, buch: 17 },
        { sanduhr: 17, eule: 36, elixier: 50, leuchter: 50, luft: 120, erde: 120, wasser: 120, feuer: 120, buch: 17 },
        { sanduhr: 17, eule: 36, elixier: 50, leuchter: 50, luft: 120, erde: 120, wasser: 120, feuer: 120, buch: 17 }
      ],
      regeln: [
        '10 Linien, von links nach rechts. Eule und Sanduhr zahlen schon ab 2 gleichen.',
        '<b>Grimoire</b> ist Wild und Scatter zugleich: Es ersetzt jedes Symbol und zahlt überall (3 = 2×, 4 = 20×, 5 = 200× Einsatz).',
        '3, 4 oder 5 Bücher starten <b>8, 10 oder 12 Freispiele</b> mit einem zufälligen expandierenden Spezialsymbol.',
        '<b>Freispiel-Multiplikator:</b> startet bei ×1, jeder Gewinn erhöht ihn um 1 bis ×10.',
        '<b>Risikoleiter &amp; Kartenrisiko:</b> Nach jedem Gewinn auf der Leiter hochdrücken oder Rot/Schwarz tippen.'
      ]
    }
  };

  var SPIEL_IDS = ['alge', 'frucht', 'sterne', 'drache', 'grimoire'];

  // Symbol schnell finden
  Object.keys(SPIELE).forEach(function (k) {
    var sp = SPIELE[k];
    sp.symMap = {};
    sp.symbole.forEach(function (sy) { sp.symMap[sy.id] = sy; });
    // Walzenbänder aus den Gewichten bauen
    sp.baender = sp.gewichte.map(function (g) {
      var band = [];
      Object.keys(g).forEach(function (id) { for (var i = 0; i < g[id]; i++) band.push(id); });
      return band;
    });
  });

  /* ======================= Erfolge ======================= */

  var ERFOLGE = [
    { id: 'ersterDreh', name: 'Erster Dreh', text: 'Drehe zum ersten Mal', bonus: 100 },
    { id: 'ersterTreffer', name: 'Erster Treffer', text: 'Gewinne irgendetwas', bonus: 100 },
    { id: 'scheppert', name: 'Es scheppert!', text: 'Gewinne 15× den Einsatz', bonus: 500 },
    { id: 'kasinoKoenig', name: 'Kasino-König', text: 'Gewinne 50× den Einsatz', bonus: 2000 },
    { id: 'algeAlge', name: 'Alge! Alge!', text: 'Löse Freispiele aus', bonus: 500 },
    { id: 'drachenhort', name: 'Drachenhort', text: 'Löse Hold & Win aus', bonus: 750 },
    { id: 'jackpotKrone', name: 'Jackpot-Krone!', text: 'Triff einen Jackpot', bonus: 1500 },
    { id: 'leiterLegende', name: 'Leiter-Legende', text: 'Erreiche die Spitze der Risikoleiter', bonus: 2500 },
    { id: 'tour', name: 'Spielhallen-Tour', text: 'Spiele alle fünf Automaten', bonus: 400 },
    { id: 'stammgast', name: 'Stammgast', text: '100 Drehungen', bonus: 500 },
    { id: 'inventar', name: 'Palast-Inventar', text: '1.000 Drehungen', bonus: 3000 }
  ];

  /* ===================================================================
     Online-Bestenliste (freiwillig)

     Trag hier die zwei Werte aus deinem kostenlosen Supabase-Projekt ein,
     dann sehen alle Besucher dieselbe Bestenliste. Bleiben sie leer,
     läuft alles wie bisher nur im eigenen Browser.

       url : Project URL,  z. B. 'https://abcdefgh.supabase.co'
       key : der ÖFFENTLICHE anon-Key (der ist für Webseiten gedacht)

     Den service_role-Key niemals hier eintragen – der hat Vollzugriff
     und würde im Quelltext dieser öffentlichen Seite für jeden lesbar
     sein. Die Tabellen legst du mit supabase-setup.sql an.
     =================================================================== */
  var GP_ONLINE = {
    url: '',
    key: ''
  };

  /* ======================= Spielstand ======================= */

  var SPEICHER = 'gp-palast-v1';
  var daten = { aktiv: null, profile: {}, grand: 20000 };
  var P = null;   // aktives Profil

  function neuesProfil(name) {
    var p = {
      name: name, pin: '', chips: 5000, erstellt: new Date().toISOString(),
      letztesRad: '', gratis: 0,
      stats: { drehs: 0, gesetzt: 0, gewonnen: 0, rekord: 0, rekordSpiel: '', features: 0 },
      proSpiel: {}, erfolge: {}, verlauf: [], bestenliste: []
    };
    SPIEL_IDS.forEach(function (id) {
      p.proSpiel[id] = { drehs: 0, gesetzt: 0, gewonnen: 0, rekord: 0, features: 0, einsatz: SPIELE[id].einsatz };
    });
    return p;
  }

  function laden() {
    try {
      var roh = localStorage.getItem(SPEICHER);
      if (roh) {
        var d = JSON.parse(roh);
        if (d && d.profile) daten = d;
      }
    } catch (e) { /* Spielstand nicht lesbar – wir fangen neu an */ }
    if (typeof daten.grand !== 'number') daten.grand = 20000;
    if (daten.aktiv && daten.profile[daten.aktiv]) P = daten.profile[daten.aktiv];
  }

  function speichern() {
    try { localStorage.setItem(SPEICHER, JSON.stringify(daten)); } catch (e) { /* voll oder gesperrt */ }
  }

  /* ======================= Online-Speicher =======================
     Spricht die Supabase-Datenbank direkt per fetch an. Jeder Aufruf
     hat ein Zeitlimit, damit das Casino nie hängen bleibt, wenn der
     Dienst gerade langsam oder nicht erreichbar ist. */

  var Online = (function () {
    var FRIST = 6000;

    function aktiv() {
      return !!(GP_ONLINE.url && GP_ONLINE.key);
    }

    function kopf(zusatz) {
      var h = {
        apikey: GP_ONLINE.key,
        Authorization: 'Bearer ' + GP_ONLINE.key,
        'Content-Type': 'application/json'
      };
      if (zusatz) Object.keys(zusatz).forEach(function (k) { h[k] = zusatz[k]; });
      return h;
    }

    function ruf(pfad, opt) {
      if (!aktiv()) return Promise.reject(new Error('nicht eingerichtet'));
      opt = opt || {};
      opt.headers = kopf(opt.zusatzKopf);
      delete opt.zusatzKopf;
      var stop = typeof AbortController !== 'undefined' ? new AbortController() : null;
      if (stop) opt.signal = stop.signal;
      var uhr = setTimeout(function () { if (stop) stop.abort(); }, FRIST);

      return fetch(GP_ONLINE.url.replace(/\/+$/, '') + pfad, opt)
        .then(function (a) {
          clearTimeout(uhr);
          return a.text().then(function (txt) {
            var d = null;
            try { d = txt ? JSON.parse(txt) : null; } catch (e) { /* kein JSON */ }
            if (!a.ok) {
              throw new Error((d && (d.message || d.hint)) || ('Datenbank antwortet mit Fehler ' + a.status));
            }
            return d;
          });
        })
        .catch(function (f) {
          clearTimeout(uhr);
          if (f && f.name === 'AbortError') throw new Error('Zeitüberschreitung – die Datenbank antwortet nicht.');
          if (f instanceof TypeError) throw new Error('Keine Verbindung zur Datenbank.');
          throw f;
        });
    }

    /* Größte Gewinne bzw. höchste Multiplikatoren */
    function gewinne(art, spiel, anzahl) {
      var p = '/rest/v1/gp_bestenliste?select=spieler,spiel,gewinn,mult,art,datum';
      if (spiel && spiel !== 'alle') p += '&spiel=eq.' + encodeURIComponent(spiel);
      p += '&order=' + (art === 'mult' ? 'mult' : 'gewinn') + '.desc';
      p += '&limit=' + (anzahl || 20);
      return ruf(p);
    }

    /* Reichste Spieler */
    function reiche(anzahl) {
      return ruf('/rest/v1/gp_spieler?select=spieler,chips&order=chips.desc&limit=' + (anzahl || 20));
    }

    /* Einen Gewinn eintragen. Fehler werden bewusst verschluckt:
       das Spiel darf davon nie gestört werden. */
    function melde(e) {
      if (!aktiv()) return Promise.resolve(false);
      return ruf('/rest/v1/gp_bestenliste', {
        method: 'POST',
        body: JSON.stringify({
          spieler: String(e.spieler || '').slice(0, 24),
          spiel: String(e.spiel || '').slice(0, 24),
          gewinn: Math.max(0, Math.round(e.gewinn || 0)),
          mult: Math.round((e.mult || 0) * 100) / 100,
          art: String(e.art || 'Gewinn').slice(0, 24),
          datum: e.datum || new Date().toISOString()
        })
      }).then(function () { return true; }, function () { return false; });
    }

    /* Chipstand des Spielers eintragen oder auffrischen */
    function meldeChips(name, chips) {
      if (!aktiv() || !name) return Promise.resolve(false);
      return ruf('/rest/v1/gp_spieler', {
        method: 'POST',
        // vorhandenen Eintrag desselben Namens überschreiben statt doppeln
        zusatzKopf: { Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify({
          spieler: String(name).slice(0, 24),
          chips: Math.max(0, Math.round(chips || 0)),
          datum: new Date().toISOString()
        })
      }).then(function () { return true; }, function () { return false; });
    }

    return { aktiv: aktiv, gewinne: gewinne, reiche: reiche, melde: melde, meldeChips: meldeChips };
  })();

  /* ======================= Ton ======================= */

  var Ton = {
    an: false, ctx: null,
    start: function () {
      if (!Ton.ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (AC) Ton.ctx = new AC();
      }
      if (Ton.ctx && Ton.ctx.state === 'suspended') Ton.ctx.resume();
    },
    pieps: function (hz, dauer, typ, laut) {
      if (!Ton.an || !Ton.ctx) return;
      try {
        var o = Ton.ctx.createOscillator(), g = Ton.ctx.createGain();
        o.type = typ || 'square';
        o.frequency.value = hz;
        g.gain.value = laut == null ? 0.05 : laut;
        o.connect(g); g.connect(Ton.ctx.destination);
        var t = Ton.ctx.currentTime;
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + (dauer || 0.1));
        o.start(t); o.stop(t + (dauer || 0.1) + 0.02);
      } catch (e) { /* Ton ist Beiwerk */ }
    },
    stopp: function () { Ton.pieps(220 + Z.bis(80), 0.07, 'square', 0.04); },
    gewinn: function (stufe) {
      var noten = [523, 659, 784, 1047, 1319];
      for (var i = 0; i <= Math.min(stufe, 4); i++) {
        (function (n, i) { setTimeout(function () { Ton.pieps(n, 0.13, 'square', 0.05); }, i * 90); })(noten[i], i);
      }
    },
    klick: function () { Ton.pieps(880, 0.04, 'square', 0.03); },
    leiter: function (hoch) { Ton.pieps(hoch ? 1200 : 300, 0.1, 'square', 0.05); }
  };

  /* ======================= Symbol zeichnen ======================= */

  function symEl(sp, id, extra, wert) {
    var sy = sp.symMap[id];
    var d = el('div', 'gp-sym ' + (sy && sy.cls ? sy.cls : '') + (extra ? ' ' + extra : ''));
    if (!sy) return d;
    if (sy.txt) {
      var t = el('span', 'gp-txt', sy.txt);
      d.appendChild(t);
    } else {
      d.appendChild(document.createTextNode(sy.glyph || '?'));
    }
    if (id === 'muenze' && wert != null) {
      var w = el('span', 'gp-wertchen', typeof wert === 'string' ? wert : (wert + '×'));
      d.appendChild(w);
    }
    return d;
  }

  /* ======================= Walzen drehen ======================= */

  function zieheSymbol(sp, walze) {
    var band = sp.baender[walze];
    return band[Z.bis(band.length)];
  }

  function dreheFeld(sp) {
    var feld = [];
    for (var w = 0; w < sp.walzen; w++) {
      var spalte = [];
      for (var r = 0; r < sp.reihen; r++) spalte.push(zieheSymbol(sp, w));
      feld.push(spalte);
    }
    return feld;
  }

  /* Linien auswerten. Gibt {gesamt, treffer:[{linie, symId, anzahl, betrag, zellen}]} */
  function werteLinien(sp, feld, linienEinsatz) {
    var treffer = [], gesamt = 0;
    var wild = sp.wild, scatter = sp.scatter;

    sp.linien.forEach(function (muster, li) {
      var folge = [];
      for (var w = 0; w < sp.walzen; w++) folge.push(feld[w][muster[w]]);

      // Grundsymbol bestimmen: erstes Nicht-Wild
      var basis = null;
      for (var i = 0; i < folge.length; i++) {
        if (folge[i] !== wild && folge[i] !== scatter) { basis = folge[i]; break; }
      }
      // Reine Wild-Linie zählt als Wild-Symbol selbst (falls es Linienwerte hat)
      if (basis === null) basis = wild;
      if (!basis) return;
      var sy = sp.symMap[basis];
      if (!sy || !sy.pay) return;

      var anzahl = 0;
      for (var w2 = 0; w2 < sp.walzen; w2++) {
        var cur = folge[w2];
        if (cur === basis || (wild && cur === wild && basis !== scatter)) anzahl++;
        else break;
      }
      var wert = sy.pay[anzahl];
      if (!wert) return;
      var betrag = Math.round(wert * linienEinsatz);
      if (betrag <= 0) return;
      var zellen = [];
      for (var z = 0; z < anzahl; z++) zellen.push([z, muster[z]]);
      gesamt += betrag;
      treffer.push({ linie: li, symId: basis, anzahl: anzahl, betrag: betrag, zellen: zellen });
    });

    // Gemischte BAR/7-Kombination (Frucht-Express)
    if (sp.mischGruppe) {
      sp.linien.forEach(function (muster, li) {
        var folge = [];
        for (var w = 0; w < sp.walzen; w++) folge.push(feld[w][muster[w]]);
        var alleDrin = folge.every(function (x) { return sp.mischGruppe.indexOf(x) >= 0; });
        var gleich = folge.every(function (x) { return x === folge[0]; });
        if (alleDrin && !gleich) {
          var betrag = Math.round(sp.mischPay * linienEinsatz);
          gesamt += betrag;
          treffer.push({
            linie: li, symId: folge[0], anzahl: sp.walzen, betrag: betrag, gemischt: true,
            zellen: muster.map(function (r, w) { return [w, r]; })
          });
        }
      });
    }
    return { gesamt: gesamt, treffer: treffer };
  }

  function zaehleScatter(sp, feld) {
    if (!sp.scatter) return { anzahl: 0, zellen: [] };
    var n = 0, zellen = [];
    for (var w = 0; w < sp.walzen; w++) {
      for (var r = 0; r < sp.reihen; r++) {
        if (feld[w][r] === sp.scatter) { n++; zellen.push([w, r]); }
      }
    }
    return { anzahl: n, zellen: zellen };
  }

  /* Expandierendes Spezialsymbol in den Freispielen */
  function expandiere(sp, feld, spezial, linienEinsatz) {
    // Wie viele Walzen tragen das Spezialsymbol?
    var walzenMit = [];
    for (var w = 0; w < sp.walzen; w++) {
      for (var r = 0; r < sp.reihen; r++) {
        if (feld[w][r] === spezial || feld[w][r] === sp.wild) { walzenMit.push(w); break; }
      }
    }
    var sy = sp.symMap[spezial];
    var noetig = 3;
    if (sy && sy.pay[2]) noetig = 2;
    if (walzenMit.length < noetig) return null;

    // Prüfen, ob die Walzen von links lückenlos sind
    var folge = 0;
    for (var i = 0; i < sp.walzen; i++) {
      if (walzenMit.indexOf(i) >= 0) folge++; else break;
    }
    if (folge < noetig) return null;

    // Walzen komplett füllen
    var neu = feld.map(function (sp2) { return sp2.slice(); });
    var zellen = [];
    for (var w2 = 0; w2 < folge; w2++) {
      for (var r2 = 0; r2 < sp.reihen; r2++) { neu[w2][r2] = spezial; zellen.push([w2, r2]); }
    }
    var wert = sy.pay[folge] || 0;
    var betrag = Math.round(wert * linienEinsatz * sp.linien.length);
    return { feld: neu, betrag: betrag, zellen: zellen, walzen: folge };
  }

  /* ======================= Oberfläche: Grundgerüst ======================= */

  var root = null, ui = {};
  var aktuell = null;        // aktuelles Spiel-Objekt
  var laeuftDreh = false;
  var tresorOffen = false;

  function bauWurzel() {
    root = el('div');
    root.id = 'gp-root';
    root.hidden = true;
    root.innerHTML =
      '<div class="gp-wrap"><div class="gp-rahmen">' +
        '<div class="gp-kopf">' +
          '<span class="gp-logo gp-serif" id="gp-logo">👑 GLÜCKSPALAST</span>' +
          '<span class="gp-tag">SPIELHALLE · 24K GOLD</span>' +
          '<span class="gp-kopf-luft"></span>' +
          '<span class="gp-chips" id="gp-chips"><span class="gp-muenze"></span><b>0</b></span>' +
          '<span class="gp-spieler" id="gp-spieler"><span class="gp-avatar">?</span><span class="nm">–</span><span class="gp-online">ONLINE</span></span>' +
          '<button class="gp-btn" id="gp-bl">Bestenliste</button>' +
          '<button class="gp-btn" id="gp-stat">Statistik</button>' +
          '<button class="gp-btn" id="gp-ton">Ton an</button>' +
          '<button class="gp-btn" id="gp-zu">✕ Schließen</button>' +
        '</div>' +
        '<div id="gp-buehne"></div>' +
      '</div></div>';
    document.body.appendChild(root);

    ui.buehne = root.querySelector('#gp-buehne');
    ui.chips = root.querySelector('#gp-chips');
    ui.chipsZahl = ui.chips.querySelector('b');
    ui.spieler = root.querySelector('#gp-spieler');

    root.querySelector('#gp-zu').addEventListener('click', schliessen);
    root.querySelector('#gp-bl').addEventListener('click', function () { zeigeBestenliste(); });
    root.querySelector('#gp-stat').addEventListener('click', function () { zeigeStatistik(); });
    root.querySelector('#gp-ton').addEventListener('click', function () {
      Ton.an = !Ton.an;
      if (Ton.an) { Ton.start(); Ton.klick(); }
      this.textContent = Ton.an ? 'Ton aus' : 'Ton an';
    });
    ui.spieler.addEventListener('click', spielerMenue);

    // Dreifachklick auf das Logo öffnet den Tresor
    var logoKlicks = 0, logoTimer = null;
    root.querySelector('#gp-logo').addEventListener('click', function () {
      logoKlicks++;
      clearTimeout(logoTimer);
      logoTimer = setTimeout(function () { logoKlicks = 0; }, 700);
      if (logoKlicks >= 3) { logoKlicks = 0; zeigeTresorFrage(); }
    });

    document.addEventListener('keydown', tastatur);
  }

  function tastatur(e) {
    if (!root || root.hidden) return;
    if (e.key === 'Escape') {
      var offen = document.querySelector('.gp-modal:not([hidden])');
      if (offen) { offen.remove(); return; }
      schliessen();
      return;
    }
    if (e.code === 'Space' && aktuell && !document.querySelector('.gp-modal:not([hidden])')) {
      var ziel = e.target;
      if (ziel && (ziel.tagName === 'INPUT' || ziel.tagName === 'SELECT' || ziel.tagName === 'TEXTAREA')) return;
      e.preventDefault();
      if (ui.risikoOffen) { leiterHoch(); return; }
      if (ui.start && !ui.start.disabled) ui.start.click();
    }
  }

  function kopfAktualisieren() {
    if (!P) return;
    ui.chipsZahl.textContent = nz(P.chips);
    var av = ui.spieler.querySelector('.gp-avatar');
    av.textContent = (P.name || '?').charAt(0).toUpperCase();
    ui.spieler.querySelector('.nm').textContent = P.name;
  }

  function chipsAendern(n) {
    P.chips = Math.max(0, Math.round(P.chips + n));
    kopfAktualisieren();
    ui.chips.classList.remove('gp-blink');
    void ui.chips.offsetWidth;
    ui.chips.classList.add('gp-blink');
    speichern();
  }

  /* ======================= Fenster ======================= */

  function modal(titel, inhaltEl, schmal) {
    var m = el('div', 'gp-modal');
    var box = el('div', 'gp-box' + (schmal ? ' schmal' : ''));
    var kopf = el('div', 'gp-box-kopf');
    kopf.appendChild(el('h3', 'gp-serif', titel));
    var zu = el('button', 'gp-btn', 'Schließen');
    zu.addEventListener('click', function () { m.remove(); });
    kopf.appendChild(zu);
    var inhalt = el('div', 'gp-box-inhalt');
    inhalt.appendChild(inhaltEl);
    box.appendChild(kopf); box.appendChild(inhalt);
    m.appendChild(box);
    m.addEventListener('click', function (e) { if (e.target === m) m.remove(); });
    root.appendChild(m);
    return m;
  }

  function schlichtesModal(inhaltEl) {
    var m = el('div', 'gp-modal');
    var box = el('div', 'gp-box schmal');
    var inhalt = el('div', 'gp-box-inhalt');
    inhalt.appendChild(inhaltEl);
    box.appendChild(inhalt);
    m.appendChild(box);
    root.appendChild(m);
    return m;
  }

  /* ======================= Lobby ======================= */

  function zeigeLobby() {
    aktuell = null;
    ui.start = null;
    ui.buehne.innerHTML = '';

    /* Oben: Begrüßung + Glücksrad */
    var oben = el('div', 'gp-oben');

    var hero = el('div', 'gp-karte gp-hero');
    hero.appendChild(el('div', 'gp-kicker', 'Deutsche Spielhallen-Welt · 5 Automaten · Risikoleiter'));
    hero.appendChild(el('h2', 'gp-serif', 'Willkommen in der königlichen Spielhalle'));
    var ht = el('p');
    ht.innerHTML = 'Echte Spielhallen-Atmosphäre mit glänzenden 3D-Walzensymbolen, klassischen Spielhallen-Sounds, ' +
      'blinkender Risikoleiter mit Teilen-Funktion und dem Kult-Automaten <b>ALGE – König der Meere</b>.';
    hero.appendChild(ht);
    var reihe = el('div', 'gp-symbolreihe');
    [['alge', 'dose'], ['alge', 'koenig'], ['frucht', 'sieben'], ['sterne', 'krone'],
     ['drache', 'drache'], ['alge', 'dreizack'], ['sterne', 'rubin'], ['drache', 'muenze']]
      .forEach(function (pr) { reihe.appendChild(symEl(SPIELE[pr[0]], pr[1], 'mini')); });
    hero.appendChild(reihe);
    oben.appendChild(hero);

    var radK = el('div', 'gp-karte gp-rad-karte');
    radK.appendChild(el('div', 'gp-kicker', 'Königliches Glücksrad'));
    var betr = el('div', 'gp-rad-betrag');
    betr.appendChild(el('span', 'gp-muenze'));
    betr.appendChild(document.createTextNode('bis 10.000'));
    radK.appendChild(betr);
    var frei = P.letztesRad !== heute();
    radK.appendChild(el('p', null, frei ? 'Bereit! Dreh das königliche Glücksrad.' : 'Heute schon gedreht. Morgen wartet das nächste Rad.'));
    var radBtn = el('button', 'gp-btn gp-gold', 'GLÜCKSRAD DREHEN');
    radBtn.disabled = !frei;
    radBtn.addEventListener('click', zeigeGluecksrad);
    radK.appendChild(radBtn);
    var vor = radScheibe(170);
    vor.classList.add('gp-rad-vorschau');
    radK.appendChild(vor);
    oben.appendChild(radK);
    ui.buehne.appendChild(oben);

    /* Empfehlung */
    var sp = SPIELE.alge;
    var feat = el('div', 'gp-featured');
    var dose = symEl(sp, 'dose', 'mini');
    dose.style.width = '62px'; dose.style.height = '62px'; dose.style.flex = '0 0 62px';
    dose.style.fontSize = '0';
    dose.querySelector('.gp-txt').style.fontSize = '13px';
    feat.appendChild(dose);
    var ftx = el('div', 'gp-ft-text');
    ftx.appendChild(el('span', 'gp-badge-gruen', '👑 KULT-AUTOMAT · ECHTES SPIELHALLEN-FEELING'));
    ftx.appendChild(el('h3', 'gp-serif', sp.name));
    var fp = el('p');
    fp.innerHTML = '5 Walzen, 10 Linien, der <b>Alge-König</b> bis 5.000×, die ikonische <b>ALGE-Dose</b> als Wild &amp; Scatter, ' +
      'bis zu 12 Freispiele mit Spezialsymbol und <b>Multiplikator bis ×10</b> sowie echte <b>Risikoleiter &amp; Kartenrisiko</b>!';
    ftx.appendChild(fp);
    feat.appendChild(ftx);
    var fb = el('button', 'gp-spiel-btn');
    fb.textContent = 'JETZT ALGE SPIELEN';
    fb.style.background = 'linear-gradient(180deg,#5ef29b,#1f9d5c)';
    fb.style.width = 'auto'; fb.style.padding = '.9rem 1.6rem';
    fb.addEventListener('click', function () { zeigeSpiel('alge'); });
    feat.appendChild(fb);
    ui.buehne.appendChild(feat);

    /* Spielkarten */
    var gitter = el('div', 'gp-spiele');
    SPIEL_IDS.forEach(function (id) { gitter.appendChild(spielKarte(SPIELE[id])); });
    ui.buehne.appendChild(gitter);

    /* Unten: Bestenliste + Verlauf */
    var unten = el('div', 'gp-unten');

    var blP = el('div', 'gp-panel');
    var blK = el('div', 'gp-panel-kopf');
    blK.appendChild(el('h3', null, 'Bestenliste'));
    var blA = el('button', 'gp-btn', 'Alle anzeigen');
    blA.addEventListener('click', function () { zeigeBestenliste(); });
    blK.appendChild(blA);
    blP.appendChild(blK);
    var top = (P.bestenliste || []).slice().sort(function (a, b) { return b.gewinn - a.gewinn; }).slice(0, 5);
    if (!top.length) blP.appendChild(el('p', 'gp-eigen', 'Noch keine Einträge. Dreh eine Runde!'));
    top.forEach(function (e, i) { blP.appendChild(blZeile(e, i)); });
    var eig = el('p', 'gp-eigen');
    if (P.stats.rekord > 0) {
      eig.innerHTML = 'Dein Rekord: <b>' + nz(P.stats.rekord) + '</b> Chips' +
        (P.stats.rekordSpiel ? ' bei ' + P.stats.rekordSpiel : '');
    } else {
      eig.textContent = 'Dein Rekord: noch keiner.';
    }
    blP.appendChild(eig);
    unten.appendChild(blP);

    var vP = el('div', 'gp-panel');
    var vK = el('div', 'gp-panel-kopf');
    vK.appendChild(el('h3', null, 'Letzte Spiele'));
    vP.appendChild(vK);
    var v = (P.verlauf || []).slice(0, 10);
    if (!v.length) vP.appendChild(el('p', 'gp-eigen', 'Noch nichts gespielt.'));
    v.forEach(function (e) {
      var z = el('div', 'gp-verlauf-zeile');
      var n = el('span', 'n');
      n.textContent = e.spiel;
      if (e.notiz) {
        n.appendChild(document.createTextNode(' · '));
        var no = el('span', 'gp-notiz', e.notiz);
        n.appendChild(no);
      }
      z.appendChild(n);
      z.appendChild(el('span', 'e', e.einsatz ? '−' + nz(e.einsatz) : 'frei'));
      var g = el('span', 'g ' + (e.gewinn > 0 ? 'plus' : 'null'), e.gewinn > 0 ? '+' + nz(e.gewinn) : '0');
      z.appendChild(g);
      vP.appendChild(z);
    });
    unten.appendChild(vP);
    ui.buehne.appendChild(unten);

    var fuss = el('p', 'gp-fuss');
    fuss.textContent = 'Nur zur Unterhaltung. Alle Chips sind Spielgeld ohne Geldwert, können nicht gekauft und nicht ' +
      'ausgezahlt werden. Dein Spielstand wird lokal in diesem Browser gespeichert.';
    ui.buehne.appendChild(fuss);

    kopfAktualisieren();
  }

  function blZeile(e, i) {
    var z = el('div', 'gp-bl-zeile');
    z.appendChild(el('span', 'gp-rang' + (i < 3 ? ' r' + (i + 1) : ''), String(i + 1)));
    z.appendChild(el('span', 'gp-bl-name', e.spieler || P.name));
    var ic = el('span');
    ic.style.fontSize = '1.05rem';
    ic.textContent = SPIELE[e.spiel] ? SPIELE[e.spiel].icon : '🎰';
    z.appendChild(ic);
    z.appendChild(el('span', 'gp-bl-betrag', nz(e.gewinn)));
    z.appendChild(el('span', 'gp-bl-mult', (Math.round(e.mult * 10) / 10).toLocaleString('de-DE') + '×'));
    return z;
  }

  function spielKarte(sp) {
    var k = el('div', 'gp-spiel');
    var kopf = el('div', 'gp-spiel-kopf');
    kopf.style.background = sp.kopfBg;
    kopf.appendChild(el('span', 'gp-spiel-badge', sp.badge));
    var str = el('div', 'gp-spiel-streifen');
    sp.symbole.slice(0, 5).forEach(function (sy) { str.appendChild(symEl(sp, sy.id, 'mini')); });
    kopf.appendChild(str);
    k.appendChild(kopf);

    var b = el('div', 'gp-spiel-koerper');
    b.appendChild(el('h3', 'gp-serif', sp.name)).style.color = sp.farbe;
    b.appendChild(el('p', null, sp.beschreibung));

    var w = el('div', 'gp-werte');
    [['Walzen', sp.walzen + '×' + sp.reihen], ['Linien', String(sp.linien.length)], ['Volatilität', sp.volatil]]
      .forEach(function (pr) {
        var c = el('div', 'gp-wert');
        c.appendChild(el('span', null, pr[0].toUpperCase()));
        c.appendChild(el('b', null, pr[1]));
        w.appendChild(c);
      });
    b.appendChild(w);

    var tg = el('div', 'gp-tags');
    sp.tags.forEach(function (t) { tg.appendChild(el('span', 'gp-tag-k', t)); });
    b.appendChild(tg);

    var st = P.proSpiel[sp.id] || { drehs: 0, rekord: 0 };
    var f = el('div', 'gp-spiel-fuss');
    f.textContent = st.drehs > 0
      ? st.drehs + ' Drehungen  ·  Rekord ' + nz(st.rekord)
      : 'Noch unberührt  ·  Krone wartet!';
    b.appendChild(f);

    var btn = el('button', 'gp-spiel-btn', sp.name.toUpperCase() + ' SPIELEN');
    btn.style.background = 'linear-gradient(180deg,' + sp.farbe + ',' + schatten(sp.farbe) + ')';
    btn.addEventListener('click', function () { zeigeSpiel(sp.id); });
    b.appendChild(btn);

    k.appendChild(b);
    return k;
  }

  function schatten(hex) {
    var r = parseInt(hex.substr(1, 2), 16), g = parseInt(hex.substr(3, 2), 16), b = parseInt(hex.substr(5, 2), 16);
    r = Math.round(r * .58); g = Math.round(g * .58); b = Math.round(b * .58);
    return '#' + [r, g, b].map(function (x) { return x.toString(16).padStart(2, '0'); }).join('');
  }

  /* ======================= Spielansicht ======================= */

  var spielZustand = null;

  function zeigeSpiel(id) {
    var sp = SPIELE[id];
    aktuell = sp;
    var ps = P.proSpiel[id] || (P.proSpiel[id] = { drehs: 0, gesetzt: 0, gewonnen: 0, rekord: 0, features: 0, einsatz: sp.einsatz });
    if (!ps.einsatz || sp.stufen.indexOf(ps.einsatz) < 0) ps.einsatz = sp.einsatz;

    spielZustand = {
      sp: sp, einsatz: ps.einsatz, feld: null, gewinn: 0,
      freispiele: 0, fsMult: 1, fsSpezial: null, fsGesamt: 0,
      auto: 0, turbo: false, hype: 0, risikoBetrag: 0, leiterStufe: 0, leiterWerte: []
    };

    ui.buehne.innerHTML = '';
    ui.risikoOffen = false;

    /* Kopfleiste */
    var kl = el('div', 'gp-spiel-kopfleiste');
    var zurueck = el('button', 'gp-btn', '← Spielhalle');
    zurueck.addEventListener('click', function () { if (!laeuftDreh) zeigeLobby(); });
    kl.appendChild(zurueck);
    kl.appendChild(el('h2', 'gp-serif', sp.name)).style.color = sp.farbe;
    var gp = el('button', 'gp-btn', 'Gewinnplan');
    gp.addEventListener('click', function () { zeigeGewinnplan(sp); });
    kl.appendChild(gp);
    ui.buehne.appendChild(kl);

    /* Hype-Leiste */
    var hy = el('div', 'gp-hype');
    hy.appendChild(el('span', null, '👑 KÖNIGS-HYPE'));
    var bar = el('div', 'gp-hype-bar');
    var füller = el('i');
    bar.appendChild(füller);
    hy.appendChild(bar);
    ui.hypeText = el('span', null, '👑 WARMLAUFEN');
    hy.appendChild(ui.hypeText);
    ui.hypeBar = füller;
    ui.buehne.appendChild(hy);

    /* Jackpots */
    if (sp.holdWin) {
      var jg = el('div', 'gp-jackpots');
      [['MINI', sp.jackpots.mini], ['MINOR', sp.jackpots.minor], ['MAJOR', sp.jackpots.major]].forEach(function (pr) {
        var c = el('div', 'gp-jp');
        c.appendChild(el('span', null, pr[0]));
        c.appendChild(el('b', null, nz(pr[1])));
        jg.appendChild(c);
      });
      var gr = el('div', 'gp-jp gross');
      gr.appendChild(el('span', null, 'GRAND · KÖNIGSTOPF'));
      ui.grandEl = el('b', null, nz(daten.grand));
      gr.appendChild(ui.grandEl);
      jg.appendChild(gr);
      ui.buehne.appendChild(jg);
    }

    /* Automat */
    var aut = el('div', 'gp-automat');
    aut.setAttribute('data-walzen', String(sp.walzen));
    aut.style.setProperty('--reihen', String(sp.reihen));
    var mq = el('div', 'gp-marquee gp-serif');
    mq.style.background = sp.kopfBg;
    mq.style.border = '1px solid ' + sp.farbe + '66';
    mq.style.color = sp.farbe;
    mq.innerHTML = '<span class="punkte">•••</span> ' + sp.name + ' <span class="punkte">•••</span>';
    aut.appendChild(mq);

    var led = el('div', 'gp-led');
    ui.led = el('span', null, 'VIEL GLÜCK!');
    led.appendChild(ui.led);
    aut.appendChild(led);

    var feldBox = el('div', 'gp-feld');
    ui.linksNr = el('div', 'gp-linien-nr');
    ui.rechtsNr = el('div', 'gp-linien-nr');
    for (var i = 0; i < sp.linien.length; i++) {
      ui.linksNr.appendChild(el('i', null, String(i + 1)));
      ui.rechtsNr.appendChild(el('i', null, String(i + 1)));
    }
    feldBox.appendChild(ui.linksNr);

    ui.walzen = el('div', 'gp-walzen');
    ui.walzen.style.gridTemplateColumns = 'repeat(' + sp.walzen + ',var(--zelle))';
    ui.walzen.style.background = sp.feldBg;
    feldBox.appendChild(ui.walzen);
    feldBox.appendChild(ui.rechtsNr);
    aut.appendChild(feldBox);

    var an = el('div', 'gp-anzeigen');
    ui.aEinsatz = anzeige(an, 'EINSATZ', nz(spielZustand.einsatz));
    ui.aGewinn = anzeige(an, 'GEWINN', '0', 'gewinn');
    ui.aLinien = anzeige(an, 'LINIEN', String(sp.linien.length));
    aut.appendChild(an);
    ui.buehne.appendChild(aut);

    ui.buehne.appendChild(el('p', 'gp-beschreibung', sp.beschreibung));

    /* Bedienleiste */
    var bed = el('div', 'gp-bedien');
    var eb = el('div', 'gp-einsatz');
    var minus = el('button', null, '−');
    var wert = el('div', 'wert');
    wert.appendChild(el('span', null, 'EINSATZ'));
    ui.einsatzWert = el('b', null, nz(spielZustand.einsatz));
    wert.appendChild(ui.einsatzWert);
    var plus = el('button', null, '+');
    minus.addEventListener('click', function () { einsatzWechseln(-1); });
    plus.addEventListener('click', function () { einsatzWechseln(1); });
    eb.appendChild(minus); eb.appendChild(wert); eb.appendChild(plus);
    bed.appendChild(eb);
    var maxB = el('button', 'gp-btn', 'Max');
    maxB.addEventListener('click', function () { setzeEinsatz(sp.stufen[sp.stufen.length - 1]); });
    bed.appendChild(maxB);

    ui.start = el('button', 'gp-start gp-serif', 'START');
    ui.start.addEventListener('click', function () { if (!laeuftDreh) dreheLos(); });
    bed.appendChild(ui.start);

    ui.autoSel = el('select', 'gp-select');
    [['0', 'Auto aus'], ['10', '10 Drehs'], ['25', '25 Drehs'], ['50', '50 Drehs'], ['100', '100 Drehs']]
      .forEach(function (pr) {
        var o = el('option', null, pr[1]); o.value = pr[0]; ui.autoSel.appendChild(o);
      });
    ui.autoSel.addEventListener('change', function () {
      spielZustand.auto = parseInt(this.value, 10) || 0;
      if (spielZustand.auto > 0 && !laeuftDreh) dreheLos();
    });
    bed.appendChild(ui.autoSel);

    ui.turbo = el('button', 'gp-btn', 'Turbo');
    ui.turbo.addEventListener('click', function () {
      spielZustand.turbo = !spielZustand.turbo;
      this.classList.toggle('gp-gold', spielZustand.turbo);
    });
    bed.appendChild(ui.turbo);
    ui.buehne.appendChild(bed);

    ui.risikoHalter = el('div');
    ui.buehne.appendChild(ui.risikoHalter);

    var tick = el('div', 'gp-ticker');
    tick.appendChild(el('span', 'gp-live', '● LIVE HYPE'));
    var t1 = el('span'); t1.innerHTML = '<b>PalastWache:</b> Bereit für die Krone! 👑';
    var t2 = el('span'); t2.innerHTML = '<b>AlgenFan77:</b> Heute scheppert\'s richtig!';
    tick.appendChild(t1); tick.appendChild(t2);
    ui.buehne.appendChild(tick);

    ui.buehne.appendChild(el('p', 'gp-fuss', 'Leertaste startet / drückt hoch · Spielgeld ohne Geldwert'));

    // Startbild
    zeichneFeld(dreheFeld(sp));
    hypeSetzen(0);
    root.scrollTop = 0;
  }

  function anzeige(halter, titel, wert, cls) {
    var a = el('div', 'gp-anzeige');
    a.appendChild(el('span', null, titel));
    var b = el('b', cls || null, wert);
    a.appendChild(b);
    halter.appendChild(a);
    return b;
  }

  function einsatzWechseln(richtung) {
    var sp = spielZustand.sp;
    var i = sp.stufen.indexOf(spielZustand.einsatz);
    i = Math.max(0, Math.min(sp.stufen.length - 1, i + richtung));
    setzeEinsatz(sp.stufen[i]);
  }
  function setzeEinsatz(n) {
    if (laeuftDreh || spielZustand.freispiele > 0) return;
    spielZustand.einsatz = n;
    P.proSpiel[spielZustand.sp.id].einsatz = n;
    ui.einsatzWert.textContent = nz(n);
    ui.aEinsatz.textContent = nz(n);
    speichern();
    Ton.klick();
  }

  function ledText(t) { if (ui.led) ui.led.textContent = t; }

  function hypeSetzen(p) {
    spielZustand.hype = Math.max(0, Math.min(100, p));
    if (ui.hypeBar) ui.hypeBar.style.width = spielZustand.hype + '%';
    if (ui.hypeText) {
      ui.hypeText.textContent = spielZustand.hype > 80 ? '👑 PALAST BEBT!' :
        spielZustand.hype > 45 ? '👑 ES LÄUFT' : '👑 WARMLAUFEN';
    }
  }

  /* ---------- Feld zeichnen ---------- */

  function zeichneFeld(feld, muenzWerte) {
    var sp = spielZustand.sp;
    ui.walzen.innerHTML = '';
    ui.zellen = [];
    for (var w = 0; w < sp.walzen; w++) {
      var walze = el('div', 'gp-walze');
      var streifen = el('div', 'gp-streifen');
      var spalte = [];
      for (var r = 0; r < sp.reihen; r++) {
        var z = el('div', 'gp-zelle');
        var wert = muenzWerte && muenzWerte[w] ? muenzWerte[w][r] : null;
        z.appendChild(symEl(sp, feld[w][r], null, wert));
        streifen.appendChild(z);
        spalte.push(z);
      }
      walze.appendChild(streifen);
      ui.walzen.appendChild(walze);
      ui.zellen.push(spalte);
    }
    spielZustand.feld = feld;
  }

  /* Dreh-Animation: Füllsymbole laufen durch, dann steht das Ergebnis */
  function animiereWalzen(feld, fertig, muenzWerte) {
    var sp = spielZustand.sp;
    var dauer = spielZustand.turbo ? 170 : 520;
    var versatz = spielZustand.turbo ? 50 : 130;
    ui.walzen.innerHTML = '';
    ui.zellen = [];

    var offen = sp.walzen;
    for (var w = 0; w < sp.walzen; w++) {
      (function (w) {
        var walze = el('div', 'gp-walze');
        var streifen = el('div', 'gp-streifen');
        var füll = spielZustand.turbo ? 6 : 12;
        for (var i = 0; i < füll; i++) {
          var z = el('div', 'gp-zelle');
          z.appendChild(symEl(sp, zieheSymbol(sp, w)));
          streifen.appendChild(z);
        }
        var spalte = [];
        for (var r = 0; r < sp.reihen; r++) {
          var z2 = el('div', 'gp-zelle');
          var wert = muenzWerte && muenzWerte[w] ? muenzWerte[w][r] : null;
          z2.appendChild(symEl(sp, feld[w][r], null, wert));
          streifen.appendChild(z2);
          spalte.push(z2);
        }
        walze.appendChild(streifen);
        ui.walzen.appendChild(walze);
        ui.zellen.push(spalte);

        requestAnimationFrame(function () {
          var hoch = streifen.scrollHeight - walze.clientHeight;
          streifen.style.transform = 'translateY(' + (-hoch) + 'px)';
          streifen.style.transition = 'none';
          requestAnimationFrame(function () {
            streifen.style.transition = 'transform ' + (dauer + w * versatz) + 'ms cubic-bezier(.2,.9,.25,1)';
            streifen.style.transform = 'translateY(0)';
          });
        });

        setTimeout(function () {
          Ton.stopp();
          offen--;
          if (offen === 0 && fertig) fertig();
        }, dauer + w * versatz + 30);
      })(w);
    }
    spielZustand.feld = feld;
  }

  function markiere(zellen, klasse) {
    (zellen || []).forEach(function (z) {
      var c = ui.zellen[z[0]] && ui.zellen[z[0]][z[1]];
      if (c) c.classList.add(klasse || 'treffer');
    });
  }
  function linienAn(nummern) {
    [ui.linksNr, ui.rechtsNr].forEach(function (box) {
      Array.prototype.forEach.call(box.children, function (i, idx) {
        i.classList.toggle('an', nummern.indexOf(idx) >= 0);
      });
    });
  }

  /* ======================= Ein Dreh ======================= */

  function dreheLos() {
    // Nachzügler aus Auto- oder Freispiel-Ketten abfangen, wenn die
    // Spielansicht inzwischen geschlossen wurde.
    if (!ui.start || !ui.start.isConnected || !spielZustand.sp) {
      spielZustand.freispiele = 0; spielZustand.fsGesamt = 0; spielZustand.auto = 0;
      return;
    }
    var sp = spielZustand.sp;
    var freispiel = spielZustand.freispiele > 0;
    var einsatz = spielZustand.einsatz;

    if (!freispiel) {
      if (P.chips < einsatz) { nachschub(); return; }
      chipsAendern(-einsatz);
      P.stats.drehs++; P.stats.gesetzt += einsatz;
      var ps = P.proSpiel[sp.id];
      ps.drehs++; ps.gesetzt += einsatz;
      if (sp.holdWin) { daten.grand += Math.round(einsatz * 0.01); if (ui.grandEl) ui.grandEl.textContent = nz(daten.grand); }
      pruefeErfolg('ersterDreh');
      if (P.stats.drehs >= 100) pruefeErfolg('stammgast');
      if (P.stats.drehs >= 1000) pruefeErfolg('inventar');
      var gespielt = SPIEL_IDS.filter(function (x) { return P.proSpiel[x] && P.proSpiel[x].drehs > 0; });
      if (gespielt.length >= 5) pruefeErfolg('tour');
    } else {
      spielZustand.freispiele--;
    }

    laeuftDreh = true;
    ui.start.disabled = true;
    ui.start.classList.add('dreht');
    ui.aGewinn.textContent = '0';
    linienAn([]);
    risikoSchliessen();
    ledText(freispiel ? 'FREISPIEL ' + (spielZustand.fsGesamt - spielZustand.freispiele) + '/' + spielZustand.fsGesamt +
                        '   ×' + spielZustand.fsMult : 'VIEL GLÜCK!');

    var feld = dreheFeld(sp);

    // Hold & Win vorbereiten: Münzwerte würfeln
    var muenzWerte = null;
    if (sp.holdWin) {
      muenzWerte = [];
      for (var w = 0; w < sp.walzen; w++) {
        muenzWerte.push([]);
        for (var r = 0; r < sp.reihen; r++) {
          muenzWerte[w].push(feld[w][r] === 'muenze' ? muenzWert(sp) : null);
        }
      }
    }

    animiereWalzen(feld, function () {
      werteAus(feld, freispiel, muenzWerte);
    }, muenzWerte);
  }

  function muenzWert(sp) {
    var p = Z.zahl();
    if (p < 0.004) return 'MAJOR';
    if (p < 0.016) return 'MINOR';
    if (p < 0.05) return 'MINI';
    return Z.aus(sp.muenzWerte);
  }

  function werteAus(feld, freispiel, muenzWerte) {
    var sp = spielZustand.sp;
    var einsatz = spielZustand.einsatz;
    var linienEinsatz = einsatz / sp.linien.length;
    var gewinn = 0, notiz = '', zellen = [], linien = [];

    /* Hold & Win zuerst prüfen */
    if (sp.holdWin) {
      var muenzen = [];
      for (var w = 0; w < sp.walzen; w++) for (var r = 0; r < sp.reihen; r++) {
        if (feld[w][r] === 'muenze') muenzen.push([w, r]);
      }
      if (muenzen.length >= 6) {
        pruefeErfolg('drachenhort');
        P.proSpiel[sp.id].features++; P.stats.features++;
        starteHoldWin(feld, muenzWerte);
        return;
      }
    }

    /* Freispiel mit expandierendem Symbol */
    var exp = null;
    if (freispiel && sp.expandiert && spielZustand.fsSpezial) {
      exp = expandiere(sp, feld, spielZustand.fsSpezial, linienEinsatz);
      if (exp) {
        zeichneFeld(exp.feld);
        feld = exp.feld;
        gewinn += exp.betrag;
        zellen = zellen.concat(exp.zellen);
        notiz = 'Spezialsymbol!';
      }
    }

    /* Linien */
    if (!exp) {
      var res = werteLinien(sp, feld, linienEinsatz);
      gewinn += res.gesamt;
      res.treffer.forEach(function (t) {
        zellen = zellen.concat(t.zellen);
        if (linien.indexOf(t.linie) < 0) linien.push(t.linie);
      });
    }

    /* Scatter */
    var sc = zaehleScatter(sp, feld);
    if (sc.anzahl >= 3 && sp.scatterPay && sp.scatterPay[Math.min(sc.anzahl, 5)]) {
      gewinn += Math.round(sp.scatterPay[Math.min(sc.anzahl, 5)] * einsatz);
      zellen = zellen.concat(sc.zellen);
    }

    /* Freispiel-Multiplikator */
    if (freispiel && gewinn > 0) {
      gewinn = Math.round(gewinn * spielZustand.fsMult);
      spielZustand.fsMult = Math.min(10, spielZustand.fsMult + 1);
    }

    markiere(zellen);
    linienAn(linien);

    /* Freispiele auslösen oder verlängern */
    var neueFs = 0;
    if (sp.freispiele && sc.anzahl >= 3) {
      neueFs = sp.freispiele[Math.min(sc.anzahl, 5)] || 0;
    }

    if (gewinn > 0) {
      chipsAendern(gewinn);
      buchen(gewinn, freispiel ? 0 : einsatz, freispiel ? 'Freispiel' : (notiz || ''));
      ui.aGewinn.textContent = nz(gewinn);
      ledText(gewinnSpruch(gewinn / einsatz) + '  ' + nz(gewinn));
      Ton.gewinn(Math.floor(gewinn / einsatz));
      hypeSetzen(spielZustand.hype + Math.min(35, 6 + gewinn / einsatz));
      if (gewinn / einsatz >= 15) gewinnOverlay(gewinn, gewinn / einsatz);
    } else {
      buchen(0, freispiel ? 0 : einsatz, freispiel ? 'Freispiel' : '');
      ledText(freispiel ? 'WEITER GEHT\'S!' : 'VIEL GLÜCK!');
      hypeSetzen(spielZustand.hype - 4);
    }

    if (neueFs > 0) {
      P.proSpiel[sp.id].features++; P.stats.features++;
      pruefeErfolg('algeAlge');
      starteFreispiele(neueFs, sc.anzahl);
      return;
    }

    drehFertig(gewinn, freispiel);
  }

  function gewinnSpruch(mult) {
    if (mult >= 100) return 'KÖNIGSGEWINN!';
    if (mult >= 50) return 'DER PALAST BEBT!';
    if (mult >= 15) return 'ES SCHEPPERT!';
    if (mult >= 5) return 'SUPER!';
    return 'GEWINN';
  }

  function drehFertig(gewinn, warFreispiel) {
    laeuftDreh = false;
    // Der Spieler kann die Spielhalle verlassen, während die Walzen noch laufen.
    // Dann gibt es den Startknopf nicht mehr: Ablauf sauber beenden.
    if (!ui.start || !ui.start.isConnected) {
      spielZustand.freispiele = 0; spielZustand.fsGesamt = 0; spielZustand.auto = 0;
      return;
    }
    ui.start.disabled = false;
    ui.start.classList.remove('dreht');

    if (spielZustand.freispiele > 0) {
      setTimeout(function () { if (spielZustand.freispiele > 0) dreheLos(); }, spielZustand.turbo ? 320 : 850);
      return;
    }
    if (spielZustand.fsGesamt > 0 && spielZustand.freispiele === 0) {
      spielZustand.fsGesamt = 0; spielZustand.fsMult = 1; spielZustand.fsSpezial = null;
      ledText('FREISPIELE BEENDET');
    }

    // Risiko nur bei manuellem Gewinn
    if (gewinn > 0 && !warFreispiel && spielZustand.sp.risiko && spielZustand.auto === 0) {
      zeigeRisiko(gewinn);
      return;
    }
    if (spielZustand.auto > 0) {
      spielZustand.auto--;
      ui.autoSel.value = String(spielZustand.auto);
      if (spielZustand.auto > 0) {
        setTimeout(function () { if (!laeuftDreh && spielZustand.auto > 0) dreheLos(); }, spielZustand.turbo ? 200 : 600);
      } else {
        ui.autoSel.value = '0';
      }
    }
  }

  function buchen(gewinn, einsatz, notiz) {
    var sp = spielZustand.sp;
    P.stats.gewonnen += gewinn;
    P.proSpiel[sp.id].gewonnen += gewinn;
    if (gewinn > P.proSpiel[sp.id].rekord) P.proSpiel[sp.id].rekord = gewinn;
    if (gewinn > P.stats.rekord) { P.stats.rekord = gewinn; P.stats.rekordSpiel = sp.name; }

    P.verlauf.unshift({ spiel: sp.name, einsatz: einsatz, gewinn: gewinn, notiz: notiz || '' });
    if (P.verlauf.length > 40) P.verlauf.length = 40;

    var basis = einsatz || spielZustand.einsatz;
    var mult = basis > 0 ? gewinn / basis : 0;
    if (gewinn > 0) {
      pruefeErfolg('ersterTreffer');
      if (mult >= 15) pruefeErfolg('scheppert');
      if (mult >= 50) pruefeErfolg('kasinoKoenig');
      if (mult >= 3 || notiz) {
        var eintrag = {
          spieler: P.name, spiel: sp.id, gewinn: gewinn, mult: mult,
          art: notiz === 'Hold & Win' ? 'Hold & Win' : (notiz === 'Freispiel' ? 'Freispiele' : 'Gewinn'),
          datum: new Date().toISOString()
        };
        P.bestenliste.push(eintrag);
        P.bestenliste.sort(function (a, b) { return b.gewinn - a.gewinn; });
        if (P.bestenliste.length > 60) P.bestenliste.length = 60;
        // Nebenbei in die gemeinsame Liste schicken; Fehler stören das Spiel nicht.
        Online.melde(eintrag);
      }
    }
    speichern();
    chipsMelden();
  }

  /* Chipstand höchstens alle 20 Sekunden hochschicken */
  var letzteChipMeldung = 0;
  function chipsMelden(sofort) {
    if (!Online.aktiv() || !P) return;
    var jetzt = Date.now();
    if (!sofort && jetzt - letzteChipMeldung < 20000) return;
    letzteChipMeldung = jetzt;
    Online.meldeChips(P.name, P.chips);
  }

  /* ======================= Freispiele ======================= */

  function starteFreispiele(anzahl, scatter) {
    var sp = spielZustand.sp;
    spielZustand.freispiele += anzahl;
    spielZustand.fsGesamt += anzahl;
    if (!spielZustand.fsSpezial && sp.expandiert) {
      var kandidaten = sp.symbole.filter(function (sy) {
        return sy.id !== sp.wild && sy.id !== sp.scatter && Object.keys(sy.pay).length;
      });
      spielZustand.fsSpezial = Z.aus(kandidaten).id;
    }
    spielZustand.fsMult = 1;

    var box = el('div', 'gp-mitte');
    box.appendChild(el('h3', 'gp-serif', anzahl + ' FREISPIELE!')).style.cssText = 'font-size:1.8rem;color:#f7e0a8;margin-bottom:.6rem';
    box.appendChild(el('p', null, scatter + ' ' + (sp.symMap[sp.scatter] ? sp.symMap[sp.scatter].name.split(' (')[0] : 'Symbole') + ' gelandet.'))
      .style.cssText = 'color:#bda68f;margin-bottom:1rem';

    if (sp.expandiert && spielZustand.fsSpezial) {
      var sy = symEl(sp, spielZustand.fsSpezial, 'tab');
      sy.style.margin = '0 auto .6rem';
      box.appendChild(sy);
      box.appendChild(el('p', null, 'Spezialsymbol: ' + sp.symMap[spielZustand.fsSpezial].name))
        .style.cssText = 'color:#f7e0a8;font-weight:700;margin-bottom:1rem';
    }
    box.appendChild(el('p', null, 'Multiplikator startet bei ×1 und steigt mit jedem Gewinn bis ×10.'))
      .style.cssText = 'color:#bda68f;font-size:.85rem;margin-bottom:1.2rem';

    var btn = el('button', 'gp-btn gp-gold', 'LOS GEHT\'S');
    var m = schlichtesModal(box);
    box.appendChild(btn);
    btn.addEventListener('click', function () {
      m.remove();
      drehFertig(0, true);
    });
    Ton.gewinn(4);
  }

  /* ======================= Hold & Win ======================= */

  function starteHoldWin(feld, muenzWerte) {
    var sp = spielZustand.sp;
    var einsatz = spielZustand.einsatz;
    var haft = [];     // [w][r] = Wert oder null
    for (var w = 0; w < sp.walzen; w++) {
      haft.push([]);
      for (var r = 0; r < sp.reihen; r++) {
        haft[w].push(feld[w][r] === 'muenze' ? muenzWerte[w][r] : null);
      }
    }
    var respins = 3;
    var gesamtFelder = sp.walzen * sp.reihen;

    ledText('HOLD & WIN!');

    function zaehle() {
      var n = 0;
      for (var w = 0; w < sp.walzen; w++) for (var r = 0; r < sp.reihen; r++) if (haft[w][r] !== null) n++;
      return n;
    }
    function zeichne() {
      var f = [], mw = [];
      for (var w = 0; w < sp.walzen; w++) {
        f.push([]); mw.push([]);
        for (var r = 0; r < sp.reihen; r++) {
          f[w].push(haft[w][r] !== null ? 'muenze' : 'leer');
          mw[w].push(haft[w][r]);
        }
      }
      // "leer" gibt es nicht als Symbol – dunkles Feld zeichnen
      ui.walzen.innerHTML = '';
      ui.zellen = [];
      for (var w2 = 0; w2 < sp.walzen; w2++) {
        var walze = el('div', 'gp-walze');
        var streifen = el('div', 'gp-streifen');
        var spalte = [];
        for (var r2 = 0; r2 < sp.reihen; r2++) {
          var z = el('div', 'gp-zelle');
          if (haft[w2][r2] !== null) {
            z.appendChild(symEl(sp, 'muenze', null, haft[w2][r2]));
            z.classList.add('halten');
          } else {
            var leer = el('div', 'gp-sym');
            leer.style.background = 'rgba(0,0,0,.45)';
            leer.style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,.07)';
            z.appendChild(leer);
          }
          streifen.appendChild(z);
          spalte.push(z);
        }
        walze.appendChild(streifen);
        ui.walzen.appendChild(walze);
        ui.zellen.push(spalte);
      }
    }
    zeichne();

    function respin() {
      ledText('RESPINS: ' + respins + '  ·  MÜNZEN: ' + zaehle());
      var neue = 0;
      for (var w = 0; w < sp.walzen; w++) {
        for (var r = 0; r < sp.reihen; r++) {
          if (haft[w][r] === null && Z.zahl() < 0.12) { haft[w][r] = muenzWert(sp); neue++; }
        }
      }
      zeichne();
      if (neue > 0) { respins = 3; Ton.gewinn(1); } else { respins--; }

      if (zaehle() >= gesamtFelder) { ende(true); return; }
      if (respins <= 0) { ende(false); return; }
      setTimeout(respin, spielZustand.turbo ? 320 : 750);
    }

    function ende(voll) {
      var summe = 0, jackpot = '';
      for (var w = 0; w < sp.walzen; w++) for (var r = 0; r < sp.reihen; r++) {
        var v = haft[w][r];
        if (v === null) continue;
        if (v === 'MINI') { summe += sp.jackpots.mini; jackpot = 'MINI'; }
        else if (v === 'MINOR') { summe += sp.jackpots.minor; jackpot = 'MINOR'; }
        else if (v === 'MAJOR') { summe += sp.jackpots.major; jackpot = 'MAJOR'; }
        else summe += v * einsatz;
      }
      var notiz = 'Hold & Win';
      if (voll) {
        summe += daten.grand;
        jackpot = 'GRAND';
        notiz = 'Hold & Win · GRAND!';
        daten.grand = 20000;
        if (ui.grandEl) ui.grandEl.textContent = nz(daten.grand);
      }
      if (jackpot) pruefeErfolg('jackpotKrone');

      chipsAendern(summe);
      buchen(summe, einsatz, notiz);
      ui.aGewinn.textContent = nz(summe);
      ledText('HOLD & WIN: ' + nz(summe));
      gewinnOverlay(summe, summe / einsatz, voll ? 'GRAND-JACKPOT!' : 'HOLD & WIN');
      setTimeout(function () { drehFertig(summe, true); }, 400);
    }

    setTimeout(respin, 700);
  }

  /* ======================= Risikoleiter & Karten ======================= */

  function risikoSchliessen() {
    ui.risikoOffen = false;
    if (ui.risikoHalter) ui.risikoHalter.innerHTML = '';
  }

  function leiterWerte(start) {
    var w = [], v = start;
    for (var i = 0; i < 8; i++) { v = Math.round(v * 2); w.push(v); }
    return w;
  }

  function zeigeRisiko(betrag) {
    var box = el('div', 'gp-risiko');
    ui.risikoHalter.innerHTML = '';
    ui.risikoHalter.appendChild(box);
    ui.risikoOffen = true;

    spielZustand.risikoBetrag = betrag;
    spielZustand.leiterWerte = leiterWerte(betrag);
    spielZustand.leiterStufe = -1;

    box.appendChild(el('h4', 'gp-serif', 'RISIKOLEITER'));
    box.appendChild(el('p', 'hinw', 'Gewinn ' + nz(betrag) + ' Chips. Hochdrücken verdoppelt – oder alles ist weg. ' +
      'Leertaste drückt hoch.'));

    var leiter = el('div', 'gp-leiter');
    spielZustand.leiterWerte.forEach(function (v, i) {
      var st = el('div', 'gp-stufe');
      st.appendChild(el('span', null, 'Stufe ' + (i + 1)));
      st.appendChild(el('span', null, nz(v)));
      leiter.appendChild(st);
    });
    box.appendChild(leiter);
    ui.leiter = leiter;

    var kn = el('div', 'gp-risiko-knoepfe');
    var hoch = el('button', 'gp-btn gp-gold', '▲ HOCHDRÜCKEN');
    hoch.addEventListener('click', leiterHoch);
    var teilen = el('button', 'gp-btn', '½ TEILEN');
    teilen.addEventListener('click', function () {
      var h = Math.floor(spielZustand.risikoBetrag / 2);
      chipsAendern(h);
      ledText('GETEILT: ' + nz(h));
      risikoSchliessen();
      nachRisiko();
    });
    var karten = el('button', 'gp-btn', '🂠 KARTENRISIKO');
    karten.addEventListener('click', function () { zeigeKarten(spielZustand.risikoBetrag); });
    var nehmen = el('button', 'gp-btn', '✓ GEWINN NEHMEN');
    nehmen.addEventListener('click', function () {
      ledText('GEWINN GENOMMEN');
      risikoSchliessen();
      nachRisiko();
    });
    kn.appendChild(hoch); kn.appendChild(teilen); kn.appendChild(karten); kn.appendChild(nehmen);
    box.appendChild(kn);

    // Gewinn ist schon gutgeschrieben – fürs Risiko wieder abziehen
    chipsAendern(-betrag);
    leiterBlinken();
  }

  var leiterTimer = null;
  function leiterBlinken() {
    clearInterval(leiterTimer);
    var i = Math.max(0, spielZustand.leiterStufe);
    leiterTimer = setInterval(function () {
      if (!ui.risikoOffen || !ui.leiter) { clearInterval(leiterTimer); return; }
      Array.prototype.forEach.call(ui.leiter.children, function (c, idx) {
        c.classList.toggle('aktiv', idx === i);
      });
      i = (i + 1) % Math.min(spielZustand.leiterWerte.length, Math.max(2, spielZustand.leiterStufe + 3));
    }, 220);
  }

  function leiterHoch() {
    if (!ui.risikoOffen) return;
    clearInterval(leiterTimer);
    var gewonnen = Z.zahl() < 0.47;   // knapp unter 50 % – Hausvorteil
    if (gewonnen) {
      spielZustand.leiterStufe++;
      var neu = spielZustand.leiterWerte[spielZustand.leiterStufe];
      spielZustand.risikoBetrag = neu;
      Array.prototype.forEach.call(ui.leiter.children, function (c, idx) {
        c.classList.toggle('aktiv', idx === spielZustand.leiterStufe);
      });
      Ton.leiter(true);
      ledText('RISIKO GEWONNEN: ' + nz(neu));
      if (spielZustand.leiterStufe >= spielZustand.leiterWerte.length - 1) {
        pruefeErfolg('leiterLegende');
        chipsAendern(neu);
        buchen(neu, 0, 'Leiter-Spitze!');
        gewinnOverlay(neu, 0, 'SPITZE DER LEITER!');
        risikoSchliessen();
        nachRisiko();
        return;
      }
      setTimeout(leiterBlinken, 500);
    } else {
      Ton.leiter(false);
      ledText('LEITER ABGESTÜRZT');
      P.verlauf.unshift({ spiel: spielZustand.sp.name, einsatz: 0, gewinn: 0, notiz: 'Leiter abgestürzt (−' + nz(spielZustand.risikoBetrag) + ')' });
      if (P.verlauf.length > 40) P.verlauf.length = 40;
      speichern();
      risikoSchliessen();
      nachRisiko();
    }
  }

  function zeigeKarten(betrag) {
    clearInterval(leiterTimer);
    var box = el('div', 'gp-risiko');
    ui.risikoHalter.innerHTML = '';
    ui.risikoHalter.appendChild(box);
    ui.risikoOffen = false;

    box.appendChild(el('h4', 'gp-serif', 'KARTENRISIKO'));
    box.appendChild(el('p', 'hinw', nz(betrag) + ' Chips im Spiel. Rot oder Schwarz? 50/50.'));
    var k = el('div', 'gp-karten');
    var karte = el('div', 'gp-spielkarte rueck', '🂠');
    k.appendChild(karte);
    box.appendChild(k);

    var kn = el('div', 'gp-risiko-knoepfe');
    function tipp(rot) {
      var istRot = Z.zahl() < 0.48;
      var symbole = rot ? ['♥', '♦'] : ['♠', '♣'];
      var zeige = istRot ? Z.aus(['♥', '♦']) : Z.aus(['♠', '♣']);
      karte.className = 'gp-spielkarte' + (istRot ? ' rot' : '');
      karte.textContent = zeige;
      if (istRot === rot) {
        var neu = betrag * 2;
        Ton.leiter(true);
        box.querySelector('.hinw').textContent = 'Richtig! ' + nz(neu) + ' Chips.';
        kn.innerHTML = '';
        var w = el('button', 'gp-btn gp-gold', 'WEITER RISIKIEREN');
        w.addEventListener('click', function () { zeigeKarten(neu); });
        var n = el('button', 'gp-btn', '✓ NEHMEN (' + nz(neu) + ')');
        n.addEventListener('click', function () {
          chipsAendern(neu);
          buchen(neu, 0, 'Kartenrisiko');
          ledText('GEWONNEN: ' + nz(neu));
          risikoSchliessen(); nachRisiko();
        });
        kn.appendChild(w); kn.appendChild(n);
      } else {
        Ton.leiter(false);
        box.querySelector('.hinw').textContent = 'Daneben. Der Gewinn ist weg.';
        kn.innerHTML = '';
        P.verlauf.unshift({ spiel: spielZustand.sp.name, einsatz: 0, gewinn: 0, notiz: 'Karte daneben (−' + nz(betrag) + ')' });
        speichern();
        setTimeout(function () { risikoSchliessen(); nachRisiko(); }, 1300);
      }
    }
    var rot = el('button', 'gp-btn', '🂱 ROT');
    rot.style.cssText = 'background:#7a1024;border-color:#f4536d;color:#ffd9df';
    rot.addEventListener('click', function () { tipp(true); });
    var schwarz = el('button', 'gp-btn', '🂡 SCHWARZ');
    schwarz.addEventListener('click', function () { tipp(false); });
    kn.appendChild(rot); kn.appendChild(schwarz);
    box.appendChild(kn);
  }

  function nachRisiko() {
    if (spielZustand.auto > 0) {
      spielZustand.auto--;
      ui.autoSel.value = String(spielZustand.auto || 0);
      if (spielZustand.auto > 0) setTimeout(dreheLos, 500);
    }
  }

  /* ======================= Gewinn-Einblendung ======================= */

  function gewinnOverlay(betrag, mult, titel) {
    var o = el('div', 'gp-gewinn-overlay');
    o.appendChild(el('div', 'titel', titel || gewinnSpruch(mult)));
    o.appendChild(el('div', 'betrag', '+' + nz(betrag)));
    root.appendChild(o);
    setTimeout(function () { o.remove(); }, 1800);
  }

  /* ======================= Nachschub ======================= */

  function nachschub() {
    var box = el('div', 'gp-mitte');
    box.appendChild(el('h3', 'gp-serif', 'Chips alle!')).style.cssText = 'font-size:1.5rem;color:#f7e0a8;margin-bottom:.6rem';
    box.appendChild(el('p', null, 'Der Palast schenkt dir 1.000 Chips, damit es weitergeht. Spielgeld ohne Geldwert – ' +
      'du kannst hier nichts kaufen und nichts auszahlen.')).style.cssText = 'color:#bda68f;margin-bottom:1.2rem;line-height:1.6';
    var b = el('button', 'gp-btn gp-gold', '1.000 CHIPS HOLEN');
    var m = schlichtesModal(box);
    box.appendChild(b);
    b.addEventListener('click', function () {
      P.gratis = (P.gratis || 0) + 1;
      chipsAendern(1000);
      m.remove();
    });
  }

  /* ======================= Erfolge ======================= */

  function pruefeErfolg(id) {
    if (!P.erfolge) P.erfolge = {};
    if (P.erfolge[id]) return;
    var e = null;
    for (var i = 0; i < ERFOLGE.length; i++) if (ERFOLGE[i].id === id) e = ERFOLGE[i];
    if (!e) return;
    P.erfolge[id] = new Date().toISOString();
    P.chips += e.bonus;
    kopfAktualisieren();
    speichern();
    erfolgToast(e);
  }

  function erfolgToast(e) {
    var t = el('div');
    t.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:9700;' +
      'background:linear-gradient(180deg,#f3d99b,#c69a46);color:#241317;border-radius:14px;' +
      'padding:.8rem 1.2rem;font-weight:800;box-shadow:0 14px 34px rgba(0,0,0,.5);text-align:center;max-width:90vw';
    t.innerHTML = '🏆 Erfolg: ' + e.name + '<br><span style="font-weight:600;font-size:.82rem">' + e.text + ' · +' + nz(e.bonus) + ' Chips</span>';
    root.appendChild(t);
    setTimeout(function () { t.remove(); }, 3200);
  }

  /* ======================= Gewinnplan ======================= */

  function zeigeGewinnplan(sp) {
    var einsatz = (spielZustand && spielZustand.sp === sp) ? spielZustand.einsatz : sp.einsatz;
    var le = einsatz / sp.linien.length;
    var inhalt = el('div');

    inhalt.appendChild(el('p', null, 'Beträge in Chips beim aktuellen Einsatz von ' + nz(einsatz) + '.'))
      .style.cssText = 'color:#bda68f;font-size:.86rem;margin-bottom:1rem';

    var zahlen = [2, 3, 4, 5].filter(function (n) {
      if (n > sp.walzen) return false;
      return sp.symbole.some(function (sy) { return sy.pay[n]; });
    });

    var kopf = el('div', 'gp-plan-kopf');
    kopf.appendChild(el('span', null, '')).style.width = '42px';
    kopf.appendChild(el('span', null, 'SYMBOL')).style.flex = '1';
    zahlen.forEach(function (n) {
      kopf.appendChild(el('span', null, n + '×')).style.cssText = 'width:72px;text-align:right';
    });
    inhalt.appendChild(kopf);

    sp.symbole.forEach(function (sy) {
      if (!Object.keys(sy.pay).length && sy.id !== sp.scatter) return;
      var z = el('div', 'gp-plan-zeile');
      z.appendChild(symEl(sp, sy.id, 'tab'));
      z.appendChild(el('span', 'gp-plan-name', sy.name));
      zahlen.forEach(function (n) {
        var v = sy.pay[n];
        var txt = v ? nz(Math.round(v * le)) : '–';
        if (!v && sy.id === sp.scatter && sp.scatterPay && sp.scatterPay[n]) {
          txt = nz(Math.round(sp.scatterPay[n] * einsatz));
        }
        z.appendChild(el('span', 'gp-plan-wert', txt));
      });
      inhalt.appendChild(z);
    });

    if (sp.mischGruppe) {
      var zm = el('div', 'gp-plan-zeile');
      var box = el('div');
      box.style.cssText = 'width:42px;text-align:center;font-weight:800;font-size:.72rem;color:#e9c178';
      box.textContent = 'BAR/7';
      zm.appendChild(box);
      zm.appendChild(el('span', 'gp-plan-name', '3 beliebig gemischt'));
      zahlen.forEach(function (n) {
        zm.appendChild(el('span', 'gp-plan-wert', n === 3 ? nz(Math.round(sp.mischPay * le)) : '–'));
      });
      inhalt.appendChild(zm);
    }

    var reg = el('div', 'gp-regeln');
    reg.appendChild(el('h4', null, 'Spielhallen-Regeln'));
    var ul = el('ul');
    sp.regeln.forEach(function (r) {
      var li = el('li');
      li.innerHTML = r;
      ul.appendChild(li);
    });
    reg.appendChild(ul);
    inhalt.appendChild(reg);

    var lin = el('div', 'gp-regeln');
    lin.appendChild(el('h4', null, 'Gewinnlinien'));
    var gitter = el('div', 'gp-linien-gitter');
    sp.linien.forEach(function (muster, i) {
      var b = el('div', 'gp-linien-box');
      b.appendChild(el('span', null, 'Linie ' + (i + 1)));
      var z = el('div', 'gp-linien-zeichnung');
      z.style.gridTemplateColumns = 'repeat(' + sp.walzen + ',1fr)';
      for (var r = 0; r < sp.reihen; r++) {
        for (var w = 0; w < sp.walzen; w++) {
          var c = el('i');
          if (muster[w] === r) c.className = 'an';
          z.appendChild(c);
        }
      }
      b.appendChild(z);
      gitter.appendChild(b);
    });
    lin.appendChild(gitter);
    lin.appendChild(el('p', null, 'Auszahlungsquote ≈ ' + sp.rtp + '. Jeder Dreh nutzt den Zufallsgenerator des Browsers (crypto.getRandomValues).'))
      .style.cssText = 'color:#bda68f;font-size:.78rem;margin-top:.8rem';
    inhalt.appendChild(lin);

    modal(sp.name + ' · Gewinnplan', inhalt);
  }

  /* ======================= Bestenliste ======================= */

  var blFilter = { quelle: 'online', art: 'gewinn', spiel: 'alle' };

  function zeigeBestenliste() {
    var inhalt = el('div');

    var r1 = el('div', 'gp-filter');
    [['online', 'Online'], ['lokal', 'Dieses Gerät']].forEach(function (pr) {
      var b = el('button', 'gp-chip', pr[1]);
      b.setAttribute('aria-pressed', blFilter.quelle === pr[0] ? 'true' : 'false');
      b.addEventListener('click', function () { blFilter.quelle = pr[0]; neu(); });
      r1.appendChild(b);
    });
    inhalt.appendChild(r1);

    var r2 = el('div', 'gp-filter');
    [['gewinn', 'Größte Gewinne'], ['mult', 'Höchster Multiplikator'], ['reich', 'Reichste Spieler']].forEach(function (pr) {
      var b = el('button', 'gp-chip', pr[1]);
      b.setAttribute('aria-pressed', blFilter.art === pr[0] ? 'true' : 'false');
      b.addEventListener('click', function () { blFilter.art = pr[0]; neu(); });
      r2.appendChild(b);
    });
    inhalt.appendChild(r2);

    var r3 = el('div', 'gp-filter');
    [['alle', 'Alle']].concat(SPIEL_IDS.map(function (id) { return [id, SPIELE[id].kurz]; })).forEach(function (pr) {
      var b = el('button', 'gp-chip', pr[1]);
      b.setAttribute('aria-pressed', blFilter.spiel === pr[0] ? 'true' : 'false');
      b.addEventListener('click', function () { blFilter.spiel = pr[0]; neu(); });
      r3.appendChild(b);
    });
    inhalt.appendChild(r3);

    var ziel = el('div');
    inhalt.appendChild(ziel);
    var m = modal('Bestenliste', inhalt);

    function neu() { m.remove(); zeigeBestenliste(); }

    /* ---- Online: Daten aus der gemeinsamen Datenbank holen ---- */
    if (blFilter.quelle === 'online') {
      if (!Online.aktiv()) {
        var hin = el('p');
        hin.style.cssText = 'background:rgba(250,204,21,.12);border:1px solid #facc15;border-radius:10px;' +
          'padding:.7rem .9rem;font-size:.82rem;line-height:1.55;margin-bottom:.9rem';
        hin.innerHTML = '<b style="color:#facc15">Noch nicht eingerichtet.</b> Für eine gemeinsame Bestenliste ' +
          'trägst du in <code>glueckspalast.js</code> oben unter <code>GP_ONLINE</code> die zwei Werte deines ' +
          'kostenlosen Supabase-Projekts ein. Die Anleitung steht in <code>supabase-setup.sql</code>. ' +
          'Solange siehst du unter „Dieses Gerät" deine eigenen Einträge.';
        ziel.appendChild(hin);
      } else {
        var laedt = el('p', null, 'Bestenliste wird geladen …');
        laedt.style.cssText = 'color:#bda68f;padding:.6rem 0';
        ziel.appendChild(laedt);

        var anfrage = blFilter.art === 'reich'
          ? Online.reiche(20)
          : Online.gewinne(blFilter.art, blFilter.spiel, 20);

        anfrage.then(function (zeilen) {
          if (!ziel.isConnected) return;
          ziel.textContent = '';
          if (!zeilen || !zeilen.length) {
            ziel.appendChild(el('p', null, 'Noch keine Einträge in der Online-Bestenliste.')).style.cssText = 'color:#bda68f';
          } else if (blFilter.art === 'reich') {
            ziel.appendChild(tabelleReich(zeilen.map(function (z) {
              return { spieler: z.spieler, chips: z.chips };
            })));
          } else {
            ziel.appendChild(tabelleGewinne(zeilen));
          }
          ziel.appendChild(fussHinweis('online'));
        }, function (fehler) {
          if (!ziel.isConnected) return;
          ziel.textContent = '';
          var f = el('p');
          f.style.cssText = 'background:rgba(239,68,68,.12);border:1px solid #ef4444;border-radius:10px;' +
            'padding:.7rem .9rem;font-size:.82rem;line-height:1.55';
          f.innerHTML = '<b style="color:#fca5a5">Online-Bestenliste nicht erreichbar.</b><br>' +
            String(fehler && fehler.message || fehler) +
            '<br>Unter „Dieses Gerät" stehen deine eigenen Einträge weiterhin bereit.';
          ziel.appendChild(f);
        });
        return;   // der Rest wird nachgeladen
      }
    }

    if (blFilter.art === 'reich') {
      var namen = Object.keys(daten.profile).map(function (n) { return { spieler: n, chips: daten.profile[n].chips }; })
        .sort(function (a, b) { return b.chips - a.chips; });
      ziel.appendChild(tabelleReich(namen));
    } else {
      var liste = (P.bestenliste || []).slice();
      if (blFilter.spiel !== 'alle') liste = liste.filter(function (e) { return e.spiel === blFilter.spiel; });
      liste.sort(function (a, b) {
        return blFilter.art === 'mult' ? b.mult - a.mult : b.gewinn - a.gewinn;
      });
      liste = liste.slice(0, 20);

      if (!liste.length) {
        ziel.appendChild(el('p', null, 'Noch keine Einträge.')).style.cssText = 'color:#bda68f';
      } else {
        ziel.appendChild(tabelleGewinne(liste));
      }
    }

    ziel.appendChild(fussHinweis('lokal'));
  }

  /* Tabelle: größte Gewinne bzw. höchste Multiplikatoren */
  function tabelleGewinne(liste) {
    var t = el('table', 'gp-tab');
    t.innerHTML = '<thead><tr><th>#</th><th>SPIELER</th><th>AUTOMAT</th>' +
      '<th class="num">GEWINN</th><th class="num">× EINSATZ</th><th>ART</th><th class="num">DATUM</th></tr></thead>';
    var tb = el('tbody');
    liste.forEach(function (e, i) {
      var tr = el('tr');
      var td0 = el('td');
      td0.appendChild(el('span', 'gp-rang' + (i < 3 ? ' r' + (i + 1) : ''), String(i + 1)));
      tr.appendChild(td0);
      tr.appendChild(el('td', null, e.spieler)).style.fontWeight = '700';
      var td2 = el('td');
      td2.textContent = SPIELE[e.spiel] ? SPIELE[e.spiel].icon : '🎰';
      td2.title = SPIELE[e.spiel] ? SPIELE[e.spiel].name : '';
      td2.style.fontSize = '1.1rem';
      tr.appendChild(td2);
      tr.appendChild(el('td', 'num', nz(e.gewinn)));
      tr.appendChild(el('td', 'num', (Math.round((e.mult || 0) * 10) / 10).toLocaleString('de-DE') + '×'));
      tr.appendChild(el('td', null, e.art || 'Gewinn'));
      tr.appendChild(el('td', 'num', datumKurz(e.datum)));
      tb.appendChild(tr);
    });
    t.appendChild(tb);
    return t;
  }

  /* Tabelle: reichste Spieler */
  function tabelleReich(namen) {
    var t = el('table', 'gp-tab');
    t.innerHTML = '<thead><tr><th>#</th><th>SPIELER</th><th class="num">CHIPS</th></tr></thead>';
    var tb = el('tbody');
    namen.forEach(function (e, i) {
      var tr = el('tr');
      var td0 = el('td');
      td0.appendChild(el('span', 'gp-rang' + (i < 3 ? ' r' + (i + 1) : ''), String(i + 1)));
      tr.appendChild(td0);
      tr.appendChild(el('td', null, e.spieler)).style.fontWeight = '700';
      tr.appendChild(el('td', 'num', nz(e.chips)));
      tb.appendChild(tr);
    });
    t.appendChild(tb);
    return t;
  }

  function fussHinweis(quelle) {
    var p = el('p', null, 'Gewinne ab 3× Einsatz, Freispielrunden und Hold & Win landen hier. ' +
      'Nach der Risikoleiter zählt der Endbetrag. Spielgeld ohne Geldwert.' +
      (quelle === 'online'
        ? ' Die Online-Liste ist für alle sichtbar – jeder kann Einträge schreiben, also schreib dort nichts Persönliches hinein.'
        : ''));
    p.style.cssText = 'color:#bda68f;font-size:.76rem;margin-top:.9rem;line-height:1.5';
    return p;
  }

  /* ======================= Statistik ======================= */

  function zeigeStatistik() {
    var inhalt = el('div');
    var reihe = el('div', 'gp-stat-reihe');
    [['DREHUNGEN', nz(P.stats.drehs)], ['GESETZT', nz(P.stats.gesetzt)],
     ['GEWONNEN', nz(P.stats.gewonnen)], ['REKORDGEWINN', nz(P.stats.rekord)]].forEach(function (pr) {
      var c = el('div', 'gp-stat');
      c.appendChild(el('span', null, pr[0]));
      c.appendChild(el('b', null, pr[1]));
      reihe.appendChild(c);
    });
    inhalt.appendChild(reihe);

    var t = el('table', 'gp-tab');
    t.innerHTML = '<thead><tr><th>AUTOMAT</th><th class="num">DREHS</th><th class="num">GESETZT</th>' +
      '<th class="num">GEWONNEN</th><th class="num">QUOTE</th><th class="num">REKORD</th><th class="num">FEATURES</th></tr></thead>';
    var tb = el('tbody');
    SPIEL_IDS.forEach(function (id) {
      var st = P.proSpiel[id] || { drehs: 0, gesetzt: 0, gewonnen: 0, rekord: 0, features: 0 };
      var tr = el('tr');
      tr.appendChild(el('td', null, SPIELE[id].name));
      tr.appendChild(el('td', 'num', nz(st.drehs)));
      tr.appendChild(el('td', 'num', nz(st.gesetzt)));
      tr.appendChild(el('td', 'num', nz(st.gewonnen)));
      tr.appendChild(el('td', 'num', st.gesetzt ? (st.gewonnen / st.gesetzt * 100).toFixed(1).replace('.', ',') + ' %' : '–'));
      tr.appendChild(el('td', 'num', nz(st.rekord)));
      tr.appendChild(el('td', 'num', nz(st.features)));
      tb.appendChild(tr);
    });
    t.appendChild(tb);
    inhalt.appendChild(t);

    var auf = ERFOLGE.filter(function (e) { return P.erfolge && P.erfolge[e.id]; }).length;
    var h = el('h4');
    h.style.cssText = 'color:#f7e0a8;margin:1.3rem 0 .7rem;font-size:1rem';
    h.textContent = 'Erfolge ' + auf + '/' + ERFOLGE.length;
    inhalt.appendChild(h);

    var g = el('div', 'gp-erfolge');
    ERFOLGE.forEach(function (e) {
      var c = el('div', 'gp-erfolg' + (P.erfolge && P.erfolge[e.id] ? ' auf' : ''));
      c.appendChild(el('b', null, e.name));
      c.appendChild(el('span', null, e.text + ' · +' + nz(e.bonus)));
      g.appendChild(c);
    });
    inhalt.appendChild(g);

    inhalt.appendChild(el('p', null, 'Gratis-Nachschub genutzt: ' + (P.gratis || 0) + '× · GRAND-Topf: ' + nz(daten.grand)))
      .style.cssText = 'color:#bda68f;font-size:.8rem;margin-top:1rem';

    var reset = el('button', 'gp-btn', 'Spielstand zurücksetzen');
    reset.style.cssText = 'margin-top:1rem;border-color:#f4536d;color:#f4536d';
    reset.addEventListener('click', function () {
      if (!confirm('Wirklich alles zurücksetzen? Chips, Statistik und Erfolge von "' + P.name + '" gehen verloren.')) return;
      daten.profile[P.name] = neuesProfil(P.name);
      P = daten.profile[P.name];
      speichern();
      document.querySelectorAll('.gp-modal').forEach(function (m) { m.remove(); });
      zeigeLobby();
    });
    var wrap = el('div');
    wrap.style.textAlign = 'right';
    wrap.appendChild(reset);
    inhalt.appendChild(wrap);

    modal('Königliche Statistik', inhalt);
  }

  /* ======================= Glücksrad ======================= */

  var RAD_FELDER = [500, 1000, 750, 2500, 5000, 750, 1500, 10000, 750, 2000, 1000, 2000];
  var RAD_FARBEN = ['#8b1d33', '#5b2a7a', '#1f6b4a', '#8b1d33', '#b9431f', '#5b2a7a',
                    '#1f6b4a', '#c99a2e', '#5b2a7a', '#1f6b4a', '#8b1d33', '#5b2a7a'];

  function radScheibe(groesse) {
    var n = RAD_FELDER.length;
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('width', groesse); svg.setAttribute('height', groesse);
    svg.classList.add('gp-rad');

    var aussen = document.createElementNS(svgNS, 'circle');
    aussen.setAttribute('cx', 100); aussen.setAttribute('cy', 100); aussen.setAttribute('r', 98);
    aussen.setAttribute('fill', '#c99a2e');
    svg.appendChild(aussen);

    for (var i = 0; i < n; i++) {
      var a1 = (i / n) * 2 * Math.PI - Math.PI / 2;
      var a2 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
      var x1 = 100 + 92 * Math.cos(a1), y1 = 100 + 92 * Math.sin(a1);
      var x2 = 100 + 92 * Math.cos(a2), y2 = 100 + 92 * Math.sin(a2);
      var p = document.createElementNS(svgNS, 'path');
      p.setAttribute('d', 'M100,100 L' + x1 + ',' + y1 + ' A92,92 0 0,1 ' + x2 + ',' + y2 + ' Z');
      p.setAttribute('fill', RAD_FARBEN[i % RAD_FARBEN.length]);
      p.setAttribute('stroke', '#f7e0a8');
      p.setAttribute('stroke-width', '1.2');
      svg.appendChild(p);

      var am = (a1 + a2) / 2;
      var tx = 100 + 62 * Math.cos(am), ty = 100 + 62 * Math.sin(am);
      var t = document.createElementNS(svgNS, 'text');
      t.setAttribute('x', tx); t.setAttribute('y', ty);
      t.setAttribute('fill', '#fff');
      t.setAttribute('font-size', '13');
      t.setAttribute('font-weight', '700');
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('dominant-baseline', 'middle');
      t.setAttribute('transform', 'rotate(' + (am * 180 / Math.PI + 90) + ' ' + tx + ' ' + ty + ')');
      t.textContent = RAD_FELDER[i] === 10000 ? '10K' : nz(RAD_FELDER[i]);
      svg.appendChild(t);
    }

    var nabe = document.createElementNS(svgNS, 'circle');
    nabe.setAttribute('cx', 100); nabe.setAttribute('cy', 100); nabe.setAttribute('r', 26);
    nabe.setAttribute('fill', '#e0b25a');
    nabe.setAttribute('stroke', '#8a6421'); nabe.setAttribute('stroke-width', '3');
    svg.appendChild(nabe);
    var ok = document.createElementNS(svgNS, 'text');
    ok.setAttribute('x', 100); ok.setAttribute('y', 101);
    ok.setAttribute('fill', '#3a240c'); ok.setAttribute('font-size', '15'); ok.setAttribute('font-weight', '800');
    ok.setAttribute('text-anchor', 'middle'); ok.setAttribute('dominant-baseline', 'middle');
    ok.textContent = 'OK';
    svg.appendChild(ok);
    return svg;
  }

  function zeigeGluecksrad() {
    if (P.letztesRad === heute()) return;
    var box = el('div', 'gp-rad-buehne');
    box.appendChild(el('div', 'gp-kicker', '👑 KÖNIGLICHES GLÜCKSRAD'));
    box.appendChild(el('h3', 'gp-serif', 'DREH AM RAD!'));
    var halter = el('div', 'gp-rad-halter');
    halter.appendChild(el('div', 'gp-rad-zeiger'));
    var rad = radScheibe(330);
    rad.style.width = '100%'; rad.style.height = 'auto';
    halter.appendChild(rad);
    box.appendChild(halter);
    var erg = el('div', 'gp-rad-ergebnis');
    box.appendChild(erg);
    var txt = el('div', 'gp-rad-text', 'Gleich geht es los …');
    box.appendChild(txt);

    var m = schlichtesModal(box);
    m.querySelector('.gp-box').style.maxWidth = '520px';

    setTimeout(function () {
      var n = RAD_FELDER.length;
      var feld = Z.bis(n);
      var proFeld = 360 / n;
      var ziel = 360 * 6 + (360 - (feld * proFeld + proFeld / 2));
      rad.style.transform = 'rotate(' + ziel + 'deg)';
      Ton.pieps(440, 0.08);
      setTimeout(function () {
        var betrag = RAD_FELDER[feld];
        erg.textContent = '+' + nz(betrag);
        txt.textContent = 'Sauber abgeräumt! Morgen wieder drehen.';
        P.letztesRad = heute();
        chipsAendern(betrag);
        P.verlauf.unshift({ spiel: 'Glücksrad', einsatz: 0, gewinn: betrag, notiz: 'Tagesdreh' });
        speichern();
        Ton.gewinn(3);
        var ok = el('button', 'gp-btn gp-gold', 'WEITER');
        ok.style.marginTop = '1rem';
        ok.addEventListener('click', function () { m.remove(); if (!aktuell) zeigeLobby(); });
        box.appendChild(ok);
      }, 5200);
    }, 350);
  }

  /* ======================= Spieler ======================= */

  function spielerMenue(e) {
    e.stopPropagation();
    var alt = root.querySelector('.gp-menue');
    if (alt) { alt.remove(); return; }
    var m = el('div', 'gp-menue');
    var r = ui.spieler.getBoundingClientRect();
    m.style.top = (r.bottom + 8) + 'px';
    m.style.left = Math.max(8, Math.min(r.left, window.innerWidth - 230)) + 'px';
    m.style.position = 'fixed';

    var w = el('button', null, 'Spieler wechseln');
    w.addEventListener('click', function () { m.remove(); zeigeSpielerwahl(); });
    m.appendChild(w);

    var d = el('button', 'gefahr', 'Profil von diesem Gerät löschen');
    d.addEventListener('click', function () {
      m.remove();
      if (!confirm('Profil "' + P.name + '" wirklich von diesem Gerät löschen?')) return;
      delete daten.profile[P.name];
      daten.aktiv = null;
      P = null;
      speichern();
      zeigeSpielerwahl();
    });
    m.appendChild(d);

    root.appendChild(m);
    setTimeout(function () {
      document.addEventListener('click', function weg() {
        m.remove();
        document.removeEventListener('click', weg);
      }, { once: true });
    }, 0);
  }

  function zeigeSpielerwahl() {
    var box = el('div', 'gp-mitte');
    box.appendChild(el('div', null, '👑')).style.cssText = 'font-size:2.4rem;margin-bottom:.2rem';
    box.appendChild(el('h3', 'gp-serif', 'GLÜCKSPALAST')).style.cssText = 'font-size:1.6rem;color:#f7e0a8';
    box.appendChild(el('p', null, 'Wer spielt?')).style.cssText = 'color:#bda68f;margin:.3rem 0 1.1rem';

    var m = schlichtesModal(box);

    Object.keys(daten.profile).forEach(function (name) {
      var p = daten.profile[name];
      var b = el('button', 'gp-profil-karte');
      b.appendChild(el('span', 'gp-avatar', name.charAt(0).toUpperCase()));
      b.appendChild(el('span', 'nm', name));
      b.appendChild(el('span', 'ch', nz(p.chips) + ' Chips'));
      b.addEventListener('click', function () {
        if (p.pin) {
          var ein = prompt('PIN für "' + name + '":');
          if (ein === null) return;
          if (String(ein) !== p.pin) { alert('PIN stimmt nicht.'); return; }
        }
        daten.aktiv = name; P = p; speichern();
        m.remove(); kopfAktualisieren(); zeigeLobby();
      });
      box.appendChild(b);
    });

    var reihe = el('div');
    reihe.style.cssText = 'display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap;margin-top:.8rem';
    var neu = el('button', 'gp-btn', 'Neuer Spieler');
    neu.addEventListener('click', function () {
      var name = prompt('Wie heißt du? (nur ein Spitzname)');
      if (!name) return;
      name = String(name).trim().slice(0, 18);
      if (!name) return;
      if (daten.profile[name]) { alert('Den Namen gibt es schon.'); return; }
      var pin = prompt('PIN zum Schutz (optional, einfach leer lassen).\nBitte keine echte PIN und kein echtes Passwort verwenden.');
      var p = neuesProfil(name);
      p.pin = pin ? String(pin).trim().slice(0, 8) : '';
      daten.profile[name] = p;
      daten.aktiv = name; P = p; speichern();
      m.remove(); kopfAktualisieren(); zeigeLobby();
    });
    reihe.appendChild(neu);

    var ander = el('button', 'gp-btn', 'Von anderem Gerät einloggen');
    ander.addEventListener('click', function () {
      alert('Dafür bräuchte der Palast einen Server. Dein Spielstand liegt nur in diesem Browser.');
    });
    reihe.appendChild(ander);
    box.appendChild(reihe);

    box.appendChild(el('p', null, 'Gespielt wird mit Spielgeld ohne Geldwert. Die PIN schützt dein Profil vor anderen. ' +
      'Bitte keine echte PIN oder ein echtes Passwort verwenden.'))
      .style.cssText = 'color:#bda68f;font-size:.76rem;margin-top:1rem;line-height:1.5';
    return m;
  }

  /* ======================= Tresor ======================= */

  var TRESOR_PASSWORT = 'alge2026';

  function zeigeTresorFrage() {
    if (tresorOffen) { zeigeTresor(); return; }
    var box = el('div', 'gp-mitte');
    box.appendChild(el('div', 'gp-tresor-icon'));
    box.appendChild(el('h3', 'gp-serif', 'TRESOR')).style.cssText = 'font-size:1.5rem;color:#f7e0a8';
    box.appendChild(el('p', null, 'Admin-Bereich. Bitte Passwort eingeben.'))
      .style.cssText = 'color:#bda68f;margin:.3rem 0 1rem';
    var fehler = el('div', 'gp-fehler', '');
    box.appendChild(fehler);
    var inp = el('input', 'gp-eingabe');
    inp.type = 'password';
    inp.placeholder = 'Passwort';
    box.appendChild(inp);

    var reihe = el('div');
    reihe.style.cssText = 'display:flex;gap:.6rem;justify-content:center';
    var ab = el('button', 'gp-btn', 'ABBRECHEN');
    var auf = el('button', 'gp-btn gp-gold', 'ÖFFNEN');
    reihe.appendChild(ab); reihe.appendChild(auf);
    box.appendChild(reihe);

    var m = schlichtesModal(box);
    ab.addEventListener('click', function () { m.remove(); });
    function pruefe() {
      if (inp.value === TRESOR_PASSWORT) { tresorOffen = true; m.remove(); zeigeTresor(); }
      else { fehler.textContent = 'Falsches Passwort.'; inp.value = ''; inp.focus(); }
    }
    auf.addEventListener('click', pruefe);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') pruefe(); });
    setTimeout(function () { inp.focus(); }, 50);
  }

  function zeigeTresor() {
    var inhalt = el('div');
    var hin = el('p');
    hin.style.cssText = 'background:rgba(244,83,109,.12);border:1px solid #f4536d;border-radius:10px;' +
      'padding:.7rem .9rem;font-size:.8rem;line-height:1.55;margin-bottom:1rem';
    hin.innerHTML = '<b style="color:#f4536d">Nur ein Spaß-Schloss.</b> Das Passwort steht im Quelltext der Seite, ' +
      'jeder kann es dort nachlesen. Es hält niemanden auf, der wirklich hineinschauen will.';
    inhalt.appendChild(hin);

    function reihe(titel, knoepfe) {
      var h = el('h4');
      h.style.cssText = 'color:#f7e0a8;margin:1rem 0 .5rem;font-size:.95rem';
      h.textContent = titel;
      inhalt.appendChild(h);
      var r = el('div');
      r.style.cssText = 'display:flex;gap:.5rem;flex-wrap:wrap';
      knoepfe.forEach(function (k) {
        var b = el('button', 'gp-btn', k[0]);
        b.addEventListener('click', k[1]);
        r.appendChild(b);
      });
      inhalt.appendChild(r);
    }

    reihe('Chips', [
      ['+1.000', function () { chipsAendern(1000); }],
      ['+10.000', function () { chipsAendern(10000); }],
      ['+100.000', function () { chipsAendern(100000); }],
      ['Auf 5.000 setzen', function () { P.chips = 5000; kopfAktualisieren(); speichern(); }]
    ]);

    reihe('GRAND-Topf', [
      ['+10.000', function () { daten.grand += 10000; speichern(); if (ui.grandEl) ui.grandEl.textContent = nz(daten.grand); }],
      ['Auf 20.000 zurück', function () { daten.grand = 20000; speichern(); if (ui.grandEl) ui.grandEl.textContent = nz(daten.grand); }]
    ]);

    reihe('Erfolge', [
      ['Alle freischalten', function () {
        ERFOLGE.forEach(function (e) { if (!P.erfolge[e.id]) P.erfolge[e.id] = new Date().toISOString(); });
        speichern(); alert('Alle Erfolge freigeschaltet (ohne Bonus-Chips).');
      }],
      ['Alle sperren', function () { P.erfolge = {}; speichern(); alert('Erfolge zurückgesetzt.'); }]
    ]);

    reihe('Glücksrad', [
      ['Wieder freigeben', function () { P.letztesRad = ''; speichern(); alert('Das Rad ist wieder bereit.'); }]
    ]);

    reihe('Spielstand', [
      ['Verlauf leeren', function () { P.verlauf = []; speichern(); alert('Verlauf geleert.'); }],
      ['Bestenliste leeren', function () { P.bestenliste = []; speichern(); alert('Bestenliste geleert.'); }],
      ['Spielstand kopieren', function () {
        var txt = JSON.stringify(daten);
        if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { alert('In die Zwischenablage kopiert.'); },
          function () { prompt('Spielstand:', txt); });
        else prompt('Spielstand:', txt);
      }]
    ]);

    var p = el('p');
    p.style.cssText = 'color:#bda68f;font-size:.78rem;margin-top:1.2rem;line-height:1.55';
    p.textContent = 'Passwort ändern: in glueckspalast.js die Zeile TRESOR_PASSWORT anpassen. ' +
      'Alle Chips sind Spielgeld ohne Geldwert.';
    inhalt.appendChild(p);

    modal('🔐 Tresor', inhalt, true);
  }

  /* ======================= Öffnen / Schließen ======================= */

  function oeffnen() {
    if (!root) bauWurzel();
    laden();
    root.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    if (!P) {
      kopfAktualisieren();
      ui.buehne.innerHTML = '';
      zeigeSpielerwahl();
    } else {
      kopfAktualisieren();
      zeigeLobby();
    }
  }

  function schliessen() {
    if (!root) return;
    clearInterval(leiterTimer);
    laeuftDreh = false;
    root.hidden = true;
    document.documentElement.style.overflow = '';
    speichern();
    chipsMelden(true);   // Endstand in die Online-Liste
  }

  /* ======================= Geheimer Zugang ======================= */

  function verdrahte() {
    var ziel = document.querySelector('.headrow h1') || document.querySelector('h1');
    if (!ziel) return;
    ziel.style.cursor = 'pointer';
    ziel.title = '';
    var klicks = 0, timer = null;
    ziel.addEventListener('click', function () {
      klicks++;
      clearTimeout(timer);
      timer = setTimeout(function () { klicks = 0; }, 1200);
      if (klicks >= 5) {
        klicks = 0;
        oeffnen();
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', verdrahte);
  else verdrahte();

  // Für Tests und den Notfall
  window.Gluckspalast = {
    oeffnen: oeffnen, schliessen: schliessen, SPIELE: SPIELE,
    werteLinien: werteLinien, dreheFeld: dreheFeld, zaehleScatter: zaehleScatter,
    expandiere: expandiere, muenzWert: muenzWert,
    online: GP_ONLINE   // zum Nachsehen und Testen in der Browser-Konsole
  };

})();
