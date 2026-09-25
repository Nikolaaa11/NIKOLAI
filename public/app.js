(function () {
  "use strict";
  var D = window.DATA, C = window.CONTENT;
  var T = D.totales, TF = D.tarifas;

  // ---------- utilidades ----------
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var nf = function (n, d) { return Number(n).toLocaleString("es-CL", { maximumFractionDigits: d || 0, minimumFractionDigits: d || 0 }); };
  function clp(n) {
    var a = Math.abs(n);
    if (a >= 1e9) return "$" + nf(n / 1e6, 0) + " millones";
    if (a >= 1e6) return "$" + nf(n / 1e6, a >= 1e8 ? 0 : 1) + " millones";
    if (a >= 1e3) return "$" + nf(n / 1e3, 0) + " mil";
    return "$" + nf(n, 0);
  }
  function clpShort(n) {
    var a = Math.abs(n);
    if (a >= 1e6) return "$" + nf(n / 1e6, a >= 1e8 ? 0 : 1) + " M";
    if (a >= 1e3) return "$" + nf(n / 1e3, 0) + " mil";
    return "$" + nf(n, 0);
  }
  function usd(n) {
    var a = Math.abs(n);
    if (a >= 1e6) return "USD " + nf(n / 1e6, 2) + " M";
    if (a >= 1e3) return "USD " + nf(n / 1e3, 0) + " mil";
    return "USD " + nf(n, 0);
  }
  function usdShort(n) {
    var a = Math.abs(n);
    if (a >= 1e6) return "US$" + nf(n / 1e6, 2) + " M";
    if (a >= 1e3) return "US$" + nf(n / 1e3, 0) + "k";
    return "US$" + nf(n, 0);
  }
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } }
  };
  function svgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  // Barra horizontal con extremo redondeado (4px) y base recta.
  function barPath(x, y, w, h) {
    var r = Math.min(4, w, h / 2);
    if (w <= 0) return "";
    return "M" + x + "," + y + "h" + (w - r) + "a" + r + "," + r + " 0 0 1 " + r + "," + r +
      "v" + (h - 2 * r) + "a" + r + "," + r + " 0 0 1 " + (-r) + "," + r + "h" + (-(w - r)) + "z";
  }
  function measure(text, size) {
    var c = measure.c || (measure.c = document.createElement("canvas").getContext("2d"));
    c.font = (size || 12) + "px system-ui, -apple-system, Segoe UI, sans-serif";
    return c.measureText(text).width;
  }

  // ---------- tooltip ----------
  var tip = $("#tip");
  function showTip(html, ev) {
    tip.innerHTML = html;
    tip.style.opacity = "1";
    var x = ev.clientX + 14, y = ev.clientY + 14;
    var r = tip.getBoundingClientRect();
    if (x + r.width > window.innerWidth - 8) x = ev.clientX - r.width - 14;
    if (y + r.height > window.innerHeight - 8) y = ev.clientY - r.height - 14;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  function hideTip() { tip.style.opacity = "0"; }

  // ---------- tema ----------
  var root = document.documentElement;
  var themeBtn = $("#themeBtn");
  function applyTheme(t) {
    if (t === "light" || t === "dark") root.setAttribute("data-theme", t); else root.removeAttribute("data-theme");
    themeBtn.textContent = t === "light" ? "Claro" : t === "dark" ? "Oscuro" : "Auto";
  }
  var theme = store.get("theme") || "auto";
  applyTheme(theme);
  themeBtn.addEventListener("click", function () {
    theme = theme === "auto" ? "light" : theme === "light" ? "dark" : "auto";
    store.set("theme", theme); applyTheme(theme); renderCharts();
  });

  // ---------- HERO ----------
  $("#heroCL").textContent = clpShort(T.costo_cl_clp);
  $("#heroCLsub").innerHTML = "millones de pesos (CLP) ≈ " + usd(T.costo_cl_usd) + "<br>o <b>" + clp(T.mensual_cl_clp) + " al mes</b> manteniendo el equipo contratado";
  $("#heroUS").textContent = usd(T.costo_us_usd);
  $("#heroUSsub").innerHTML = "millones de dólares ≈ " + clp(T.costo_us_clp) + "<br>o <b>" + usd(T.mensual_us_usd) + " al mes</b> con equipo contratado";

  var dupCount = D.proyectos.filter(function (p) { return p.duplicado_de || p.madurez === "vacio"; }).length;
  var tiles = [
    ["Profesiones que ejerces", T.profesiones, "roles distintos con evidencia"],
    ["Equipos que solapas", T.equipos, "departamentos de una empresa"],
    ["Horas profesionales", nf(T.horas), "equivalentes, en ~" + TF.meses_actividad + " meses"],
    ["Personas a tiempo completo", nf(T.fte, 1), "sostenidas durante ~" + TF.meses_actividad + " meses"],
    ["Repositorios", T.repos, T.repos_unicos + " únicos · " + dupCount + " copias o vacíos"],
    ["Proyectos en Vercel", "100+", "despliegues en la cuenta"],
    ["Sesiones con Claude", D.sesiones.total_sesiones, "oct 2025 – sep 2026"],
    ["Líneas de código", "~915 mil", "brutas, antes de deduplicar"]
  ];
  $("#tiles").innerHTML = tiles.map(function (t) {
    return '<div class="card"><div class="stat-label">' + t[0] + '</div><div class="stat-value">' + t[1] + '</div><div class="stat-note">' + t[2] + "</div></div>";
  }).join("");

  // ---------- PROFESIONES ----------
  $("#profTitle").textContent = "Las " + T.profesiones + " profesiones que ejerces";
  var teamName = {};
  D.equipos.forEach(function (e) { teamName[e.id] = e.nombre; });
  $("#roleCards").innerHTML = D.roles.map(function (r) {
    var ev = (r.evidencia || []).slice(0, 4).map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("");
    return '<div class="card role-card"><h3><span>' + esc(r.nombre) + '</span><span class="hrs num">' + nf(r.horas) + ' h</span></h3>' +
      '<div class="role-team"><span class="chip">' + esc(teamName[r.equipo]) + "</span></div>" +
      "<ul>" + ev + "</ul></div>";
  }).join("");

  // ---------- COMPARACIÓN ----------
  $("#compare").innerHTML =
    '<div class="card"><div class="flag">Chile · costo de proyecto</div><div class="big num">' + clp(T.costo_cl_clp) + '</div><div class="alt">≈ ' + usd(T.costo_cl_usd) + "</div>" +
    '<div class="divider"></div><div class="flag">Chile · equipo contratado al mes</div><div class="big num">' + clp(T.mensual_cl_clp) + '</div><div class="alt">≈ ' + usd(T.mensual_cl_usd) + " · " + nf(T.fte, 1) + " personas</div></div>" +
    '<div class="card"><div class="flag">EE.UU. · costo de proyecto</div><div class="big num">' + usd(T.costo_us_usd) + '</div><div class="alt">≈ ' + clp(T.costo_us_clp) + "</div>" +
    '<div class="divider"></div><div class="flag">EE.UU. · equipo contratado al mes</div><div class="big num">' + usd(T.mensual_us_usd) + '</div><div class="alt">≈ ' + clp(T.mensual_us_clp) + "</div></div>" +
    '<div class="card"><div class="flag">Lo que eso significa</div><p style="margin-top:10px">Hacer lo mismo en EE.UU. cuesta <b>' + nf(T.costo_us_usd / T.costo_cl_usd, 1) + " veces</b> más que en Chile.</p>" +
    '<p style="margin-top:10px">Si capturaras solo el <b>10 %</b> del costo mensual de un equipo chileno equivalente, serían <b>' + clp(T.mensual_cl_clp * 0.1) + " al mes</b>.</p>" +
    '<p style="margin-top:10px;color:var(--ink-2)">Tu límite no es la capacidad: es cuánto de ese valor cobras.</p></div>';

  // tabla de costos
  $("#costTable tbody").innerHTML = D.roles.map(function (r) {
    return "<tr><td>" + esc(r.nombre) + '</td><td class="r">' + nf(r.horas) + '</td><td class="r">' + nf(r.cl_hora) +
      '</td><td class="r">' + clpShort(r.costo_cl_clp) + '</td><td class="r">' + nf(r.us_hora) + '</td><td class="r">' + usdShort(r.costo_us_usd) +
      '</td><td class="r">' + nf(r.fte, 2) + "</td></tr>";
  }).join("");
  $("#costTable tfoot").innerHTML = '<tr><td>Total</td><td class="r">' + nf(T.horas) + '</td><td></td><td class="r">' + clpShort(T.costo_cl_clp) +
    '</td><td></td><td class="r">' + usdShort(T.costo_us_usd) + '</td><td class="r">' + nf(T.fte, 1) + "</td></tr>";
  $("#costNote").textContent = "Horas: " + nf(T.horas_codigo) + " de proyectos de código + " + nf(T.horas_sesiones) +
    " de trabajo no-código detectado en las sesiones. Jornadas equivalentes = horas ÷ (" + TF.meses_actividad + " meses × " + TF.horas_mes_fte + " h).";

  // ---------- EQUIPOS ----------
  $("#teamTitle").textContent = "Solapas " + T.equipos + " equipos de una empresa";
  var maxTeam = Math.max.apply(null, D.equipos.map(function (e) { return e.horas; }));
  $("#teams").innerHTML = D.equipos.map(function (e) {
    var pct = e.horas / T.horas * 100;
    return '<div class="card team"><div class="team-top"><span class="team-name">' + esc(e.nombre) + '</span><span class="num" style="color:var(--ink-2);font-size:.85rem">' +
      nf(e.horas) + " h · " + nf(pct, pct < 1 ? 1 : 0) + ' %</span></div><div class="meter" aria-hidden="true"><div style="width:' + Math.max(1.5, e.horas / maxTeam * 100) + '%"></div></div>' +
      '<div class="team-roles">' + e.roles.map(esc).join(" · ") + "</div></div>";
  }).join("");

  // ---------- GRÁFICOS ----------
  var cur = store.get("cur") || "usd";
  document.querySelectorAll("[data-cur]").forEach(function (b) {
    b.setAttribute("aria-pressed", String(b.dataset.cur === cur));
    b.addEventListener("click", function () {
      cur = b.dataset.cur; store.set("cur", cur);
      document.querySelectorAll("[data-cur]").forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.cur === cur)); });
      drawCost();
    });
  });

  function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }

  function drawCost() {
    var box = $("#costChart"); box.innerHTML = "";
    var W = Math.max(320, box.clientWidth);
    var TOP = 12;
    var rows = D.roles.slice(0, TOP).map(function (r) { return { n: r.nombre, cl: r.costo_cl_clp, us: r.costo_us_usd, h: r.horas }; });
    var rest = D.roles.slice(TOP);
    if (rest.length) rows.push({
      n: "Otras " + rest.length + " profesiones",
      cl: rest.reduce(function (a, r) { return a + r.costo_cl_clp; }, 0),
      us: rest.reduce(function (a, r) { return a + r.costo_us_usd; }, 0),
      h: rest.reduce(function (a, r) { return a + r.horas; }, 0)
    });
    var toCur = function (row, which) {
      if (cur === "usd") return which === "cl" ? row.cl / TF.usd_clp : row.us;
      return which === "cl" ? row.cl : row.us * TF.usd_clp;
    };
    var fmt = cur === "usd" ? usdShort : clpShort;
    var narrow = W < 560;
    var labelW = narrow ? 0 : Math.min(260, Math.max.apply(null, rows.map(function (r) { return measure(r.n, 12); })) + 12);
    var bar = 12, gap = 2, rowH = narrow ? 2 * bar + gap + 30 : 2 * bar + gap + 14;
    var valW = 70;
    var plotX = labelW, plotW = W - labelW - valW;
    var H = rows.length * rowH + 4;
    var max = Math.max.apply(null, rows.map(function (r) { return Math.max(toCur(r, "cl"), toCur(r, "us")); }));
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H });
    svg.appendChild(svgEl("line", { x1: plotX, x2: plotX, y1: 0, y2: H, class: "axis", "stroke-width": 1 }));
    rows.forEach(function (r, i) {
      var y0 = i * rowH + (narrow ? 18 : 7);
      if (narrow) {
        var t0 = svgEl("text", { x: 0, y: i * rowH + 12 }); t0.textContent = r.n; svg.appendChild(t0);
      } else {
        var t = svgEl("text", { x: labelW - 10, y: y0 + bar + 1, "text-anchor": "end", "dominant-baseline": "middle" }); t.textContent = r.n; svg.appendChild(t);
      }
      [["cl", "--s1"], ["us", "--s2"]].forEach(function (s, j) {
        var v = toCur(r, s[0]);
        var w = Math.max(2, v / max * plotW);
        var y = y0 + j * (bar + gap);
        svg.appendChild(svgEl("path", { d: barPath(plotX, y, w, bar), fill: cssVar(s[1]) }));
        var lbl = svgEl("text", { x: plotX + w + 6, y: y + bar / 2 + 1, "dominant-baseline": "middle", class: "num" });
        lbl.textContent = fmt(v); svg.appendChild(lbl);
      });
      var hit = svgEl("rect", { x: 0, y: i * rowH, width: W, height: rowH, fill: "transparent" });
      hit.addEventListener("mousemove", function (ev) {
        showTip("<b>" + esc(r.n) + "</b><div class='row'><span>Horas</span><span>" + nf(r.h) + "</span></div>" +
          "<div class='row'><span>Chile</span><span>" + clpShort(r.cl) + " · " + usdShort(r.cl / TF.usd_clp) + "</span></div>" +
          "<div class='row'><span>EE.UU.</span><span>" + usdShort(r.us) + " · " + clpShort(r.us * TF.usd_clp) + "</span></div>", ev);
      });
      hit.addEventListener("mouseleave", hideTip);
      svg.appendChild(hit);
    });
    box.appendChild(svg);
  }

  var domLabel = {
    fondo_inversion: "Fondo de inversión", finanzas_corporativas: "Finanzas corporativas", gobernanza_legal: "Gobernanza y legal",
    energia_bess_solar: "Energía (BESS/solar)", movilidad_electrica_leasing: "Leasing y movilidad eléctrica", mineria_industrial: "Minería e industria",
    saas_producto: "SaaS de producto", reciclaje_economia_circular: "Reciclaje y economía circular", academico_educacion: "Académico y educación",
    inmobiliario_construccion: "Inmobiliario y construcción", personal_otro: "Personal y otros", salud: "Salud", marketing_comercial: "Marketing y ventas"
  };

  function drawDomains() {
    var box = $("#domainChart"); box.innerHTML = "";
    var W = Math.max(320, box.clientWidth);
    var rows = D.dominios;
    var narrow = W < 560;
    var labelW = narrow ? 0 : Math.max.apply(null, rows.map(function (r) { return measure(domLabel[r.dominio] || r.dominio, 12); })) + 12;
    var bar = 16, rowH = narrow ? 42 : 28, valW = 80;
    var plotX = labelW, plotW = W - labelW - valW;
    var H = rows.length * rowH;
    var max = Math.max.apply(null, rows.map(function (r) { return r.horas; }));
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H });
    svg.appendChild(svgEl("line", { x1: plotX, x2: plotX, y1: 0, y2: H, class: "axis", "stroke-width": 1 }));
    rows.forEach(function (r, i) {
      var name = domLabel[r.dominio] || r.dominio;
      var y = i * rowH + (narrow ? 20 : (rowH - bar) / 2);
      if (narrow) { var t0 = svgEl("text", { x: 0, y: i * rowH + 13 }); t0.textContent = name; svg.appendChild(t0); }
      else { var t = svgEl("text", { x: labelW - 10, y: y + bar / 2 + 1, "text-anchor": "end", "dominant-baseline": "middle" }); t.textContent = name; svg.appendChild(t); }
      var w = Math.max(2, r.horas / max * plotW);
      svg.appendChild(svgEl("path", { d: barPath(plotX, y, w, bar), fill: cssVar("--s1") }));
      var v = svgEl("text", { x: plotX + w + 6, y: y + bar / 2 + 1, "dominant-baseline": "middle", class: "num" });
      v.textContent = nf(r.horas) + " h"; svg.appendChild(v);
      var hit = svgEl("rect", { x: 0, y: i * rowH, width: W, height: rowH, fill: "transparent" });
      hit.addEventListener("mousemove", function (ev) {
        showTip("<b>" + esc(name) + "</b><div class='row'><span>Proyectos únicos</span><span>" + r.proyectos + "</span></div><div class='row'><span>Horas</span><span>" + nf(r.horas) + "</span></div><div class='row'><span>% del código</span><span>" + nf(r.horas / T.horas_codigo * 100, 1) + " %</span></div>", ev);
      });
      hit.addEventListener("mouseleave", hideTip);
      svg.appendChild(hit);
    });
    box.appendChild(svg);
  }

  // ---------- PORTAFOLIO ----------
  var madLabel = { produccion: "Producción", mvp: "MVP", prototipo: "Prototipo", vacio: "Vacío" };
  var madPill = { produccion: "pill-good", mvp: "pill-warn", prototipo: "pill-warn", vacio: "pill-crit" };
  var fDom = $("#fDom");
  Object.keys(domLabel).forEach(function (k) {
    if (D.proyectos.some(function (p) { return p.dominio === k; })) {
      var o = document.createElement("option"); o.value = k; o.textContent = domLabel[k]; fDom.appendChild(o);
    }
  });
  function potDots(n) {
    var s = "";
    for (var i = 1; i <= 5; i++) s += '<span class="dot" style="background:' + (i <= n ? "var(--s1)" : "var(--grid)") + '"></span>';
    return '<span style="display:inline-flex;gap:3px" aria-label="Potencial ' + n + ' de 5">' + s + "</span>";
  }
  function renderProjects() {
    var q = $("#q").value.trim().toLowerCase(), dom = fDom.value, mad = $("#fMad").value, dup = $("#fDup").value, sort = $("#fSort").value;
    var list = D.proyectos.filter(function (p) {
      if (dup === "uniq" && (p.duplicado_de)) return false;
      if (dom && p.dominio !== dom) return false;
      if (mad && p.madurez !== mad) return false;
      if (q && (p.name_humano + " " + p.que_es + " " + (p.repo || "")).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    list.sort(function (a, b) {
      if (sort === "pot") return b.potencial_comercial - a.potencial_comercial || b.horas_equipo_profesional - a.horas_equipo_profesional;
      if (sort === "nombre") return a.name_humano.localeCompare(b.name_humano, "es");
      return b.horas_equipo_profesional - a.horas_equipo_profesional;
    });
    $("#projTable tbody").innerHTML = list.map(function (p) {
      var name = esc(p.name_humano);
      if (p.url) name = '<a href="' + esc(p.url) + '" target="_blank" rel="noopener">' + name + "</a>";
      var tags = p.publico ? "" : ' <span class="chip">privado</span>';
      if (p.duplicado_de) tags += ' <span class="chip">variante</span>';
      return "<tr><td style='min-width:180px'><b>" + name + "</b>" + tags + "</td><td style='min-width:280px;color:var(--ink-2)'>" + esc(p.que_es) +
        "<div style='margin-top:4px;font-size:.8rem;color:var(--muted)'>" + esc(p.nota_potencial) + "</div></td><td>" + esc(domLabel[p.dominio] || p.dominio) +
        "</td><td><span class='" + madPill[p.madurez] + "'>" + madLabel[p.madurez] + "</span></td><td class='r'>" + nf(p.horas_equipo_profesional) +
        "</td><td class='r'>" + potDots(p.potencial_comercial) + "</td></tr>";
    }).join("") || "<tr><td colspan='6'>Sin resultados.</td></tr>";
    var h = list.reduce(function (a, p) { return a + (p.horas_equipo_profesional || 0); }, 0);
    $("#projNote").textContent = list.length + " proyectos · " + nf(h) + " horas. Los repos privados se describen sin enlace.";
  }
  ["#q", "#fDom", "#fMad", "#fDup", "#fSort"].forEach(function (s) { $(s).addEventListener("input", renderProjects); });
  renderProjects();

  // ---------- DIAGNÓSTICO Y FOCO ----------
  function fill(s) {
    return s.replace("{horas}", nf(T.horas)).replace("{fte}", nf(T.fte, 1)).replace("{profesiones}", T.profesiones)
      .replace("{repos}", T.repos).replace("{dup}", dupCount).replace("{unicos}", T.repos_unicos).replace("{hses}", nf(T.horas_sesiones))
      .replace("{cl}", Math.round(TF.cargas_empleador_cl * 100)).replace("{us}", Math.round(TF.cargas_empleador_us * 100))
      .replace("{meses}", TF.meses_actividad).replace("{usd}", nf(TF.usd_clp)).replace("{uf}", nf(TF.uf_clp)).replace("{fecha}", TF.fecha.split("-").reverse().join("-"));
  }
  $("#diag").innerHTML = C.diagnostico.map(function (d) {
    return '<div class="card"><span class="pill-' + d.tipo + '">' + d.etiqueta + '</span><h3 style="margin-top:10px">' + d.titulo + '</h3><ul class="list">' +
      d.puntos.map(function (p) { return "<li>" + fill(p) + "</li>"; }).join("") + "</ul></div>";
  }).join("");
  $("#focusLead").textContent = C.focoLead;
  $("#bets").innerHTML = C.apuestas.map(function (a) {
    return '<div class="card' + (a.principal ? " focus-main" : "") + '"><div class="rank">' + a.rango + '</div><h3 style="margin:6px 0 8px;font-size:1.15rem">' + a.titulo + "</h3>" +
      '<p style="color:var(--ink-2)">' + a.que + '</p><ul class="list">' + a.porque.map(function (p) { return "<li>" + p + "</li>"; }).join("") + "</ul>" +
      '<div class="divider"></div><div class="kv"><div class="k">Modelo</div><div class="v">' + a.modelo + '</div></div>' +
      '<div class="kv"><div class="k">Meta a 12 meses</div><div class="v"><b>' + a.meta + "</b></div></div>" +
      '<div class="callout" style="margin-top:12px;font-size:.9rem"><b>Primer paso:</b> ' + a.primerPaso + "</div></div>";
  }).join("") + '<div class="card" style="grid-column:1/-1"><span class="pill-crit">Dejar de hacer</span><p style="margin-top:8px;color:var(--ink-2)">' + C.congelar + "</p></div>";
  $("#horizons").innerHTML = C.horizontes.map(function (h) {
    return '<div class="card"><h3>' + h.titulo + '</h3><div class="when">' + h.cuando + '</div><ul class="list">' +
      h.acciones.map(function (a) { return "<li>" + a + "</li>"; }).join("") + '</ul><div class="divider"></div>' +
      h.kpis.map(function (k) { return '<div class="kpi-line"><span>' + k[0] + "</span><span>" + k[1] + "</span></div>"; }).join("") + "</div>";
  }).join("");
  $("#moneyRules").innerHTML = C.reglasDinero.map(function (r) {
    return '<div class="card"><h3>' + r.titulo + '</h3><p style="margin-top:6px;color:var(--ink-2)">' + r.texto + "</p></div>";
  }).join("");

  // ---------- CALCULADORA ----------
  var ids = ["gasto", "ahorro", "ingreso", "ret", "swr", "crec"];
  var saved = {};
  try { saved = JSON.parse(store.get("fi") || "{}") || {}; } catch (e) { saved = {}; }
  ids.forEach(function (id) { if (saved[id] != null) $("#" + id).value = saved[id]; });
  var sim = null;

  function calc() {
    var v = {};
    ids.forEach(function (id) { v[id] = parseFloat($("#" + id).value); });
    store.set("fi", JSON.stringify(v));
    $("#gastoO").textContent = clp(v.gasto);
    $("#ahorroO").textContent = clp(v.ahorro);
    $("#ingresoO").textContent = clp(v.ingreso);
    $("#retO").textContent = nf(v.ret, 1) + " %";
    $("#swrO").textContent = nf(v.swr, 2) + " %";
    $("#crecO").textContent = nf(v.crec, 0) + " %";

    var meta = v.gasto * 12 / (v.swr / 100);
    var rm = Math.pow(1 + v.ret / 100, 1 / 12) - 1;
    var w = v.ahorro, inc = v.ingreso, pts = [{ t: 0, w: w }], months = null;
    for (var m = 1; m <= 12 * 50; m++) {
      if (m % 12 === 1 && m > 1) inc *= 1 + v.crec / 100;
      w = w * (1 + rm) + Math.max(0, inc - v.gasto);
      if (m % 12 === 0) pts.push({ t: m / 12, w: w });
      if (months === null && w >= meta) months = m;
      if (months !== null && m >= months + 24 && m % 12 === 0) break;
    }
    var save = v.ingreso - v.gasto;
    $("#fiNum").textContent = clp(meta);
    $("#fiNumSub").textContent = "≈ " + usd(meta / TF.usd_clp) + " · " + nf(meta / TF.uf_clp) + " UF. Gasto anual ÷ tasa de retiro.";
    $("#fiSave").textContent = clpShort(Math.max(0, save));
    $("#fiRate").textContent = save > 0 ? nf(save / v.ingreso * 100) + " % de tu ingreso" : "gastas más de lo que ganas";
    $("#fiPassive").textContent = clpShort(v.ahorro * v.swr / 100 / 12);
    if (months !== null) {
      var yrs = months / 12;
      $("#fiYears").textContent = yrs < 1 ? "< 1" : nf(yrs, 1);
      $("#fiYear").textContent = "en " + (2026 + Math.ceil(yrs + 0.25)) + " aprox.";
    } else {
      $("#fiYears").textContent = "50+";
      $("#fiYear").textContent = "sube el ahorro o el ingreso";
    }
    sim = { pts: pts, meta: meta, months: months };
    drawFI();
  }

  function drawFI() {
    if (!sim) return;
    var box = $("#fiChart"); box.innerHTML = "";
    var W = Math.max(300, box.clientWidth), H = 240, L = 64, R = 12, TP = 10, B = 26;
    var pts = sim.pts, meta = sim.meta;
    var maxT = pts[pts.length - 1].t || 1;
    var maxY = Math.max(meta * 1.1, pts[pts.length - 1].w);
    var sx = function (t) { return L + t / maxT * (W - L - R); };
    var sy = function (y) { return TP + (1 - y / maxY) * (H - TP - B); };
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H });
    var step = niceStep(maxY / 4);
    for (var g = 0; g <= maxY; g += step) {
      svg.appendChild(svgEl("line", { x1: L, x2: W - R, y1: sy(g), y2: sy(g), class: "gridline", "stroke-width": 1 }));
      var gt = svgEl("text", { x: L - 8, y: sy(g) + 4, "text-anchor": "end", class: "num" }); gt.textContent = clpShort(g); svg.appendChild(gt);
    }
    var xStep = maxT > 30 ? 10 : maxT > 12 ? 5 : maxT > 6 ? 2 : 1;
    for (var x = 0; x <= maxT; x += xStep) {
      var xt = svgEl("text", { x: sx(x), y: H - 6, "text-anchor": "middle", class: "num" }); xt.textContent = String(2026 + x); svg.appendChild(xt);
    }
    svg.appendChild(svgEl("line", { x1: L, x2: W - R, y1: sy(0), y2: sy(0), class: "axis", "stroke-width": 1 }));
    var d = pts.map(function (p, i) { return (i ? "L" : "M") + sx(p.t).toFixed(1) + "," + sy(p.w).toFixed(1); }).join("");
    var area = d + "L" + sx(pts[pts.length - 1].t) + "," + sy(0) + "L" + sx(0) + "," + sy(0) + "Z";
    svg.appendChild(svgEl("path", { d: area, fill: cssVar("--s1"), "fill-opacity": 0.1 }));
    svg.appendChild(svgEl("path", { d: d, fill: "none", stroke: cssVar("--s1"), "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round" }));
    svg.appendChild(svgEl("line", { x1: L, x2: W - R, y1: sy(meta), y2: sy(meta), stroke: cssVar("--s2"), "stroke-width": 2 }));
    var ml = svgEl("text", { x: W - R, y: sy(meta) - 6, "text-anchor": "end", class: "val" }); ml.textContent = "Meta " + clpShort(meta); svg.appendChild(ml);
    if (sim.months !== null) {
      var ty = sim.months / 12;
      svg.appendChild(svgEl("circle", { cx: sx(ty), cy: sy(meta), r: 5, fill: cssVar("--s1"), stroke: cssVar("--surface"), "stroke-width": 2 }));
    }
    var cross = svgEl("line", { x1: 0, x2: 0, y1: TP, y2: H - B, stroke: cssVar("--axis"), "stroke-width": 1, opacity: 0 });
    var dot = svgEl("circle", { r: 5, fill: cssVar("--s1"), stroke: cssVar("--surface"), "stroke-width": 2, opacity: 0 });
    svg.appendChild(cross); svg.appendChild(dot);
    var hit = svgEl("rect", { x: L, y: 0, width: W - L - R, height: H, fill: "transparent" });
    hit.addEventListener("mousemove", function (ev) {
      var r = svg.getBoundingClientRect();
      var t = Math.round((ev.clientX - r.left) / r.width * W - L) / (W - L - R) * maxT;
      var p = pts[Math.max(0, Math.min(pts.length - 1, Math.round(t)))];
      cross.setAttribute("x1", sx(p.t)); cross.setAttribute("x2", sx(p.t)); cross.setAttribute("opacity", 1);
      dot.setAttribute("cx", sx(p.t)); dot.setAttribute("cy", sy(p.w)); dot.setAttribute("opacity", 1);
      showTip("<b>" + (2026 + p.t) + "</b><div class='row'><span>Patrimonio</span><span>" + clp(p.w) + "</span></div><div class='row'><span>Avance a la meta</span><span>" + nf(Math.min(100, p.w / meta * 100)) + " %</span></div>", ev);
    });
    hit.addEventListener("mouseleave", function () { cross.setAttribute("opacity", 0); dot.setAttribute("opacity", 0); hideTip(); });
    svg.appendChild(hit);
    box.appendChild(svg);
  }
  function niceStep(raw) {
    var p = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
  }
  var PRESETS = {
    hoy: { gasto: 2500000, ahorro: 10000000, ingreso: 4000000, ret: 4.5, swr: 3.5, crec: 5 },
    plan: { gasto: 2500000, ahorro: 10000000, ingreso: 12000000, ret: 4.5, swr: 3.5, crec: 10 }
  };
  function markPreset(name) {
    document.querySelectorAll("[data-preset]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.preset === name)); });
  }
  document.querySelectorAll("[data-preset]").forEach(function (b) {
    b.addEventListener("click", function () {
      var pr = PRESETS[b.dataset.preset];
      ids.forEach(function (id) { $("#" + id).value = pr[id]; });
      markPreset(b.dataset.preset); calc();
    });
  });
  ids.forEach(function (id) { $("#" + id).addEventListener("input", function () { markPreset(null); calc(); }); });
  calc();

  // ---------- PROMPT Y MÉTODO ----------
  $("#promptBox").textContent = D.prompt_maestro;
  $("#copyPrompt").addEventListener("click", function () {
    var b = this;
    var done = function () { b.textContent = "Copiado"; setTimeout(function () { b.textContent = "Copiar prompt"; }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(D.prompt_maestro).then(done, function () { });
  });
  $("#methodList").innerHTML = C.metodo.map(function (m) { return "<li>" + fill(m) + "</li>"; }).join("");
  $("#sources").innerHTML = D.fuentes.map(function (f) { return '<li><a href="' + esc(f.url) + '" target="_blank" rel="noopener">' + esc(f.txt) + "</a></li>"; }).join("");

  // ---------- render responsivo ----------
  function renderCharts() { drawCost(); drawDomains(); drawFI(); }
  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(renderCharts, 120); });
  if (window.matchMedia) window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", renderCharts);
  renderCharts();
})();
