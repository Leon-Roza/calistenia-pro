/* ============================================================
   illustrations.js â€” Personagens vetoriais realistas animados
   Figuras atlÃ©ticas com anatomia definida (peito, abdÃ´men,
   bÃ­ceps, quadrÃ­ceps) e animaÃ§Ã£o por rotaÃ§Ã£o de articulaÃ§Ãµes.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- paleta ---------- */
  var SKIN = "#e9ad81";
  var SKIN_D = "#d18c5c";
  var SKIN_DD = "#ba7446";
  var SKIN_HI = "#f7c99d";
  var HAIR = "#2e2730";
  var HAIR_D = "#1a151c";
  var SHORT = "#1e9e62";
  var SHORT_D = "#137a48";
  var SHORT_HI = "#4de08f";
  var SHOE = "#232a38";
  var SHOE_D = "#161c26";
  var LINE = "rgba(0,0,0,.16)";

  function n(x) { return Math.round(x * 10) / 10; }
  function q4(x1, y1, x2, y2, w1, w2, fill, dark) {
    var dx = x2 - x1, dy = y2 - y1, L = Math.sqrt(dx * dx + dy * dy) || 1;
    var px = -dy / L, py = dx / L;
    var h1 = w1 / 2, h2 = w2 / 2;
    return '<path d="M' + n(x1 + px * h1) + ' ' + n(y1 + py * h1) +
      " L" + n(x2 + px * h2) + " " + n(y2 + py * h2) +
      " L" + n(x2 - px * h2) + " " + n(y2 - py * h2) +
      " L" + n(x1 - px * h1) + " " + n(y1 - py * h1) +
      ' Z" fill="' + fill + '" stroke="' + (dark || LINE) + '" stroke-width="1" stroke-linejoin="round"/>';
  }
  function glint(x1, y1, x2, y2, w, color) {
    var cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
    var L = Math.hypot(x2 - x1, y2 - y1) || 1;
    var a = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    return '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(L / 2.05) + '" ry="' + n(w * 0.3) +
      '" fill="' + color + '" transform="rotate(' + n(a) + " " + n(cx) + " " + n(cy) + ')" opacity="0.55"/>';
  }
  function joint(x, y, r) {
    return '<circle cx="' + n(x) + '" cy="' + n(y) + '" r="' + r + '" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="1"/>';
  }
  function fist(x, y, dir) {
    var s = '<ellipse cx="' + n(x) + '" cy="' + n(y) + '" rx="6.2" ry="' + 7 + '" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="1"/>';
    s += '<path d="M' + n(x + 4 * dir) + " " + n(y - 2) + " a4 4 0 0 0 0 5" +
      '" fill="' + SKIN_D + '" stroke="none"/>';
    return s;
  }
  function shoe(x, y, dir, len) {
    var s = '<path d="M' + n(x) + " " + n(y) + " L" + n(x + dir * len) + " " + n(y - 6) +
      " Q" + n(x + dir * len) + " " + n(y - 14) + " " + n(x + dir * (len - 7)) + " " + n(y - 14) +
      " L" + n(x - 4) + " " + n(y - 12) + ' Z" fill="' + SHOE + '" stroke="' + SHOE_D + '" stroke-width="1.2"/>';
    s += '<path d="M' + n(x + dir * (len - 2)) + " " + n(y - 8) + " L" + n(x + dir * 2) + " " + n(y - 10.4) +
      '" stroke="' + SHORT_HI + '" stroke-width="2" stroke-linecap="round" opacity="0.8"/>';
    return s;
  }
  function hair(cx, cy, r, dir) {
    var s = '<path d="M' + n(cx - r * 0.9 * dir) + " " + n(cy - r * 0.5) +
      " C" + n(cx - r * 0.95 * dir) + " " + n(cy - r) + " " + n(cx - r * 0.3) + " " + n(cy - r * 1.05) +
      " " + n(cx + r * 0.5) + " " + n(cy - r * 0.7) +
      " C" + n(cx + r * 0.85 * dir) + " " + n(cy - r * 0.55) + " " + n(cx + r * 0.9 * dir) + " " + n(cy - r * 0.2) +
      " " + n(cx + r * 0.7 * dir) + " " + n(cy - r * 0.12) +
      " L" + n(cx + r * 0.35) + " " + n(cy - r * 0.3) +
      " C" + n(cx + r * 0.1) + " " + n(cy - r * 0.5) + " " + n(cx - r * 0.35) + " " + n(cy - r * 0.55) +
      " " + n(cx - r * 0.7) + " " + n(cy - r * 0.3) + ' Z" fill="' + HAIR + '"/>';
    s += '<path d="M' + n(cx - r * 0.5) + " " + n(cy - r * 0.85) +
      " C" + n(cx - r * 0.2) + " " + n(cy - r * 1.0) + " " + n(cx + r * 0.35) + " " + n(cy - r * 0.75) + " " + n(cx + r * 0.45) + " " + n(cy - r * 0.5) +
      '" stroke="' + HAIR_D + '" stroke-width="2" fill="none" stroke-linecap="round"/>';
    return s;
  }
  function face(cx, cy, r, dir) {
    var s = '<ellipse cx="' + n(cx + r * 0.55 * dir) + '" cy="' + n(cy - r * 0.28) + '" rx="2.1" ry="2.5" fill="#20222a"/>';
    s += '<path d="M' + n(cx + r * 0.5) + " " + n(cy + r * 0.55) +
      " Q" + n(cx + r * 0.95 * dir + r * 0.25) + " " + n(cy + r * 0.55) + " " + n(cx + r * 0.35) + " " + n(cy + r * 0.78) +
      '" stroke="' + SKIN_DD + '" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.7"/>';
    return s;
  }
  function head(cx, cy, r, dir) {
    var s = '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(r * 0.92) + '" ry="' + n(r) + '" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="1"/>';
    s += hair(cx, cy, r, dir);
    s += face(cx, cy, r, dir);
    s += '<circle cx="' + n(cx - r * 0.15 * dir) + '" cy="' + n(cy) + '" r="' + n(r * 0.26) + '" fill="' + SKIN_D + '" stroke="' + LINE + '" stroke-width="0.8"/>';
    return s;
  }
  function neck(a, b, c, d) {
    return q4(a, b, c, d, 13, 15, SKIN, LINE);
  }
  function torso(sx, sy, wx, wy, dir) {
    var fw = 11, bw = 8;
    var shF = sx + fw * dir, shB = sx - bw * dir;
    var waF = wx + 8 * dir, waB = wx - 6 * dir;
    var my = (sy + wy) / 2;
    var s = '<path d="M' + n(shF) + " " + n(sy) +
      " C" + n(shF - 1) + " " + n(my) + " " + n(waF + 1) + " " + n(my - 2) + " " + n(waF) + " " + n(wy) +
      " L" + n(waB) + " " + n(wy) +
      " C" + n(waB - 2) + " " + n(my + 2) + " " + n(shB + 1) + " " + n(my) + " " + n(shB) + " " + n(sy) +
      ' Z" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="1.2"/>';
    /* peitoral */
    s += '<path d="M' + n(shF - 2 * dir) + " " + n(sy + 6) +
      " Q" + n(sx + 5 * dir) + " " + n(sy + 13) + " " + n(waF - 2 * dir) + " " + n(wy - 4) +
      '" stroke="' + SKIN_DD + '" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.65"/>';
    /* abdÃ´men */
    for (var i = 0; i < 3; i++) {
      var ay = my + i * 6;
      s += '<path d="M' + n(wx + 4 * dir) + " " + n(ay - 3) + " L" + n(wx - 4 * dir) + " " + n(ay) +
        '" stroke="' + SKIN_DD + '" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="0.4"/>';
    }
    /* brilho do ombro */
    s += '<path d="M' + n(shF - 1) + " " + n(sy + 2) + " L" + n(shB + 1) + " " + n(sy + 2) +
      '" stroke="' + SKIN_HI + '" stroke-width="2" stroke-linecap="round" opacity="0.6"/>';
    return s;
  }
  function shorts(hx, hy, dir) {
    var s = '<path d="M' + n(hx + 9 * dir) + " " + n(hy) +
      " L" + n(hx - 7 * dir) + " " + n(hy) +
      " L" + n(hx - 11 * dir) + " " + n(hy + 17) +
      " Q" + n(hx) + " " + n(hy + 22) + " " + n(hx + 13 * dir) + " " + n(hy + 17) +
      ' Z" fill="' + SHORT + '" stroke="' + SHORT_D + '" stroke-width="1.2" stroke-linejoin="round"/>';
    s += '<path d="M' + n(hx + 11 * dir) + " " + n(hy + 2) + " L" + n(hx - 9 * dir) + " " + n(hy + 2) +
      '" stroke="' + SHORT_HI + '" stroke-width="3" stroke-linecap="round"/>';
    s += '<path d="M' + n(hx + 6 * dir) + " " + n(hy + 6) + " L" + n(hx - 4 * dir) + " " + n(hy + 6) + '" stroke="' + SHORT_D + '" stroke-width="1.4" stroke-linecap="round" opacity="0.55"/>';
    return s;
  }
  function shadow(cx, cy, rx, ry) {
    return '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + rx + '" ry="' + ry + '" fill="#000" opacity=".16"/>';
  }
  function ground(y, x1, x2) {
    return '<line class="soft" x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '" stroke-width="3" stroke-linecap="round"/>';
  }
  function gear(x1, y1, x2, y2, w) {
    return '<line class="soft" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke-width="' + w + '" stroke-linecap="round"/>';
  }

  function limpWrap(inner, cls) {
    return '<g class="jlimb" style="animation:' + cls + ' 2.2s ease-in-out infinite">' + inner + "</g>";
  }

  /* ============================================================
     FLEXÃƒO  â€” barra no chÃ£o, corpo reto, peito desce e sobe
     ============================================================ */
  function buildFlexao() {
    var s = '<svg viewBox="0 0 260 190" class="figure ex-flexao" role="img" aria-label="IlustraÃ§Ã£o animada de flexÃ£o de braÃ§o">';
    s += ground(160, 22, 240);
    s += shadow(150, 166, 96, 7);

    /* grupo corpo â€” articula nos dedos do pÃ© (221,156) */
    s += '<g class="anim" style="animation:fxBody 2.2s ease-in-out infinite;transform-origin:221px 156px">';
    s += head(82, 92, 13, -1);                       /* cabeÃ§a olhando para o chÃ£o */
    s += neck(98, 104, 108, 102);
    s += torso(108, 101, 158, 116, 1);
    s += shorts(158, 116, 1);
    /* pernas */
    s += q4(160, 118, 190, 136, 27, 19, SKIN, LINE);
    s += glint(162, 120, 188, 135, 21, SKIN_HI);
    s += q4(160, 118, 158, 118, 27, 19, SKIN_D, LINE);
    s += q4(190, 136, 216, 154, 17, 11, SKIN_DD, LINE);
    s += glint(194, 139, 214, 152, 14, SKIN_D);
    s += shoe(221, 156, 1, 17);
    s += '</g>';

    /* braÃ§o de apoio (perto) */
    s += '<g class="anim" style="animation:fxArm 2.2s ease-in-out infinite;transform-origin:108px 100px">' +
         q4(108, 100, 108, 128, 20, 15, SKIN, LINE) + glint(108, 104, 108, 124, 16, SKIN_HI) + joint(108, 100, 6) + "</g>";
    s += '<g class="anim" style="animation:fxFore 2.2s ease-in-out infinite;transform-origin:108px 128px">' +
         q4(108, 128, 104, 156, 12, 10, SKIN, LINE) + glint(108, 132, 105, 152, 9, SKIN_D) +
         "<g style=\"transform:rotate(0)\">" + fist(104, 156, 1) + "</g>" + "</g>";
    s += "</svg>";
    return s;
  }

  /* ============================================================
     BARRA AUSTRALIANA â€” corpo suspenso, puxa o peito Ã  barra
     ============================================================ */
  function buildAustraliana() {
    var s = '<svg viewBox="0 0 260 190" class="figure ex-australiana" role="img" aria-label="IlustraÃ§Ã£o animada de barra australiana">';
    s += ground(170, 20, 240);
    s += shadow(150, 174, 92, 6);
    /* estrutura */
    s += gear(78, 50, 74, 170, 7);
    s += gear(186, 50, 190, 170, 7);
    s += gear(64, 46, 200, 46, 9);

    /* braÃ§os segurando a barra (nÃ£o animam) */
    s += q4(112, 46, 112, 82, 13, 20, SKIN_D, LINE);
    s += q4(122, 46, 122, 82, 20, 13, SKIN, LINE);
    s += glint(112, 52, 112, 78, 16, SKIN_D);
    s += '<circle cx="110" cy="82" r="7" fill="' + SKIN_DD + '" stroke="' + LINE + '"/>';
    s += '<ellipse cx="108" cy="48" rx="4" ry="6" fill="' + SKIN + '" stroke="' + LINE + '" transform="rotate(-20 108 48)"/>';

    /* corpo â€” sobe em direÃ§Ã£o Ã  barra */
    s += '<g class="anim" style="animation:awBody 2.4s ease-in-out infinite">';
    s += head(88, 94, 13, 1);
    s += neck(102, 104, 112, 100);
    s += torso(112, 99, 162, 113, 1);
    s += shorts(162, 113, 1);
    s += q4(164, 114, 194, 134, 27, 19, SKIN, LINE);
    s += glint(166, 116, 192, 132, 21, SKIN_HI);
    s += q4(164, 114, 162, 116, 27, 19, SKIN_D, LINE);
    s += q4(194, 134, 220, 152, 17, 11, SKIN_DD, LINE);
    s += glint(198, 137, 218, 150, 14, SKIN_D);
    s += shoe(226, 156, 1, 17);
    s += '</g>';

    /* antebraÃ§os (dobram levemente no topo) */
    s += '<g class="anim" style="animation:awFore 2.4s ease-in-out infinite;transform-origin:118px 82px">' +
         q4(118, 82, 114, 60, 15, 12, SKIN, LINE) + fist(113, 58, 1) + "</g>";
    s += "</svg>";
    return s;
  }

  /* ============================================================
     PRANCHA â€” antebraÃ§os no chÃ£o, corpo alinhado (isomÃ©trica)
     ============================================================ */
  function buildPrancha() {
    var s = '<svg viewBox="0 0 260 190" class="figure ex-prancha" role="img" aria-label="IlustraÃ§Ã£o animada de prancha abdominal">';
    s += ground(160, 20, 240);
    s += shadow(150, 165, 92, 6);

    /* corpo gira suavemente em torno do cotovelo (94,152) */
    s += '<g class="anim" style="animation:pkBody 2.6s ease-in-out infinite;transform-origin:94px 152px">';
    s += head(74, 102, 13, -1);
    s += neck(90, 112, 98, 110);
    s += torso(98, 109, 152, 118, 1);
    s += shorts(152, 118, 1);
    s += q4(154, 119, 184, 136, 27, 19, SKIN, LINE);
    s += glint(156, 121, 182, 134, 21, SKIN_HI);
    s += q4(184, 136, 214, 154, 17, 12, SKIN_DD, LINE);
    s += glint(188, 139, 212, 152, 14, SKIN_D);
    s += shoe(222, 158, 1, 17);
    s += '</g>';

    /* braÃ§o de apoio */
    s += q4(98, 109, 94, 134, 20, 15, SKIN, LINE);
    s += glint(98, 112, 95, 130, 16, SKIN_HI);
    s += '<g class="anim" style="animation:pkFore 2.6s ease-in-out infinite;transform-origin:94px 134px">' +
         q4(94, 134, 72, 138, 13, 11, SKIN, LINE) + fist(68, 139, -1) + "</g>";
    s += "</svg>";
    return s;
  }

  /* ============================================================
     AGACHAMENTO â€” quadril desce, joelhos dobram
     ============================================================ */
  function buildAgachamento() {
    var s = '<svg viewBox="0 0 260 190" class="figure ex-agachamento" role="img" aria-label="IlustraÃ§Ã£o animada de agachamento">';
    s += ground(172, 20, 244);
    s += shadow(158, 178, 84, 7);

    /* pernas (raiz fixa) */
    /* coxa */
    s += '<g class="anim" style="animation:sqThigh 2.4s ease-in-out infinite;transform-origin:158px 96px">' +
         q4(158, 96, 148, 124, 26, 18, SKIN, LINE) + glint(154, 100, 150, 120, 22, SKIN_D) + joint(158, 96, 8) + "</g>";
    /* panturrilha (dentro da coxa, gira no joelho) */
    s += '<g class="anim" style="animation:sqCalf 2.4s ease-in-out infinite;transform-origin:148px 124px">' +
         q4(148, 124, 158, 152, 16, 11, SKIN_D, LINE) + glint(150, 130, 156, 148, 13, SKIN) +
         shoe(162, 160, 1, 21) + "</g>";

    /* tronco + perna de trÃ¡s */
    s += '<g class="anim" style="animation:sqBody 2.4s ease-in-out infinite">';
    s += q4(150, 118, 174, 148, 24, 17, SKIN_DD, LINE);
    s += glint(156, 126, 172, 146, 19, SKIN);
    s += '<g class="anim" style="animation:sqBackCalf 2.4s ease-in-out infinite;transform-origin:174px 148px">' +
         q4(174, 148, 184, 156, 14, 10, SKIN_D, LINE) + shoe(192, 162, 1, 19) + "</g>";
    s += '</g>';
    s += '<g class="anim" style="animation:sqBody 2.4s ease-in-out infinite">';
    s += shorts(150, 96, 1);
    s += torso(152, 52, 150, 96, 1);
    s += neck(152, 48, 152, 44);
    s += head(150, 28, 13, 1);
    /* braÃ§os estendidos */
    s += '<g class="anim" style="animation:sqArm 2.4s ease-in-out infinite;transform-origin:152px 52px">' +
         q4(152, 52, 184, 56, 17, 13, SKIN, LINE) + glint(156, 54, 180, 56, 14, SKIN_D) + "</g>";
    s += '<g class="anim" style="animation:sqArm 2.4s ease-in-out infinite;transform-origin:152px 52px">' +
         q4(188, 56, 196, 56, 12, 10, SKIN_D, LINE) + fist(200, 56, 1) + "</g>";
    s += '</g>';
    s += "</svg>";
    return s;
  }

  /* ============================================================
     FLEXÃƒO INCLINADA â€” mÃ£os no banco, corpo inclinado
     ============================================================ */
  function buildInclinada() {
    var s = '<svg viewBox="0 0 260 190" class="figure ex-inclinada" role="img" aria-label="IlustraÃ§Ã£o animada de flexÃ£o inclinada">';
    s += ground(160, 20, 240);
    s += shadow(150, 166, 88, 6);
    /* banco */
    s += '<rect x="36" y="96" width="34" height="64" rx="5" class="soft" fill="none" stroke-width="4"/>';
    s += '<line x1="38" y1="100" x2="68" y2="100" class="soft" stroke-width="3"/>';

    s += '<g class="anim" style="animation:inBody 2.2s ease-in-out infinite;transform-origin:222px 154px">';
    s += head(88, 92, 13, 1);
    s += neck(100, 103, 110, 102);
    s += torso(110, 101, 164, 116, 1);
    s += shorts(164, 116, 1);
    s += q4(166, 117, 196, 136, 27, 19, SKIN, LINE);
    s += glint(168, 119, 194, 134, 21, SKIN_HI);
    s += q4(196, 136, 218, 152, 17, 11, SKIN_DD, LINE);
    s += glint(200, 139, 216, 150, 14, SKIN_D);
    s += shoe(228, 158, 1, 17);
    s += '</g>';

    /* braÃ§o apoiado no banco */
    s += '<g class="anim" style="animation:inArm 2.2s ease-in-out infinite;transform-origin:110px 100px">' +
         q4(110, 100, 84, 92, 20, 15, SKIN, LINE) + glint(106, 100, 88, 94, 16, SKIN_D) + joint(110, 100, 6) + "</g>";
    s += '<g class="anim" style="animation:inFore 2.2s ease-in-out infinite;transform-origin:84px 92px">' +
         q4(84, 92, 58, 98, 13, 11, SKIN, LINE) + fist(54, 100, -1) + "</g>";
    s += "</svg>";
    return s;
  }

  /* ============================================================
     BARRA FIXA â€” eleva o queixo acima da barra
     ============================================================ */
  function buildFixa() {
    var s = '<svg viewBox="0 0 260 190" class="figure ex-fixa" role="img" aria-label="IlustraÃ§Ã£o animada de barra fixa">';
    s += '<line class="soft" x1="52" y1="46" x2="208" y2="46" stroke-width="9" stroke-linecap="round"/>';
    s += '<line class="soft" x1="56" y1="46" x2="56" y2="28" stroke-width="6" stroke-linecap="round"/>';
    s += '<line class="soft" x1="204" y1="46" x2="204" y2="28" stroke-width="6" stroke-linecap="round"/>';
    s += shadow(130, 182, 70, 7);

    /* braÃ§os */
    s += '<g class="anim" style="animation:fuArm 2.4s ease-in-out infinite;transform-origin:112px 46px">' +
         q4(112, 48, 112, 96, 20, 14, SKIN_D, LINE) + "</g>";
    s += '<g class="anim" style="animation:fuArm 2.4s ease-in-out infinite;transform-origin:148px 46px">' +
         q4(148, 48, 148, 96, 20, 14, SKIN, LINE) + "</g>";
    s += '<g class="anim" style="animation:fuFore 2.4s ease-in-out infinite;transform-origin:112px 96px">' +
         q4(112, 96, 108, 46, 14, 11, SKIN, LINE) + fist(110, 44, 1) + "</g>";
    s += '<g class="anim" style="animation:fuFore 2.4s ease-in-out infinite;transform-origin:148px 96px">' +
         q4(148, 96, 152, 46, 14, 11, SKIN, LINE) + fist(150, 44, 1) + "</g>";

    /* corpo */
    s += '<g class="anim" style="animation:fuBody 2.4s ease-in-out infinite">';
    s += head(130, 96, 13, 1);
    s += neck(130, 110, 130, 114);
    s += torso(130, 114, 130, 148, 1);
    s += shorts(130, 148, 1);
    s += q4(130, 150, 126, 170, 24, 16, SKIN, LINE);
    s += q4(125, 170, 122, 178, 14, 10, SKIN_D, LINE);
    s += q4(135, 170, 138, 178, 14, 10, SKIN_D, LINE);
    s += shoe(118, 178, -1, 16);
    s += shoe(142, 178, 1, 16);
    s += '</g>';
    s += "</svg>";
    return s;
  }

  /* ============================================================
     PRANCHA LATERAL â€” corpo de lado, braÃ§o livre para cima
     ============================================================ */
  function buildLateral() {
    var s = '<svg viewBox="0 0 260 190" class="figure ex-lateral" role="img" aria-label="IlustraÃ§Ã£o animada de prancha lateral">';
    s += ground(160, 20, 240);
    s += shadow(150, 166, 90, 6);

    s += '<g class="anim" style="animation:slBody 2.8s ease-in-out infinite;transform-origin:100px 148px">';
    s += head(86, 104, 13, 1);
    s += neck(100, 114, 106, 112);
    s += torso(106, 111, 154, 122, 1);
    s += shorts(154, 122, 1);
    s += q4(156, 123, 186, 140, 26, 18, SKIN, LINE);
    s += glint(158, 125, 184, 138, 20, SKIN_HI);
    s += q4(186, 140, 212, 154, 16, 11, SKIN_DD, LINE);
    s += glint(190, 143, 210, 152, 13, SKIN_D);
    s += shoe(220, 160, 1, 17);
    s += '</g>';

    /* braÃ§o de apoio */
    s += '<g class="anim" style="animation:slArm 2.8s ease-in-out infinite;transform-origin:106px 110px">' +
         q4(106, 111, 100, 136, 19, 14, SKIN, LINE) + glint(105, 114, 101, 132, 15, SKIN_HI) + joint(106, 111, 6) + "</g>";
    s += '<g class="anim" style="animation:slFore 2.8s ease-in-out infinite;transform-origin:100px 136px">' +
         q4(100, 136, 78, 140, 12, 10, SKIN, LINE) + fist(74, 141, -1) + "</g>";

    /* braÃ§o livre para cima */
    s += '<g class="anim" style="animation:slReach 2.8s ease-in-out infinite;transform-origin:106px 110px">' +
         q4(106, 110, 98, 84, 17, 13, SKIN, LINE) + "</g>";
    s += '<g class="anim" style="animation:slReach 2.8s ease-in-out infinite;transform-origin:98px 84px">' +
         q4(98, 84, 92, 70, 12, 10, SKIN_D, LINE) + fist(90, 66, -1) + "</g>";
    s += "</svg>";
    return s;
  }

  /* ============================================================
     AGACHAMENTO BÃšLGARO â€” pÃ© de trÃ¡s no banco, desce e sobe
     ============================================================ */
  function buildBulgaro() {
    var s = '<svg viewBox="0 0 260 190" class="figure ex-bulgaro" role="img" aria-label="IlustraÃ§Ã£o animada de agachamento bÃºlgaro">';
    s += ground(172, 20, 244);
    s += shadow(160, 178, 80, 6);
    s += '<rect x="176" y="112" width="50" height="60" rx="6" class="soft" fill="none" stroke-width="4"/>';

    /* perna de trÃ¡s no banco */
    s += q4(150, 100, 180, 128, 24, 16, SKIN_DD, LINE);
    s += glint(154, 104, 176, 124, 18, SKIN);
    s += '<g class="anim" style="animation:bgBackLeg 2.6s ease-in-out infinite;transform-origin:180px 128px">' +
         q4(180, 128, 200, 122, 14, 10, SKIN_D, LINE) + shoe(208, 118, 1, 18) + "</g>";

    /* perna da frente */
    s += '<g class="anim" style="animation:bgThigh 2.6s ease-in-out infinite;transform-origin:150px 100px">' +
         q4(150, 100, 126, 122, 26, 18, SKIN, LINE) + glint(146, 104, 130, 118, 20, SKIN_D) + joint(150, 100, 8) + "</g>";
    s += '<g class="anim" style="animation:bgCalf 2.6s ease-in-out infinite;transform-origin:126px 122px">' +
         q4(126, 122, 112, 150, 15, 10, SKIN_DD, LINE) + glint(122, 128, 114, 146, 11, SKIN) +
         shoe(108, 160, -1, 19) + "</g>";

    /* tronco + braÃ§os */
    s += '<g class="anim" style="animation:bgBody 2.6s ease-in-out infinite;">';
    s += shorts(146, 100, 1);
    s += torso(148, 58, 146, 100, 1);
    s += neck(148, 54, 148, 50);
    s += head(146, 34, 13, 1);
    s += '<g class="anim" style="animation:bgArm 2.6s ease-in-out infinite;transform-origin:148px 58px">' +
         q4(148, 58, 184, 62, 17, 13, SKIN, LINE) + glint(152, 60, 180, 62, 13, SKIN_D) + "</g>";
    s += '<g class="anim" style="animation:bgArm 2.6s ease-in-out infinite;transform-origin:148px 58px">' +
         q4(188, 63, 198, 64, 12, 10, SKIN_D, LINE) + fist(202, 64, 1) + "</g>";
    s += '</g>';
    s += "</svg>";
    return s;
  }

  var SVGS = {
    flexao: buildFlexao(),
    australiana: buildAustraliana(),
    prancha: buildPrancha(),
    agachamento: buildAgachamento(),
    inclinada: buildInclinada(),
    fixa: buildFixa(),
    lateral: buildLateral(),
    bulgaro: buildBulgaro()
  };

  /* ============================================================
     LOTTIE — animações .lottie (dotLottie) para os exercícios.
     Quando o player não está disponível ou o arquivo falha,
     o SVG animado abaixo continua servindo de fallback.
     ============================================================ */
  var LOTTIE = {
    flexao: "lottie/flexao.lottie",
    agachamento: "lottie/agachamento.lottie",
    prancha: "lottie/prancha.lottie",
    fixa: "lottie/fixa.lottie",
    lateral: "lottie/lateral.lottie",
    bulgaro: "lottie/bulgaro.lottie",
    inclinada: "lottie/inclinada.lottie"
  };

  function artMarkup(id) {
    var src = LOTTIE[id];
    var svg = SVGS[id] || "";
    if (!src) return svg;
    return '<div class="lottie-art">' +
      '<dotlottie-wc class="lottie-fig" src="' + src + '" autoplay loop></dotlottie-wc>' +
      (svg ? '<span class="lottie-art__svg">' + svg + "</span>" : "") +
      "</div>";
  }

  function buildHero() {
    var s = '<svg viewBox="0 0 260 220" class="figure" role="img" aria-label="IlustraÃ§Ã£o de atleta na barra fixa">';
    s += '<line class="soft" x1="42" y1="52" x2="218" y2="52" stroke-width="10" stroke-linecap="round"/>';
    s += '<line class="soft" x1="46" y1="52" x2="46" y2="22" stroke-width="6" stroke-linecap="round"/>';
    s += '<line class="soft" x1="214" y1="52" x2="214" y2="22" stroke-width="6" stroke-linecap="round"/>';
    s += '<ellipse cx="130" cy="206" rx="80" ry="9" fill="#000" opacity=".15"/>';

    s += '<g class="anim" style="animation:hArm 2.4s ease-in-out infinite;transform-origin:112px 52px">' +
         q4(112, 52, 112, 104, 22, 15, SKIN_D, LINE) + "</g>";
    s += '<g class="anim" style="animation:hArm 2.4s ease-in-out infinite;transform-origin:148px 52px">' +
         q4(148, 52, 148, 104, 22, 15, SKIN_D, LINE) + "</g>";
    s += '<g class="anim" style="animation:hFore 2.4s ease-in-out infinite;transform-origin:112px 104px">' +
         q4(112, 104, 108, 52, 15, 12, SKIN, LINE) + fist(110, 50, 1) + "</g>";
    s += '<g class="anim" style="animation:hFore 2.4s ease-in-out infinite;transform-origin:148px 104px">' +
         q4(148, 104, 152, 52, 15, 12, SKIN, LINE) + fist(150, 50, 1) + "</g>";

    s += '<g class="anim" style="animation:hBody 2.4s ease-in-out infinite">';
    s += head(130, 106, 15, 1);
    s += neck(130, 122, 130, 126);
    s += torso(130, 126, 130, 166, 1);
    s += shorts(130, 166, 1);
    s += q4(132, 168, 128, 190, 26, 17, SKIN, LINE);
    s += q4(127, 190, 124, 198, 15, 10, SKIN_D, LINE);
    s += q4(137, 190, 140, 198, 15, 10, SKIN_D, LINE);
    s += shoe(120, 200, -1, 18);
    s += shoe(144, 200, 1, 18);
    s += '</g>';
    s += "</svg>";
    return s;
  }

  window.Illustrations = {
    get: function (id) { return SVGS[id] || ""; },
    art: artMarkup,
    hasLottie: function (id) { return !!LOTTIE[id]; },
    hero: buildHero
  };
})();