(function () {
  "use strict";
  var V = window.VIDA || {}, C = window.CONTENIDO, E = window.VidaEngine;
  var FIN = V.finanzas || {}, LUG = V.lugares || {}, VID = V.vida || {};
  var M = { uf: (V.mercado && V.mercado.uf) || 41016, usd: (V.mercado && V.mercado.usd) || 946 };

  // ---------- utilidades ----------
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var nf = function (n, d) { return Number(n || 0).toLocaleString("es-CL", { maximumFractionDigits: d || 0, minimumFractionDigits: d || 0 }); };
  function clp(n) {
    var a = Math.abs(n);
    if (a >= 1e9) return "$" + nf(n / 1e6, 0) + " millones";
    if (a >= 1e6) return "$" + nf(n / 1e6, a >= 1e8 ? 0 : 1) + " millones";
    if (a >= 1e3) return "$" + nf(n / 1e3, 0) + " mil";
    return "$" + nf(n, 0);
  }
  function clpS(n) {
    var a = Math.abs(n);
    if (a >= 1e6) return "$" + nf(n / 1e6, a >= 1e8 ? 0 : 1) + " M";
    if (a >= 1e3) return "$" + nf(n / 1e3, 0) + " mil";
    return "$" + nf(n, 0);
  }
  function usd(n) { var a = Math.abs(n); return a >= 1e6 ? "USD " + nf(n / 1e6, 2) + " M" : a >= 1e3 ? "USD " + nf(n / 1e3, 0) + " mil" : "USD " + nf(n, 0); }
  var pct = function (x, d) { return nf(x * 100, d || 0) + " %"; };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) { /* sin almacenamiento */ } }
  };
  function svgEl(tag, a) { var el = document.createElementNS("http://www.w3.org/2000/svg", tag); for (var k in a) el.setAttribute(k, a[k]); return el; }
  function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function link(url, txt) { return url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(txt || "fuente") + "</a>" : ""; }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  var tip = $("#tip");
  function showTip(html, ev) {
    tip.innerHTML = html; tip.style.opacity = "1";
    var x = ev.clientX + 14, y = ev.clientY + 14, r = tip.getBoundingClientRect();
    if (x + r.width > window.innerWidth - 8) x = ev.clientX - r.width - 14;
    if (y + r.height > window.innerHeight - 8) y = ev.clientY - r.height - 14;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  function hideTip() { tip.style.opacity = "0"; }

  // ---------- tema ----------
  var root = document.documentElement, themeBtn = $("#themeBtn");
  function applyTheme(t) {
    if (t === "light" || t === "dark") root.setAttribute("data-theme", t); else root.removeAttribute("data-theme");
    themeBtn.textContent = t === "light" ? "Claro" : t === "dark" ? "Oscuro" : "Auto";
  }
  var theme = store.get("theme") || "auto"; applyTheme(theme);
  themeBtn.addEventListener("click", function () {
    theme = theme === "auto" ? "light" : theme === "light" ? "dark" : "auto";
    store.set("theme", theme); applyTheme(theme); drawCharts();
  });

  // ---------- perfil ----------
  var P, esEjemplo;
  function cargarPerfil() {
    var raw = store.get("vida-perfil");
    esEjemplo = !raw;
    var base = clone(C.perfilEjemplo);
    if (raw) { try { var o = JSON.parse(raw); for (var k in o) base[k] = o[k]; } catch (e) { esEjemplo = true; } }
    P = base;
  }
  function guardarPerfil() { store.set("vida-perfil", JSON.stringify(P)); esEjemplo = false; }
  cargarPerfil();

  // ---------- pestañas ----------
  var TABS = [
    ["resumen", "Resumen"], ["perfil", "Mi perfil"], ["dinero", "Dinero"], ["inversion", "Inversión"], ["patrimonio", "Patrimonio"],
    ["negocio", "Negocio y apps"], ["vivir", "Dónde vivir"], ["vacaciones", "Vacaciones"], ["alimentacion", "Alimentación"],
    ["salud", "Salud"], ["deporte", "Deporte"], ["estudios", "Estudios"], ["coaches", "Coaches"], ["anio", "Año a año"], ["prompt", "Prompt"]
  ];
  $("#tabs").innerHTML = TABS.map(function (t) {
    return '<button class="tab" role="tab" id="t-' + t[0] + '" aria-controls="p-' + t[0] + '" data-go="' + t[0] + '">' + t[1] + "</button>";
  }).join("");
  function irA(id, noScroll) {
    if (!TABS.some(function (t) { return t[0] === id; })) id = "resumen";
    $$(".panel").forEach(function (p) { p.hidden = p.dataset.tab !== id; });
    $$(".tab").forEach(function (b) { b.setAttribute("aria-selected", String(b.dataset.go === id)); });
    var tb = $("#t-" + id); if (tb && tb.scrollIntoView) tb.scrollIntoView({ block: "nearest", inline: "center" });
    try { if (location.hash.slice(1) !== id) history.replaceState(null, "", "#" + id); } catch (e) { /* visor sin historial */ }
    if (!noScroll) window.scrollTo(0, 0);
    drawCharts();
  }
  $("#tabs").addEventListener("click", function (e) { var b = e.target.closest("[data-go]"); if (b) irA(b.dataset.go); });
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (a && a.getAttribute("href").length > 1) { var id = a.getAttribute("href").slice(1); if (TABS.some(function (t) { return t[0] === id; })) { e.preventDefault(); irA(id); } }
  });
  window.addEventListener("hashchange", function () { irA(location.hash.slice(1)); });

  // Escenario global
  function marcarEscenario() { $$("#scenSeg button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.esc === P.escenario)); }); }
  $("#scenSeg").addEventListener("click", function (e) {
    var b = e.target.closest("[data-esc]"); if (!b) return;
    P.escenario = b.dataset.esc; if (!esEjemplo) guardarPerfil(); recalcular();
  });

  // ---------- cálculo ----------
  var SIM, SIMS;
  function calcular() {
    SIM = E.simular(P, M);
    SIMS = {};
    ["conservador", "base", "optimista"].forEach(function (e) { var q = clone(P); q.escenario = e; SIMS[e] = E.simular(q, M); });
  }
  function fila(anio) { return SIM.filas.filter(function (f) { return f.anio === anio; })[0]; }
  var HOY = function () { return SIM.filas[0]; };

  // ---------- componentes ----------
  function kpi(label, value, note) { return '<div class="card kpi"><div class="stat-label">' + label + '</div><div class="stat-value num">' + value + '</div><div class="stat-note">' + (note || "") + "</div></div>"; }
  function head(eyebrow, title, lead) { return '<div class="section-head"><div class="eyebrow">' + eyebrow + "</div><h2>" + title + "</h2>" + (lead ? '<p class="lead">' + lead + "</p>" : "") + "</div>"; }
  function barRow(label, value, max, txt, color) {
    return '<div class="bar-row"><span>' + label + '</span><div class="bar-track"><div class="bar-fill" style="width:' + Math.max(1.5, Math.min(100, value / (max || 1) * 100)) + "%;" + (color ? "background:var(" + color + ")" : "") + '"></div></div><span class="bar-val">' + txt + "</span></div>";
  }
  function legend(items) { return '<div class="legend">' + items.map(function (i) { return '<span><i style="background:var(' + i[1] + ")" + (i[2] ? ";height:2px;border-radius:0" : "") + '"></i>' + i[0] + "</span>"; }).join("") + "</div>"; }
  function srcList(list) { return arr(list).length ? '<p class="src">Fuentes: ' + arr(list).map(function (f) { return link(f.url, f.txt); }).join(" · ") + "</p>" : ""; }
  function dots(n, max) { var s = ""; for (var i = 1; i <= (max || 5); i++) s += '<span class="dot" style="background:' + (i <= n ? "var(--accent)" : "var(--grid)") + '"></span>'; return '<span class="score-dots" aria-label="' + n + " de " + (max || 5) + '">' + s + "</span>"; }

  // Columnas apiladas con línea opcional (un solo eje).
  function stackedColumns(box, labels, series, line, fmt) {
    box.innerHTML = "";
    var W = Math.max(300, box.clientWidth), H = 280, L = 62, R = 10, T = 12, B = 26;
    var totals = labels.map(function (_, i) { return series.reduce(function (a, s) { return a + Math.max(0, s.values[i]); }, 0); });
    var maxY = Math.max.apply(null, totals.concat(line ? line.values : [])) * 1.08 || 1;
    var n = labels.length, band = (W - L - R) / n, bw = Math.min(24, band * 0.7);
    var sy = function (v) { return T + (1 - v / maxY) * (H - T - B); };
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H });
    var step = niceStep(maxY / 4);
    for (var g = 0; g <= maxY; g += step) {
      svg.appendChild(svgEl("line", { x1: L, x2: W - R, y1: sy(g), y2: sy(g), class: "gridline", "stroke-width": 1 }));
      var gt = svgEl("text", { x: L - 8, y: sy(g) + 4, "text-anchor": "end", class: "num" }); gt.textContent = fmt(g); svg.appendChild(gt);
    }
    var every = Math.ceil(n / Math.max(1, Math.floor((W - L) / 44)));
    labels.forEach(function (lab, i) {
      var x = L + band * i + (band - bw) / 2, y0 = sy(0);
      series.forEach(function (s) {
        var v = Math.max(0, s.values[i]); if (v <= 0) return;
        var h = y0 - sy(v); if (h < 0.5) return;
        svg.appendChild(svgEl("rect", { x: x, y: y0 - h, width: bw, height: Math.max(0.5, h - 2 > 0.5 ? h - 2 : h), fill: cssVar(s.color), rx: 0 }));
        y0 -= h;
      });
      if (i % every === 0) { var t = svgEl("text", { x: x + bw / 2, y: H - 8, "text-anchor": "middle", class: "num" }); t.textContent = lab; svg.appendChild(t); }
      var hit = svgEl("rect", { x: L + band * i, y: T, width: band, height: H - T - B, fill: "transparent" });
      hit.addEventListener("mousemove", function (ev) {
        var h = "<b>" + lab + "</b>" + series.map(function (s) { return "<div class='row'><span>" + s.name + "</span><span>" + fmt(s.values[i]) + "</span></div>"; }).join("");
        h += "<div class='row'><span>Total</span><span>" + fmt(totals[i]) + "</span></div>";
        if (line) h += "<div class='row'><span>" + line.name + "</span><span>" + fmt(line.values[i]) + "</span></div>";
        showTip(h, ev);
      });
      hit.addEventListener("mouseleave", hideTip);
      svg.appendChild(hit);
    });
    svg.appendChild(svgEl("line", { x1: L, x2: W - R, y1: sy(0), y2: sy(0), class: "axis", "stroke-width": 1 }));
    if (line) {
      var d = line.values.map(function (v, i) { return (i ? "L" : "M") + (L + band * i + band / 2).toFixed(1) + "," + sy(v).toFixed(1); }).join("");
      svg.appendChild(svgEl("path", { d: d, fill: "none", stroke: cssVar(line.color), "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round", "pointer-events": "none" }));
    }
    box.appendChild(svg);
  }
  function niceStep(raw) { var p = Math.pow(10, Math.floor(Math.log10(raw || 1))), n = raw / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; }

  // ---------- RESUMEN ----------
  function renderResumen() {
    var h = HOY(), f1 = fila(2027) || h;
    var libre = SIM.anioLibertad;
    var colchonMeses = h.liquidez / P.gastoMensual;
    var html = head("Tu plan en una pantalla", "Hola, " + esc(P.nombre || "") + ". Así se ve tu camino a la libertad financiera",
      "Escenario <b>" + P.escenario + "</b>. Cambia de escenario arriba o edita tus datos en <a href=\"#perfil\">Mi perfil</a>: todo se recalcula al instante.");
    html += '<div class="kpis six">' +
      kpi("Patrimonio total hoy", clpS(h.total), "≈ " + usd(h.total / M.usd)) +
      kpi("Tu número de libertad", clpS(SIM.meta), "gasto " + clpS(Math.max(P.gastoLibertad, P.gastoMensual)) + "/mes ÷ " + nf(P.swr, 1) + " %") +
      kpi("Año de libertad", libre ? String(libre) : "después de " + SIM.filas[SIM.filas.length - 1].anio, libre ? "a los " + (P.edad + libre - E.ANIO_BASE) + " años" : "sube ingreso o ahorro") +
      kpi("Tasa de ahorro hoy", pct(h.tasaAhorro), "meta " + pct(P.tasaAhorroMeta)) +
      kpi("Colchón de emergencia", nf(colchonMeses, 1) + " meses", "meta " + SIM.mesesColchon + " meses") +
      kpi("Ahorro 2027", clpS(f1.ahorro), clpS(f1.ahorro / 12) + " al mes") + "</div>";

    html += '<div class="card" style="margin-top:16px"><h3>Patrimonio proyectado por tipo de activo</h3><p class="small ink2" style="margin:4px 0 10px">En pesos de hoy. La línea es tu número de libertad, que sube si tu gasto sube.</p>' +
      legend([["Acciones globales", "--s1"], ["Renta fija UF", "--s2"], ["Liquidez y pie", "--s3"], ["Vivienda neta", "--s4"], ["Previsión", "--s5"], ["Meta de libertad", "--ink", true]]) +
      '<div class="chart" id="chPat" role="img" aria-label="Patrimonio proyectado"></div></div>';

    html += '<div class="two" style="margin-top:16px"><div class="card"><h3>Los tres escenarios</h3><div style="margin-top:8px">' +
      ["conservador", "base", "optimista"].map(function (e) {
        var s = SIMS[e], y = s.anioLibertad;
        return '<div class="kpi-line"><span>' + e.charAt(0).toUpperCase() + e.slice(1) + "</span><span>" + (y ? y + " · " + (P.edad + y - E.ANIO_BASE) + " años" : "más de " + (s.filas.length - 1) + " años") + "</span></div>";
      }).join("") + '</div><p class="small ink2" style="margin-top:10px">Conservador: tu ingreso crece 5 % real al año. Base: cumples el plan de foco (ingreso recurrente de tus productos). Optimista: el negocio escala más rápido.</p></div>' +
      '<div class="card"><h3>Rueda de la vida</h3><p class="small ink2" style="margin:4px 0 6px">Tu autoevaluación (1 a 10). Meta: 8 en todo.</p>' +
      C.areasRueda.map(function (a) { var v = (P.rueda || {})[a[0]] || 5; return barRow(a[1], v, 10, v + "/10", v < 5 ? "--s2" : "--accent"); }).join("") + "</div></div>";

    var acciones = [
      ["Negocio", C.apps[0].siguiente], ["Patrimonio", C.coaches[0].acciones[0]], ["Oportunidades", C.coaches[2].acciones[0]],
      ["Salud", C.coaches[5].acciones[0]], ["Deporte", C.coaches[6].acciones[2]], ["Vida", C.coaches[8].acciones[0]]
    ];
    var opp = proximasOportunidades(4);
    html += '<div class="two" style="margin-top:16px"><div class="card"><h3>Próximos 90 días</h3><div class="steps" style="margin-top:10px">' +
      acciones.map(function (a) { return '<div class="step"><div><b>' + a[0] + "</b><p>" + esc(a[1]) + "</p></div></div>"; }).join("") + "</div></div>" +
      '<div class="card"><h3>Oportunidades que se vienen</h3>' + (opp.length ? opp.map(oppHtml).join("") : '<p class="small ink2">Revisa la pestaña <a href="#coaches">Coaches</a>.</p>') + "</div></div>";
    $("#p-resumen").innerHTML = html;
  }

  // ---------- PERFIL ----------
  function fld(id, label, val, type, hint, attrs) {
    return '<div class="fld"><label for="f-' + id + '">' + label + '</label><input id="f-' + id + '" data-k="' + id + '" type="' + (type || "number") + '" value="' + esc(val) + '" ' + (attrs || "") + ">" + (hint ? '<span class="hint">' + hint + "</span>" : "") + "</div>";
  }
  function sel(id, label, val, opts) {
    return '<div class="fld"><label for="f-' + id + '">' + label + '</label><select id="f-' + id + '" data-k="' + id + '">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (String(val) === String(o[0]) ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select></div>";
  }
  function renderPerfil() {
    var v = P.vivienda || {};
    var html = head("Mi perfil", "Tus datos, tu plan", "Todo se guarda solo en este navegador. " + (esEjemplo ? "<b>Ahora ves valores de ejemplo</b>: reemplázalos por los tuyos." : "Estás usando tus datos."));
    html += '<div class="card"><fieldset class="fieldset"><legend>Persona</legend><div class="form-grid">' +
      fld("nombre", "Nombre", P.nombre, "text") + fld("edad", "Edad", P.edad, "number", "", 'min="18" max="80"') +
      fld("ciudad", "Ciudad actual", P.ciudad, "text") +
      sel("hogar", "Hogar", P.hogar, [["solo", "Solo"], ["pareja", "En pareja"], ["familia", "Familia con hijos"]]) +
      fld("peso", "Peso (kg)", P.peso, "number", "Para calcular tu proteína diaria") + "</div></fieldset></div>";
    html += '<div class="card" style="margin-top:16px"><fieldset class="fieldset"><legend>Ingresos y gastos (CLP al mes)</legend><div class="form-grid">' +
      fld("ingresoNeto", "Ingreso neto mensual", P.ingresoNeto, "number", "Lo que llega a tu cuenta, después de impuestos") +
      fld("gastoMensual", "Gasto mensual total", P.gastoMensual, "number", "Incluye arriendo o dividendo") +
      fld("arriendo", "Arriendo actual", P.arriendo, "number", "0 si ya tienes vivienda propia") +
      '<div class="fld"><label class="check"><input type="checkbox" id="f-ingresoVariable" data-k="ingresoVariable"' + (P.ingresoVariable ? " checked" : "") + "> Mi ingreso es variable (emprendedor o boletas)</label><span class=\"hint\">Sube el colchón recomendado de 6 a 12 meses</span></div></div></fieldset></div>";
    html += '<div class="card" style="margin-top:16px"><fieldset class="fieldset"><legend>Patrimonio hoy (CLP)</legend><div class="form-grid">' +
      fld("liquidez", "Liquidez (cuentas, depósitos, money market)", P.liquidez) +
      fld("inversiones", "Inversiones (fondos, ETF, APV)", P.inversiones) +
      fld("prevision", "Saldo AFP", P.prevision) +
      fld("inmobiliario", "Vivienda propia (valor)", P.inmobiliario, "number", "0 si no tienes") +
      fld("deudaCara", "Deuda cara (tarjetas, consumo)", P.deudaCara) + "</div></fieldset></div>";
    html += '<div class="card" style="margin-top:16px"><fieldset class="fieldset"><legend>Metas y estilo de inversión</legend><div class="form-grid">' +
      fld("gastoLibertad", "Gasto mensual deseado en libertad", P.gastoLibertad) +
      fld("techoGasto", "Techo de gasto mensual (estilo de vida)", P.techoGasto, "number", "El gasto puede subir con tu ingreso hasta aquí") +
      fld("tasaAhorroMetaPct", "Tasa de ahorro meta (%)", Math.round(P.tasaAhorroMeta * 100), "number", "", 'min="10" max="80"') +
      fld("swr", "Tasa de retiro segura (%)", P.swr, "number", "3,5 conservadora · 4 estándar", 'step="0.25" min="2.5" max="5"') +
      sel("riesgo", "Tolerancia al riesgo", P.riesgo, [["baja", "Baja"], ["media", "Media"], ["alta", "Alta"]]) +
      sel("escenario", "Escenario de ingresos", P.escenario, [["conservador", "Conservador"], ["base", "Base (plan de foco)"], ["optimista", "Optimista"]]) +
      sel("mercado", "Escenario de mercado", P.mercado, [["conservador", "Conservador"], ["base", "Base"], ["optimista", "Optimista"]]) + "</div></fieldset></div>";
    html += '<div class="card" style="margin-top:16px"><fieldset class="fieldset"><legend>Vivienda</legend><div class="form-grid">' +
      '<div class="fld"><label class="check"><input type="checkbox" id="f-v-comprar" data-v="comprar"' + (v.comprar ? " checked" : "") + "> Quiero comprar vivienda</label></div>" +
      fld("v-anio", "Año de compra", v.anio, "number", "", 'data-v="anio" min="2026" max="2060"') +
      fld("v-precioUF", "Precio (UF)", v.precioUF, "number", "≈ " + clpS((v.precioUF || 0) * M.uf), 'data-v="precioUF"') +
      fld("v-pie", "Pie (%)", v.pie, "number", "", 'data-v="pie"') +
      fld("v-tasa", "Tasa hipotecaria (UF + %)", v.tasa, "number", "", 'data-v="tasa" step="0.1"') +
      fld("v-plazo", "Plazo (años)", v.plazo, "number", "", 'data-v="plazo"') + "</div></fieldset></div>";
    html += '<div class="card" style="margin-top:16px"><fieldset class="fieldset"><legend>Rueda de la vida (1 a 10)</legend><div class="form-grid">' +
      C.areasRueda.map(function (a) { return fld("r-" + a[0], a[1], (P.rueda || {})[a[0]] || 5, "number", "", 'data-r="' + a[0] + '" min="1" max="10"'); }).join("") + "</div></fieldset></div>";
    html += '<div class="toolbar" style="margin-top:16px"><button class="btn ghost" type="button" id="resetPerfil">Volver al perfil de ejemplo</button></div>';
    $("#p-perfil").innerHTML = html;

  }

  // ---------- DINERO ----------
  function renderDinero() {
    var h = HOY(), f1 = fila(2027) || h;
    var viv = P.arriendo, resto = Math.max(0, P.gastoMensual - viv);
    var totPeso = C.presupuesto.reduce(function (a, c) { return a + c.peso; }, 0);
    var filas = [{ nombre: "Vivienda (arriendo o dividendo)", monto: viv }].concat(C.presupuesto.map(function (c) { return { nombre: c.nombre, monto: resto * c.peso / totPeso, tab: c.tab }; }));
    var ahorroMes = P.ingresoNeto - P.gastoMensual;
    var html = head("Dinero", "Presupuesto mensual y orden del ahorro", "Con tu ingreso de <b>" + clp(P.ingresoNeto) + "</b> y gasto de <b>" + clp(P.gastoMensual) + "</b>, hoy ahorras <b>" + clp(ahorroMes) + " al mes</b> (" + pct(h.tasaAhorro) + ").");
    html += '<div class="kpis">' + kpi("Ingreso neto", clpS(P.ingresoNeto), "al mes") + kpi("Gasto", clpS(P.gastoMensual), pct(P.gastoMensual / P.ingresoNeto) + " del ingreso") +
      kpi("Ahorro", clpS(ahorroMes), pct(h.tasaAhorro) + " · meta " + pct(P.tasaAhorroMeta)) +
      kpi("Colchón", nf(h.liquidez / P.gastoMensual, 1) + " / " + SIM.mesesColchon + " meses", clpS(SIM.mesesColchon * P.gastoMensual) + " objetivo") + "</div>";
    var mx = Math.max.apply(null, filas.map(function (f) { return f.monto; }));
    html += '<div class="two" style="margin-top:16px"><div class="card"><h3>Presupuesto sugerido por categoría</h3><p class="small ink2" style="margin:4px 0 8px">Reparte tu gasto actual. Ajusta la vivienda en Mi perfil.</p>' +
      filas.map(function (f) { return barRow(f.tab ? '<a href="#' + f.tab + '">' + esc(f.nombre) + "</a>" : esc(f.nombre), f.monto, mx, clpS(f.monto)); }).join("") + "</div>";
    var fl = f1.flujos || {};
    var dest = [["Colchón", fl.colchon], ["Deuda cara", fl.deuda], ["Pie de vivienda", fl.vivienda], ["Cartera de largo plazo (incluye APV)", fl.cartera]];
    var mx2 = Math.max.apply(null, dest.map(function (d) { return d[1] || 0; })) || 1;
    html += '<div class="card"><h3>Dónde va tu ahorro en 2027</h3><p class="small ink2" style="margin:4px 0 8px">Ahorro del año: <b>' + clp(f1.ahorro) + "</b> (" + pct(f1.tasaAhorro) + ").</p>" +
      dest.map(function (d) { return barRow(d[0], d[1] || 0, mx2, clpS(d[1] || 0)); }).join("") +
      '<p class="small ink2" style="margin-top:8px">APV sugerido dentro de la cartera: <b>' + clpS(f1.apv) + "</b> al año.</p></div></div>";
    html += '<h3 class="h-sub">El orden del dinero</h3><div class="card"><div class="steps">' + C.ordenDinero.map(function (s) { return '<div class="step"><div><b>' + s.t + "</b><p>" + s.d + "</p></div></div>"; }).join("") + "</div></div>";
    html += '<h3 class="h-sub">Automatízalo: 5 cuentas</h3><div class="grid g3">' + C.cuentas.map(function (c) { return '<div class="card"><h3>' + c.n + '</h3><p class="small ink2" style="margin-top:6px">' + c.d + "</p></div>"; }).join("") + "</div>";
    var reglas = arr(FIN.reglas);
    if (reglas.length) html += '<h3 class="h-sub">Reglas de referencia</h3><div class="grid g2">' + reglas.map(function (r) { return '<div class="card"><h3>' + esc(r.regla) + '</h3><p class="small ink2" style="margin-top:6px">' + esc(r.detalle) + '</p><p class="src" style="margin-top:6px">' + link(r.fuente) + "</p></div>"; }).join("") + "</div>";
    $("#p-dinero").innerHTML = html;
  }

  // ---------- INVERSIÓN ----------
  function renderInversion() {
    var pa = E.pctAcciones(P.edad, P.riesgo);
    var html = head("Inversión", "Dónde invertir cada peso", "Tu cartera de largo plazo hoy: <b>" + pct(pa) + " acciones globales</b> y <b>" + pct(1 - pa) + " renta fija en UF</b> (edad " + P.edad + ", riesgo " + P.riesgo + "). Cada año baja un punto la parte en acciones.");
    var cats = [["liquidez", "1 · Liquidez y colchón"], ["corto_plazo", "2 · Corto plazo y metas (pie, vacaciones)"], ["previsional", "3 · Previsión y APV"], ["largo_plazo", "4 · Largo plazo (el núcleo)"], ["inmobiliario", "5 · Inmobiliario"], ["negocio", "6 · Tu negocio"]];
    var ins = arr(FIN.instrumentos);
    html += '<div class="grid g2">' + cats.map(function (c) {
      var items = ins.filter(function (i) { return i.categoria === c[0]; });
      if (!items.length) return "";
      return '<div class="card"><h3>' + c[1] + "</h3>" + items.map(function (i) {
        return '<div class="opp"><b>' + esc(i.nombre) + '</b> <span class="tag">' + esc(i.riesgo || "") + '</span><div class="ink2">' + esc(i.para_que || "") + '</div><div class="xs muted" style="margin-top:3px">Rentabilidad real esperada: ' + esc(i.rent_real_esperada || "—") + " · Costo: " + esc(i.costo || "—") + " · Liquidez: " + esc(i.liquidez || "—") + "</div>" +
          (i.donde ? '<div class="xs muted">Dónde: ' + esc(i.donde) + "</div>" : "") + (i.fuente ? '<div class="src">' + link(i.fuente) + "</div>" : "") + "</div>";
      }).join("") + "</div>";
    }).join("") + "</div>";
    html += '<div class="card" style="margin-top:16px"><h3>Asignación por edad (glide path)</h3><p class="small ink2" style="margin:4px 0 10px">Porcentaje de la cartera de largo plazo. Se rebalancea una vez al año.</p>' +
      legend([["Acciones globales", "--s1"], ["Renta fija UF", "--s2"]]) + '<div class="chart" id="chGlide" role="img" aria-label="Asignación por edad"></div></div>';
    var escn = FIN.escenarios_rentabilidad;
    if (escn) {
      html += '<h3 class="h-sub">Rentabilidades reales esperadas (sobre la inflación)</h3><div class="table-wrap"><table><thead><tr><th>Escenario</th>' +
        Object.keys(escn.base || {}).filter(function (k) { return k !== "fuente" && k !== "nota"; }).map(function (k) { return "<th>" + esc(k.replace(/_/g, " ")) + "</th>"; }).join("") + "</tr></thead><tbody>" +
        ["conservador", "base", "optimista"].map(function (e) { var o = escn[e] || {}; return "<tr><td><b>" + e + "</b></td>" + Object.keys(escn.base || {}).filter(function (k) { return k !== "fuente" && k !== "nota"; }).map(function (k) { return "<td>" + esc(o[k]) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
    }
    html += '<div class="two" style="margin-top:16px"><div class="card"><h3>Impuestos y previsión que te tocan</h3>' +
      arr(FIN.impuestos).concat(arr(FIN.pensiones)).map(function (t) { return '<div class="opp"><b>' + esc(t.tema) + '</b><div class="ink2">' + esc(t.detalle) + '</div><div class="src">' + link(t.fuente) + "</div></div>"; }).join("") + "</div>" +
      '<div class="card"><h3>Qué evitar</h3><ul class="list">' + C.evitar.map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("") + "</ul></div></div>";
    html += srcList(FIN.fuentes);
    $("#p-inversion").innerHTML = html;
  }

  // ---------- PATRIMONIO ----------
  function renderPatrimonio() {
    var filas = SIM.filas;
    var html = head("Patrimonio", "Año a año hasta la libertad", "Número de libertad hoy: <b>" + clp(SIM.meta) + "</b> (≈ " + usd(SIM.meta / M.usd) + ", " + nf(SIM.meta / M.uf) + " UF)." +
      (P.vivienda && P.vivienda.comprar ? " Vivienda en " + P.vivienda.anio + ": pie + gastos " + clpS(SIM.costoEntrada) + ", dividendo " + clpS(SIM.dividendoMensual) + "/mes." : ""));
    var hitos = Object.keys(SIM.hitos).map(function (k) { return [SIM.hitos[k], k]; }).sort(function (a, b) { return a[0] - b[0]; });
    var nombres = { colchon: "Colchón completo", sinDeuda: "Cero deuda cara", "100musd": "USD 100 mil", "250musd": "USD 250 mil", vivienda: "Vivienda propia", mitad: "Mitad del camino", "1musd": "USD 1 millón", libertad: "Libertad financiera" };
    html += '<div class="row-gap" style="margin-bottom:14px">' + hitos.map(function (h) { return '<span class="tag acc">' + h[0] + " · " + nombres[h[1]] + "</span>"; }).join("") + "</div>";
    html += '<div class="card"><h3>Patrimonio financiero vs tu número</h3>' + legend([["Patrimonio financiero", "--s1"], ["Meta de libertad", "--s2", true]]) + '<div class="chart" id="chFin" role="img" aria-label="Patrimonio financiero y meta"></div></div>';
    html += '<div class="table-wrap" style="margin-top:16px"><table><thead><tr><th>Año</th><th class="r">Edad</th><th class="r">Ingreso/mes</th><th class="r">Gasto/mes</th><th class="r">Ahorro</th><th class="r">Financiero</th><th class="r">Vivienda neta</th><th class="r">Previsión</th><th class="r">Total</th><th class="r">% meta</th><th>Hitos</th></tr></thead><tbody>' +
      filas.map(function (f) {
        return "<tr" + (f.anio === SIM.anioLibertad ? ' style="background:var(--accent-wash)"' : "") + "><td><b>" + f.anio + '</b></td><td class="r">' + f.edad + '</td><td class="r">' + clpS(f.ingresoAnual / 12) + '</td><td class="r">' + clpS(f.gastoAnual / 12) +
          '</td><td class="r">' + pct(f.tasaAhorro) + '</td><td class="r">' + clpS(f.financiero) + '</td><td class="r">' + clpS(f.inmobiliario) + '</td><td class="r">' + clpS(f.prevision) + '</td><td class="r"><b>' + clpS(f.total) + '</b></td><td class="r">' + pct(f.pctMeta) + "</td><td class='xs'>" + f.hitos.map(esc).join("<br>") + "</td></tr>";
      }).join("") + "</tbody></table></div><p class=\"tbl-note\">Supuestos: rentabilidades reales del escenario de mercado " + P.mercado + "; gasto que sube con tu ingreso hasta el techo de " + clpS(P.techoGasto) + "/mes; financiero = liquidez + renta fija + acciones (sin vivienda, previsión ni negocio).</p>";
    $("#p-patrimonio").innerHTML = html;
  }

  // ---------- NEGOCIO ----------
  function renderNegocio() {
    var dec = { vender: ["Vender ahora", "pill-good"], siguiente: ["Siguiente", "pill-warn"], congelar: ["Congelar", "pill-crit"] };
    var html = head("Negocio y apps", "Qué aplicaciones construir, vender o congelar", "Basado en la radiografía de tus 100 repositorios. Regla: ninguna idea nueva hasta cumplir la meta de ingreso recurrente del trimestre.");
    html += '<div class="card"><h3>Ingreso recurrente mensual esperado por línea (CLP)</h3>' + legend([["Back-office fondos", "--s1"], ["FibraZero", "--s2"], ["Consultoría", "--s3"], ["Otras apps", "--s4"]]) + '<div class="chart" id="chMrr" role="img" aria-label="Ingreso recurrente por línea"></div></div>';
    html += '<div class="grid g2" style="margin-top:16px">' + C.apps.map(function (a) {
      var d = dec[a.decision];
      return '<div class="card"><div style="display:flex;justify-content:space-between;gap:10px;align-items:start"><h3>' + esc(a.nombre) + '</h3><span class="' + d[1] + '">' + d[0] + '</span></div>' +
        '<p class="small ink2" style="margin-top:6px">' + esc(a.base) + "</p>" +
        '<div class="kv"><div class="k">Cliente</div><div class="v">' + esc(a.cliente) + '</div></div><div class="kv"><div class="k">Modelo</div><div class="v">' + esc(a.modelo) + "</div></div>" +
        '<div class="kv"><div class="k">Inicio · MRR a 12 meses</div><div class="v"><b>' + esc(a.inicio) + " · " + clpS(a.mrr[2]) + "/mes</b></div></div>" +
        '<div class="small" style="margin-top:8px;display:grid;grid-template-columns:auto auto;gap:4px 12px;justify-content:start">' +
        [["Mercado", a.puntajes.mercado], ["Ventaja propia", a.puntajes.ventaja], ["Facilidad", a.puntajes.esfuerzo], ["Rapidez al primer peso", a.puntajes.tiempo]].map(function (p) { return "<span class='ink2'>" + p[0] + "</span>" + dots(p[1]); }).join("") + "</div>" +
        '<div class="callout" style="margin-top:12px;font-size:.88rem"><b>Siguiente paso:</b> ' + esc(a.siguiente) + "</div></div>";
    }).join("") + "</div>";
    $("#p-negocio").innerHTML = html;
  }

  // ---------- DÓNDE VIVIR ----------
  var PESOS = { costo: 3, seguridad: 3, naturaleza: 2, clientes: 3, internet: 1 };
  try { var pw = JSON.parse(store.get("vida-pesos") || "null"); if (pw) PESOS = pw; } catch (e) { /* sin almacenamiento */ }
  function puntajeCiudades() {
    var cs = arr(LUG.ciudades);
    var costos = cs.map(function (c) { return (c.arriendo_2d_clp || 0) + (c.costo_vida_sin_arriendo_clp || 0); });
    var mn = Math.min.apply(null, costos), mx = Math.max.apply(null, costos);
    return cs.map(function (c, i) {
      var costoN = mx > mn ? 1 + 4 * (mx - costos[i]) / (mx - mn) : 3;
      var sc = PESOS.costo * costoN + PESOS.seguridad * (c.seguridad || 3) + PESOS.naturaleza * (c.naturaleza || 3) + PESOS.clientes * (c.fit_clientes_chile || 3) + PESOS.internet * (c.internet || 3);
      var tot = PESOS.costo + PESOS.seguridad + PESOS.naturaleza + PESOS.clientes + PESOS.internet;
      return { c: c, costo: costos[i], score: tot ? sc / tot : 0 };
    }).sort(function (a, b) { return b.score - a.score; });
  }
  function renderVivir() {
    var html = head("Dónde vivir", "Tu lugar según lo que más te importa", "Mueve los pesos y el ranking se recalcula. Costo = arriendo de 2 dormitorios + costo de vida de una persona.");
    html += '<div class="card"><div class="weights">' + [["costo", "Costo de vida"], ["seguridad", "Seguridad"], ["naturaleza", "Naturaleza"], ["clientes", "Cercanía a clientes en Chile"], ["internet", "Internet"]].map(function (w) {
      return '<div class="fld"><label for="w-' + w[0] + '">' + w[1] + ' <output id="wo-' + w[0] + '">' + PESOS[w[0]] + '</output></label><input type="range" id="w-' + w[0] + '" data-w="' + w[0] + '" min="0" max="5" step="1" value="' + PESOS[w[0]] + '"></div>';
    }).join("") + "</div></div>";
    html += '<div class="table-wrap" style="margin-top:16px"><table id="cityTable"><thead><tr><th>#</th><th>Lugar</th><th class="r">Costo/mes</th><th class="r">vs tu gasto</th><th>Seguridad</th><th>Naturaleza</th><th>Clientes CL</th><th>Clima · huso</th><th>Visa</th></tr></thead><tbody></tbody></table></div>';
    html += '<h3 class="h-sub">Recomendación por etapa</h3><div class="grid g3">' + C.etapasVivir.map(function (e) { return '<div class="card"><div class="month-n">' + e.desde + (e.hasta < 2090 ? "–" + e.hasta : " en adelante") + '</div><p style="margin-top:6px" class="ink2">' + e.texto + "</p></div>"; }).join("") + "</div>";
    html += '<h3 class="h-sub">Pros y contras del top 3</h3><div class="grid g3" id="cityTop"></div>';
    html += srcList(LUG.fuentes);
    $("#p-vivir").innerHTML = html;
    pintarCiudades();
    $("#p-vivir").addEventListener("input", function (e) {
      var w = e.target.dataset.w; if (!w) return;
      PESOS[w] = parseInt(e.target.value, 10); $("#wo-" + w).textContent = PESOS[w];
      store.set("vida-pesos", JSON.stringify(PESOS)); pintarCiudades();
    });
  }
  function pintarCiudades() {
    var r = puntajeCiudades();
    $("#cityTable tbody").innerHTML = r.map(function (x, i) {
      var c = x.c;
      return "<tr><td class='city-rank'>" + (i + 1) + "</td><td><b>" + esc(c.nombre) + "</b><div class='xs muted'>" + esc(c.pais || "") + "</div></td><td class='r'>" + clpS(x.costo) +
        "</td><td class='r'>" + pct(x.costo / P.gastoMensual) + "</td><td>" + dots(c.seguridad || 0) + "</td><td>" + dots(c.naturaleza || 0) + "</td><td>" + dots(c.fit_clientes_chile || 0) +
        "</td><td class='xs'>" + esc(c.clima || "") + "<br>" + esc(c.huso_vs_chile || "") + "</td><td class='xs' style='min-width:180px'>" + esc(c.visa || "") + "</td></tr>";
    }).join("");
    $("#cityTop").innerHTML = r.slice(0, 3).map(function (x, i) {
      var c = x.c;
      return '<div class="card"><div class="month-n">#' + (i + 1) + " · " + nf(x.score, 1) + "/5</div><h3>" + esc(c.nombre) + '</h3><div class="small" style="margin-top:6px"><b>A favor</b><ul class="list">' + arr(c.pros).map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") +
        '</ul><b>En contra</b><ul class="list">' + arr(c.contras).map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul></div>" + (c.fuente ? '<p class="src">' + link(c.fuente) + "</p>" : "") + "</div>";
    }).join("");
  }

  // ---------- VACACIONES ----------
  var MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  function presupuestoCat(id) {
    var resto = Math.max(0, P.gastoMensual - P.arriendo);
    var tot = C.presupuesto.reduce(function (a, c) { return a + c.peso; }, 0);
    var c = C.presupuesto.filter(function (x) { return x.id === id; })[0];
    return c ? resto * c.peso / tot : 0;
  }
  function renderVacaciones() {
    var anual = presupuestoCat("vacaciones") * 12;
    var html = head("Vacaciones", "Un año de descanso bien planificado", "Tu fondo de vacaciones: <b>" + clpS(anual / 12) + " al mes</b> → <b>" + clp(anual) + " al año</b>. Reserva en enero: los precios y cupos (como los refugios de Torres del Paine) se agotan.");
    var vs = arr(LUG.vacaciones).slice().sort(function (a, b) { return a.mes - b.mes; });
    html += '<div class="cal">' + vs.map(function (v) {
      var ok = (v.presupuesto_clp_persona || 0) <= anual;
      return '<div class="card"><div class="month-n">' + MESES[(v.mes || 1) - 1] + '</div><h3 style="margin-top:4px">' + esc(v.destino) + '</h3><div class="row-gap" style="margin:6px 0"><span class="tag">' + esc(v.tipo || "") + '</span><span class="tag">' + (v.dias || "?") + " días</span><span class=\"tag" + (ok ? " acc" : "") + "\">" + clpS(v.presupuesto_clp_persona || 0) + '</span></div><p class="small ink2">' + esc(v.por_que || "") + "</p>" +
        (v.tip ? '<p class="xs muted" style="margin-top:6px">Tip: ' + esc(v.tip) + "</p>" : "") + (v.fuente ? '<p class="src">' + link(v.fuente) + "</p>" : "") + "</div>";
    }).join("") + "</div>";
    var bl = arr(LUG.bucket_list);
    html += '<h3 class="h-sub">Viajes soñados por año</h3><div class="grid g3">' + Object.keys(C.bucketPorAnio).filter(function (k) { return k !== "default"; }).map(function (y) {
      return '<div class="card"><div class="month-n">' + y + '</div><h3 style="margin-top:4px">' + esc(C.bucketPorAnio[y]) + "</h3></div>";
    }).join("") + "</div>";
    if (bl.length) html += '<div class="grid g2" style="margin-top:16px">' + bl.map(function (b) {
      return '<div class="card"><h3>' + esc(b.destino || b.nombre) + '</h3><p class="small ink2" style="margin-top:6px">' + esc(b.por_que || b.detalle || "") + '</p><div class="row-gap" style="margin-top:6px">' + (b.mejor_temporada || b.mejor_epoca || b.temporada ? '<span class="tag">' + esc(b.mejor_temporada || b.mejor_epoca || b.temporada) + "</span>" : "") + (b.presupuesto_clp_persona ? '<span class="tag">' + clpS(b.presupuesto_clp_persona) + "</span>" : "") + (b.dias ? '<span class="tag">' + b.dias + " días</span>" : "") + "</div>" + (b.fuente ? '<p class="src">' + link(b.fuente) + "</p>" : "") + "</div>";
    }).join("") + "</div>";
    var fer = arr(LUG.feriados_largos);
    if (fer.length) html += '<h3 class="h-sub">Fines de semana largos para escaparse</h3><div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Motivo</th><th class="r">Días</th></tr></thead><tbody>' + fer.map(function (f) { return "<tr><td>" + esc(f.fecha) + "</td><td>" + esc(f.motivo) + "</td><td class='r'>" + esc(f.dias) + "</td></tr>"; }).join("") + "</tbody></table></div>";
    html += srcList(LUG.fuentes && LUG.fuentes.slice(0, 8));
    $("#p-vacaciones").innerHTML = html;
  }

  // ---------- ALIMENTACIÓN ----------
  function renderAlimentacion() {
    var al = VID.alimentacion || {};
    var prot = [P.peso * 1.2, P.peso * 1.6];
    var pres = presupuestoCat("alimentacion");
    var html = head("Alimentación", "Comer bien sin pensarlo cada día", "Proteína diaria sugerida para tu peso (" + P.peso + " kg): <b>" + nf(prot[0]) + "–" + nf(prot[1]) + " g</b>. Presupuesto de alimentación: <b>" + clpS(pres) + " al mes</b>.");
    html += '<div class="grid g2"><div class="card"><h3>Guías alimentarias para Chile</h3><ul class="list">' + arr(al.guias).map(function (g) { return "<li>" + esc(typeof g === "string" ? g : g.mensaje || g.texto || JSON.stringify(g)) + "</li>"; }).join("") + "</ul>" + (al.fuente ? '<p class="src">' + link(al.fuente) + "</p>" : "") + "</div>" +
      '<div class="card"><h3>Rutina de la semana</h3><div class="steps" style="margin-top:8px">' +
      [["Domingo: menú y lista", "10 minutos para decidir la semana con el menú de abajo."], ["Compra única", "Feria para verduras y fruta; súper para el resto."], ["Cocina base 2 veces", "Domingo y miércoles: legumbre, proteína y verduras asadas para 3 días."], ["Regla del plato", "Mitad verduras, un cuarto proteína, un cuarto carbohidrato integral."]].map(function (s) { return '<div class="step"><div><b>' + s[0] + "</b><p>" + s[1] + "</p></div></div>"; }).join("") + "</div>" +
      (al.costo_mensual_clp ? '<p class="small ink2" style="margin-top:10px">Referencia de gasto en alimentación: ' + esc(typeof al.costo_mensual_clp === "object" ? Object.keys(al.costo_mensual_clp).map(function (k) { var v = al.costo_mensual_clp[k]; return k.replace(/_/g, " ") + ": " + (typeof v === "number" ? clpS(v) : v); }).join(" · ") : al.costo_mensual_clp) + "</p>" : "") + "</div></div>";
    html += '<h3 class="h-sub">Menú semanal tipo</h3><div class="week">' + C.menu.map(function (d) {
      return '<div class="day"><h4>' + d.dia + '</h4><div class="t">Desayuno</div>' + esc(d.des) + '<div class="t">Almuerzo</div>' + esc(d.alm) + '<div class="t">Cena</div>' + esc(d.cen) + '<div class="t">Colación</div>' + esc(d.col) + "</div>";
    }).join("") + "</div>";
    html += '<h3 class="h-sub">Lista de compras semanal</h3><div class="grid g3">' + C.compras.map(function (c) { return '<div class="card"><h3>' + c[0] + '</h3><p class="small ink2" style="margin-top:6px">' + esc(c[1]) + "</p></div>"; }).join("") + "</div>";
    $("#p-alimentacion").innerHTML = html;
  }

  // ---------- SALUD ----------
  function renderSalud() {
    var s = VID.salud || {};
    var html = head("Salud", "Prevenir es más barato que curar", "Calendario de controles para tu edad (" + P.edad + " años) según guías chilenas. No reemplaza la indicación de tu médico.");
    html += '<div class="table-wrap"><table><thead><tr><th>Control</th><th>Frecuencia</th><th>Desde</th><th>Detalle</th></tr></thead><tbody>' + arr(s.controles).map(function (c) {
      return "<tr><td><b>" + esc(c.que) + "</b></td><td>" + esc(c.frecuencia) + "</td><td>" + esc(c.edad) + "</td><td class='small ink2'>" + esc(c.detalle) + (c.fuente ? " " + link(c.fuente) : "") + "</td></tr>";
    }).join("") + "</tbody></table></div>";
    html += '<div class="grid g2" style="margin-top:16px"><div class="card"><h3>Metas de indicadores</h3>' +
      [["Presión arterial", "< 120/80 mmHg"], ["Colesterol LDL", "< 130 mg/dL (o lo que indique tu médico)"], ["Glicemia en ayunas", "< 100 mg/dL"], ["Cintura", "< 94 cm hombres · < 80 cm mujeres"], ["Sueño", "7–9 horas, horario fijo"], ["Pasos", "≥ 8.000 al día"]].map(function (m) { return '<div class="kpi-line"><span>' + m[0] + "</span><span>" + m[1] + "</span></div>"; }).join("") + "</div>" +
      '<div class="card"><h3>Sueño y salud mental</h3>' + (s.sueno ? '<p class="small ink2">' + esc(typeof s.sueno === "string" ? s.sueno : (s.sueno.recomendacion || s.sueno.detalle || "")) + "</p>" + (s.sueno.fuente ? '<p class="src">' + link(s.sueno.fuente) + "</p>" : "") : "") +
      '<ul class="list">' + arr(s.mental).map(function (m) { return "<li>" + (typeof m === "string" ? esc(m) : "<b>" + esc(m.recurso || m.nombre || m.que || "") + "</b> " + esc(m.detalle || "") + (m.fuente || m.url ? " " + link(m.fuente || m.url) : "")) + "</li>"; }).join("") + "</ul></div></div>";
    $("#p-salud").innerHTML = html;
  }

  // ---------- DEPORTE ----------
  function renderDeporte() {
    var d = VID.deporte || {};
    var html = head("Deporte", "Fuerza, corazón y aventura", "La semana tipo cumple las recomendaciones de la OMS y deja espacio para la montaña.");
    html += '<div class="week">' + C.semanaDeporte.map(function (x) { return '<div class="day"><h4>' + x.dia + '</h4><div class="t">' + esc(x.s) + "</div>" + esc(x.d) + "</div>"; }).join("") + "</div>";
    html += '<div class="grid g2" style="margin-top:16px"><div class="card"><h3>Recomendaciones</h3><ul class="list">' + arr(d.recomendaciones).map(function (r) { return "<li>" + (typeof r === "string" ? esc(r) : esc(r.texto || r.recomendacion || r.detalle || "") + (r.fuente ? " " + link(r.fuente) : "")) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="card"><h3>Progresión por año</h3>' + C.progresionDeporte.map(function (p) { return '<div class="kpi-line"><span><b>' + p.anio + "</b> · " + esc(p.meta) + "</span><span class='xs'>" + esc(p.evento) + "</span></div>"; }).join("") + "</div></div>";
    var ev = arr(d.eventos);
    if (ev.length) html += '<h3 class="h-sub">Eventos para inscribirte</h3><div class="table-wrap"><table><thead><tr><th>Evento</th><th>Fecha</th><th>Lugar</th><th>Distancias</th></tr></thead><tbody>' + ev.map(function (e) { return "<tr><td><b>" + (e.fuente ? link(e.fuente, e.nombre) : esc(e.nombre)) + "</b></td><td>" + esc(e.fecha) + "</td><td>" + esc(e.lugar) + "</td><td class='small'>" + esc(e.distancias) + "</td></tr>"; }).join("") + "</tbody></table></div>";
    $("#p-deporte").innerHTML = html;
  }

  // ---------- ESTUDIOS ----------
  function renderEstudios() {
    var html = head("Estudios", "Aprender lo que multiplica tu ingreso", "Una habilidad principal por año, elegida por su retorno.");
    html += '<div class="grid g3">' + C.estudiosPlan.map(function (e) { return '<div class="card"><div class="month-n">' + e.anio + '</div><h3 style="margin-top:4px">' + esc(e.que) + '</h3><p class="small ink2" style="margin-top:6px">' + esc(e.por) + "</p></div>"; }).join("") + "</div>";
    var es = arr(VID.estudios);
    if (es.length) html += '<h3 class="h-sub">Programas y certificaciones</h3><div class="table-wrap"><table><thead><tr><th>Programa</th><th>Institución</th><th>Modalidad · duración</th><th>Costo</th><th>Para qué</th></tr></thead><tbody>' + es.map(function (e) {
      return "<tr><td><b>" + (e.fuente ? link(e.fuente, e.nombre) : esc(e.nombre)) + "</b></td><td>" + esc(e.institucion) + "</td><td class='small'>" + esc(e.modalidad) + " · " + esc(e.duracion) + "</td><td class='small'>" + esc(e.costo) + "</td><td class='small ink2'>" + esc(e.para_que) + "</td></tr>";
    }).join("") + "</tbody></table></div>";
    html += '<h3 class="h-sub">Libros: uno al mes</h3><div class="card"><ul class="list">' + C.libros.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("") + "</ul></div>";
    $("#p-estudios").innerHTML = html;
  }

  // ---------- COACHES ----------
  function fechaOrden(o) { return o.proxima ? new Date(o.proxima + "T12:00:00").getTime() : (o.estado === "permanente" ? 9e15 : Infinity); }
  var HOY_ISO = (V.mercado && V.mercado.fecha) || "2026-09-25";
  function diasA(o) { return o.proxima ? Math.round((new Date(o.proxima + "T12:00:00") - new Date(HOY_ISO + "T12:00:00")) / 864e5) : null; }
  function estadoTag(o) {
    var d = diasA(o);
    if (d !== null && d >= 0) return '<span class="tag ' + (d <= 14 ? "crit" : d <= 45 ? "warn" : "acc") + '">' + (d === 0 ? "hoy" : "en " + d + " días") + "</span>";
    if (o.estado === "permanente") return '<span class="tag">permanente</span>';
    return '<span class="tag">por confirmar</span>';
  }
  function proximasOportunidades(n) {
    return arr(VID.oportunidades).filter(function (o) { var d = diasA(o); return d !== null && d >= 0; })
      .sort(function (a, b) { return fechaOrden(a) - fechaOrden(b); }).slice(0, n);
  }
  function oppHtml(o) {
    return '<div class="opp"><div class="opp-top"><span>' + (o.url ? link(o.url, o.nombre) : "<b>" + esc(o.nombre) + "</b>") + "</span>" + estadoTag(o) + "</div>" +
      '<div class="xs muted">' + esc(o.organismo || "") + (o.monto ? " · " + esc(o.monto) : "") + (o.fecha_o_ventana ? " · " + esc(o.fecha_o_ventana) : "") + "</div>" +
      (o.relevancia_para_perfil ? '<div class="small ink2" style="margin-top:3px">' + esc(o.relevancia_para_perfil) + "</div>" : "") + "</div>";
  }
  function promptCoach(c) {
    var h = HOY();
    return "Actúa como mi " + c.nombre + " (" + c.foco + "). Háblame en español de Chile, directo y con números.\n\n" +
      "Mi situación: " + P.edad + " años, vivo en " + P.ciudad + ", hogar " + P.hogar + ". Ingreso neto " + clp(P.ingresoNeto) + "/mes, gasto " + clp(P.gastoMensual) + "/mes, tasa de ahorro " + pct(h.tasaAhorro) +
      ". Patrimonio total " + clp(h.total) + ". Meta de libertad " + clp(SIM.meta) + " (año estimado " + (SIM.anioLibertad || "sin fecha") + ", escenario " + P.escenario + ").\n" +
      "Mi negocio: vendo un back-office con IA para fondos, el SaaS FibraZero (Ley REP) y consultoría técnica (energía, minería, CORFO).\n\n" +
      "Tu pregunta de siempre: " + c.pregunta + "\nMétricas que vigilas: " + c.metricas.join(", ") + ".\n\n" +
      "Tareas: 1) Evalúa en qué voy bien y en qué no. 2) Dame 3 acciones concretas para los próximos 7 días. 3) Busca oportunidades reales y vigentes (con fecha y enlace) en tu área. 4) Dime qué dejar de hacer.";
  }
  var fTipo = "";
  function renderCoaches() {
    var ops = arr(VID.oportunidades);
    var html = head("Coaches", "Tu consejo personal de nueve coaches", "Cada coach vigila un área, te hace una pregunta semanal y te trae oportunidades. Copia su prompt y conversa con Claude cuando lo necesites.");
    html += '<div class="coaches-grid">' + C.coaches.map(function (c, i) {
      var mias = ops.filter(function (o) { return c.tipos.indexOf(o.tipo) >= 0; }).sort(function (a, b) { return fechaOrden(a) - fechaOrden(b); }).slice(0, 3);
      return '<div class="card coach"><div class="coach-head"><div class="avatar" style="background:var(' + c.color + ')">' + c.ini + '</div><div><h3>' + c.nombre + '</h3><div class="xs muted">' + c.foco + "</div></div></div>" +
        "<q>" + esc(c.pregunta) + '</q><div class="row-gap">' + c.metricas.map(function (m) { return '<span class="tag">' + esc(m) + "</span>"; }).join("") + "</div>" +
        '<div><div class="k xs muted" style="font-weight:600;text-transform:uppercase;letter-spacing:.05em">Este trimestre</div><ul class="list small">' + c.acciones.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("") + "</ul></div>" +
        (mias.length ? "<div>" + mias.map(oppHtml).join("") + "</div>" : "") +
        '<button class="btn ghost" type="button" data-copy="' + i + '">Copiar prompt del coach</button></div>';
    }).join("") + "</div>";
    var tipos = ops.map(function (o) { return o.tipo; }).filter(function (t, i, a) { return t && a.indexOf(t) === i; });
    html += '<h3 class="h-sub">Radar de oportunidades</h3><div class="toolbar"><select id="fTipo" aria-label="Filtrar por tipo"><option value="">Todos los tipos (' + ops.length + ")</option>" + tipos.map(function (t) { return '<option value="' + esc(t) + '"' + (t === fTipo ? " selected" : "") + ">" + esc(t) + "</option>"; }).join("") + '</select></div><div class="table-wrap"><table id="oppTable"><thead><tr><th>Oportunidad</th><th>Cuándo</th><th>Tipo</th><th>Organismo</th><th>Monto</th><th>Fecha o ventana</th><th>Por qué te sirve</th></tr></thead><tbody></tbody></table></div>';
    html += srcList(VID.fuentes && VID.fuentes.slice(0, 10));
    $("#p-coaches").innerHTML = html;
    pintarOpp();
  }
  function pintarOpp() {
    var ops = arr(VID.oportunidades).filter(function (o) { return !fTipo || o.tipo === fTipo; }).sort(function (a, b) { return fechaOrden(a) - fechaOrden(b); });
    $("#oppTable tbody").innerHTML = ops.map(function (o) {
      return "<tr><td><b>" + (o.url ? link(o.url, o.nombre) : esc(o.nombre)) + "</b></td><td>" + estadoTag(o) + "</td><td><span class='tag'>" + esc(o.tipo) + "</span></td><td class='small'>" + esc(o.organismo) + "</td><td class='small'>" + esc(o.monto || "—") + "</td><td class='small'>" + esc(o.fecha_o_ventana || "—") + "</td><td class='small ink2' style='min-width:220px'>" + esc(o.relevancia_para_perfil || o.para_quien || "") + "</td></tr>";
    }).join("");
  }

  // ---------- AÑO A AÑO ----------
  function fase(anio) { var f = C.fases.filter(function (x) { return anio >= x.desde && anio <= x.hasta; })[0]; return f ? f.nombre : ""; }
  function etapaVivir(anio) { var e = C.etapasVivir.filter(function (x) { return anio >= x.desde && anio <= x.hasta; })[0]; return e ? e.texto.split(".")[0] + "." : ""; }
  function saludEdad(edad) {
    if (edad < 40) return "EMPA o chequeo anual, dentista cada 6 meses, perfil lipídico y glicemia.";
    if (edad < 50) return "Chequeo anual con perfil lipídico, glicemia y presión; oftalmólogo; dermatólogo cada 1–2 años.";
    return "Chequeo anual ampliado; tamizaje de cáncer de colon desde los 50; densitometría según indicación.";
  }
  function renderAnio() {
    var rows = SIM.filas.slice(0, 26);
    var html = head("Año a año", "Tu vida, paso a paso", "Desde hoy hasta 5 años después de tu libertad financiera (escenario " + P.escenario + "). Las cifras vienen del motor y cambian con tu perfil.");
    html += '<div class="timeline">' + rows.map(function (f) {
      var fi = f.anio === SIM.anioLibertad;
      var dep = C.progresionDeporte.filter(function (p) { return p.anio === f.anio; })[0] || (f.anio > 2031 ? C.progresionDeporte[C.progresionDeporte.length - 1] : null);
      var est = C.estudiosPlan.filter(function (p) { return p.anio === f.anio; })[0];
      var viv = P.vivienda && P.vivienda.comprar && f.hitos.indexOf("Vivienda propia") >= 0 ? "Compras tu vivienda (" + nf(P.vivienda.precioUF) + " UF). " : "";
      return '<div class="year' + (fi ? " fi" : "") + '"><div><div class="year-n">' + f.anio + '</div><div class="year-age">' + f.edad + " años</div></div><div>" +
        '<div class="year-phase">' + (fi ? "Libertad financiera · " : "") + fase(f.anio) + (f.hitos.length ? ' <span class="tag acc">' + f.hitos.map(esc).join(" · ") + "</span>" : "") + "</div>" +
        '<div class="year-grid">' +
        "<div><b>Dinero:</b> ingreso " + clpS(f.ingresoAnual / 12) + "/mes, gasto " + clpS(f.gastoAnual / 12) + "/mes, ahorro " + pct(f.tasaAhorro) + ".</div>" +
        "<div><b>Patrimonio:</b> " + clpS(f.total) + " total · " + pct(f.pctMeta) + " de la meta.</div>" +
        "<div><b>Negocio:</b> " + esc(C.metasNegocio[f.anio] || C.metasNegocio.default) + "</div>" +
        "<div><b>Dónde vivir:</b> " + viv + esc(etapaVivir(f.anio)) + "</div>" +
        "<div><b>Viaje del año:</b> " + esc(C.bucketPorAnio[f.anio] || C.bucketPorAnio.default) + "</div>" +
        "<div><b>Salud:</b> " + esc(saludEdad(f.edad)) + "</div>" +
        "<div><b>Deporte:</b> " + esc(dep ? dep.meta : "Fuerza 3×/semana y 150 min de cardio suave.") + "</div>" +
        "<div><b>Estudios:</b> " + esc(est ? est.que : "Un libro al mes y un curso corto al año.") + "</div>" +
        "</div></div></div>";
    }).join("") + "</div>";
    $("#p-anio").innerHTML = html;
  }

  // ---------- PROMPT ----------
  function renderPrompt() {
    var html = head("Prompt maestro", "El prompt que genera este plan", "Cópialo y vuelve a correrlo cada 6 meses en Claude Code con tus datos actualizados.");
    html += '<div class="toolbar"><button class="btn" id="copyMaster" type="button">Copiar prompt</button><a class="btn ghost" href="https://github.com/Nikolaaa11/NIKOLAI/blob/claude/trabajo-analisis-financiero-gy128x/PROMPT_PLAN_DE_VIDA.md" target="_blank" rel="noopener">Ver en GitHub</a></div><pre class="prompt-box" id="masterBox"></pre>';
    $("#p-prompt").innerHTML = html;
    $("#masterBox").textContent = V.prompt || "";
    $("#copyMaster").addEventListener("click", function () {
      var b = this, done = function (m) { b.textContent = m; setTimeout(function () { b.textContent = "Copiar prompt"; }, 1800); };
      var fb = function () { var s = window.getSelection(), r = document.createRange(); r.selectNodeContents($("#masterBox")); s.removeAllRanges(); s.addRange(r); done("Seleccionado: copia con Ctrl/Cmd+C"); };
      try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(V.prompt || "").then(function () { done("Copiado"); }, fb); else fb(); } catch (e) { fb(); }
    });
  }

  // ---------- gráficos ----------
  function drawCharts() {
    var years, b;
    if ((b = $("#chPat")) && b.offsetParent) {
      var fs = SIM.filas.slice(0, 26);
      years = fs.map(function (f) { return String(f.anio); });
      stackedColumns(b, years, [
        { name: "Acciones globales", color: "--s1", values: fs.map(function (f) { return f.acciones; }) },
        { name: "Renta fija UF", color: "--s2", values: fs.map(function (f) { return f.rf; }) },
        { name: "Liquidez y pie", color: "--s3", values: fs.map(function (f) { return f.liquidez + f.fondoVivienda; }) },
        { name: "Vivienda neta", color: "--s4", values: fs.map(function (f) { return Math.max(0, f.inmobiliario); }) },
        { name: "Previsión", color: "--s5", values: fs.map(function (f) { return f.prevision; }) }
      ], { name: "Meta de libertad", color: "--ink", values: fs.map(function (f) { return f.meta; }) }, clpS);
    }
    if ((b = $("#chFin")) && b.offsetParent) {
      var ff = SIM.filas;
      stackedColumns(b, ff.map(function (f) { return String(f.anio); }), [{ name: "Patrimonio financiero", color: "--s1", values: ff.map(function (f) { return f.financiero; }) }],
        { name: "Meta de libertad", color: "--s2", values: ff.map(function (f) { return f.meta; }) }, clpS);
    }
    if ((b = $("#chGlide")) && b.offsetParent) {
      var ages = []; for (var e = Math.max(25, P.edad); e <= 70; e += 5) ages.push(e);
      stackedColumns(b, ages.map(function (a) { return a + " años"; }), [
        { name: "Acciones globales", color: "--s1", values: ages.map(function (a) { return E.pctAcciones(a, P.riesgo) * 100; }) },
        { name: "Renta fija UF", color: "--s2", values: ages.map(function (a) { return 100 - E.pctAcciones(a, P.riesgo) * 100; }) }
      ], null, function (v) { return nf(v) + " %"; });
    }
    if ((b = $("#chMrr")) && b.offsetParent) {
      var lab = ["2026", "2027", "2028", "2029"];
      var otras = lab.map(function (_, i) { return C.apps.slice(3).reduce(function (a, x) { return a + x.mrr[i]; }, 0); });
      stackedColumns(b, lab, [
        { name: "Back-office fondos", color: "--s1", values: C.apps[0].mrr },
        { name: "FibraZero", color: "--s2", values: C.apps[1].mrr },
        { name: "Consultoría", color: "--s3", values: C.apps[2].mrr },
        { name: "Otras apps", color: "--s4", values: otras }
      ], null, clpS);
    }
  }
  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(drawCharts, 120); });
  if (window.matchMedia) window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", drawCharts);

  // ---------- ciclo ----------
  function recalcular(desdePerfil) {
    calcular(); marcarEscenario();
    $("#exampleBanner").hidden = !esEjemplo;
    renderResumen(); renderDinero(); renderInversion(); renderPatrimonio(); renderNegocio();
    renderVacaciones(); renderAlimentacion(); renderSalud(); renderDeporte(); renderEstudios(); renderCoaches(); renderAnio();
    if (!desdePerfil) renderPerfil(); // el formulario no se redibuja mientras escribes
    drawCharts();
  }

  // Listeners delegados: se registran una sola vez.
  (function () {
    var t;
    $("#p-perfil").addEventListener("input", function (e) {
      var el = e.target; if (!el.matches("input, select")) return;
      var val = el.type === "checkbox" ? el.checked : el.type === "number" ? parseFloat(el.value) : el.value;
      if (el.type === "number" && isNaN(val)) return;
      if (el.dataset.v) { P.vivienda = P.vivienda || {}; P.vivienda[el.dataset.v] = val; }
      else if (el.dataset.r) { P.rueda = P.rueda || {}; P.rueda[el.dataset.r] = Math.max(1, Math.min(10, val)); }
      else if (el.dataset.k === "tasaAhorroMetaPct") P.tasaAhorroMeta = Math.max(0.05, Math.min(0.9, val / 100));
      else if (el.dataset.k) P[el.dataset.k] = val;
      guardarPerfil();
      clearTimeout(t); t = setTimeout(function () { recalcular(true); }, 250);
    });
    $("#p-perfil").addEventListener("click", function (e) {
      if (e.target.id === "resetPerfil") { store.del("vida-perfil"); cargarPerfil(); recalcular(); }
    });
    $("#p-coaches").addEventListener("input", function (e) { if (e.target.id === "fTipo") { fTipo = e.target.value; pintarOpp(); } });
    $("#p-coaches").addEventListener("click", function (e) {
      var b = e.target.closest("[data-copy]"); if (!b) return;
      var txt = promptCoach(C.coaches[+b.dataset.copy]);
      var done = function (m) { b.textContent = m; setTimeout(function () { b.textContent = "Copiar prompt del coach"; }, 1800); };
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { done("Copiado"); }, function () { done("No se pudo copiar"); });
        else done("No se pudo copiar");
      } catch (err) { done("No se pudo copiar"); }
    });
  })();

  calcular(); renderVivir(); renderPrompt();
  recalcular();
  irA(location.hash.slice(1) || "resumen", true);
})();
