// Motor del plan de vida: proyección anual en pesos de hoy (valores reales).
(function () {
  "use strict";

  var ANIO_BASE = 2026;

  // Crecimiento real del ingreso neto por escenario (índice 0 = paso 2026→2027).
  var CRECIMIENTO = {
    conservador: function (i) { return 0.05; },
    base: function (i) { return [0.6, 0.35, 0.2][i] != null ? [0.6, 0.35, 0.2][i] : (i < 10 ? 0.05 : 0.02); },
    optimista: function (i) { return [1.0, 0.5, 0.3, 0.15][i] != null ? [1.0, 0.5, 0.3, 0.15][i] : (i < 10 ? 0.06 : 0.03); }
  };

  // Rentabilidades reales anuales por clase de activo y escenario de mercado.
  var RENT = {
    conservador: { liquidez: 0.002, rf: 0.0125, acciones: 0.0325, vivienda: 0.000, prevision: 0.020 },
    base:        { liquidez: 0.0075, rf: 0.0225, acciones: 0.050, vivienda: 0.005, prevision: 0.035 },
    optimista:   { liquidez: 0.0125, rf: 0.0275, acciones: 0.063, vivienda: 0.015, prevision: 0.045 }
  };


  function pctAcciones(edad, riesgo) {
    var adj = riesgo === "baja" ? -15 : riesgo === "alta" ? 10 : 0;
    return Math.max(30, Math.min(90, 110 - edad + adj)) / 100;
  }

  function dividendoMensual(precioCLP, piePct, tasaAnual, plazoAnios) {
    var L = precioCLP * (1 - piePct / 100);
    var r = tasaAnual / 100 / 12, n = plazoAnios * 12;
    if (L <= 0) return 0;
    return r === 0 ? L / n : L * r / (1 - Math.pow(1 + r, -n));
  }

  function simular(P, M) {
    // P: perfil; M: mercado {uf, usd}
    var rent = RENT[P.mercado] || RENT.base;
    var crece = CRECIMIENTO[P.escenario] || CRECIMIENTO.base;
    var mesesColchon = P.ingresoVariable ? 12 : 6;
    var metaHoy = Math.max(P.gastoLibertad, P.gastoMensual) * 12 / (P.swr / 100);
    var precio = P.vivienda && P.vivienda.comprar ? P.vivienda.precioUF * M.uf : 0;
    var anioCompra = P.vivienda && P.vivienda.comprar ? P.vivienda.anio : null;
    var costoEntrada = precio * (P.vivienda ? (P.vivienda.pie + 3) / 100 : 0); // pie + ~3 % gastos
    var div = precio ? dividendoMensual(precio, P.vivienda.pie, P.vivienda.tasa, P.vivienda.plazo) : 0;
    var r = P.vivienda ? P.vivienda.tasa / 100 / 12 : 0;

    var s = {
      liquidez: P.liquidez, rf: 0, acciones: 0, fondoVivienda: 0,
      viviendaValor: P.inmobiliario > 0 ? P.inmobiliario : 0, hipoteca: 0,
      prevision: P.prevision, deuda: P.deudaCara
    };
    var inv0 = P.inversiones, pa0 = pctAcciones(P.edad, P.riesgo);
    s.acciones = inv0 * pa0; s.rf = inv0 * (1 - pa0);

    var ingresoMes = P.ingresoNeto, propia = false;
    var gastoBase = Math.max(0, P.gastoMensual - P.arriendo), vivMes = P.arriendo;
    var gastoMes = gastoBase + vivMes;
    var filas = [], hitosVistos = {}, anioLibertad = null;

    function snapshot(anio, extra) {
      var fin = s.liquidez + s.rf + s.acciones;
      var inmo = s.viviendaValor - s.hipoteca;
      var total = fin + s.fondoVivienda + inmo + s.prevision - s.deuda;
      var meta = Math.max(P.gastoLibertad, gastoMes) * 12 / (P.swr / 100);
      var f = {
        anio: anio, edad: P.edad + (anio - ANIO_BASE),
        liquidez: s.liquidez, rf: s.rf, acciones: s.acciones, fondoVivienda: s.fondoVivienda,
        inmobiliario: inmo, prevision: s.prevision, deuda: s.deuda,
        financiero: fin, total: total, meta: meta, pctMeta: Math.min(1, fin / meta), hitos: []
      };
      for (var k in extra) f[k] = extra[k];
      var H = [
        ["colchon", s.liquidez >= mesesColchon * gastoMes, "Colchón completo (" + mesesColchon + " meses)"],
        ["sinDeuda", s.deuda <= 0 && P.deudaCara > 0, "Cero deuda cara"],
        ["100musd", total >= 100000 * M.usd, "Patrimonio de USD 100 mil"],
        ["250musd", total >= 250000 * M.usd, "Patrimonio de USD 250 mil"],
        ["vivienda", propia, "Vivienda propia"],
        ["mitad", fin >= meta / 2, "Mitad del camino a la libertad"],
        ["1musd", total >= 1e6 * M.usd, "Patrimonio de USD 1 millón"],
        ["libertad", fin >= meta, "Libertad financiera"]
      ];
      H.forEach(function (h) {
        if (h[1] && !hitosVistos[h[0]]) { hitosVistos[h[0]] = anio; f.hitos.push(h[2]); }
      });
      if (fin >= meta && anioLibertad === null) anioLibertad = anio;
      return f;
    }

    filas.push(snapshot(ANIO_BASE, { ingresoAnual: ingresoMes * 12, gastoAnual: gastoMes * 12, ahorro: (ingresoMes - gastoMes) * 12, tasaAhorro: (ingresoMes - gastoMes) / ingresoMes, apv: 0, pctAcc: pa0, dividendo: 0, hoy: true }));

    var anioFin = ANIO_BASE + Math.max(10, 65 - P.edad);
    for (var anio = ANIO_BASE + 1; anio <= Math.min(anioFin, 2070); anio++) {
      var i = anio - ANIO_BASE - 1;
      var g = crece(i);
      ingresoMes *= 1 + g;
      // El gasto sube hasta dejar la tasa de ahorro meta, con tope de +15 % real al año.
      var tasaMeta = P.tasaAhorroMeta != null ? P.tasaAhorroMeta : 0.5;
      var techo = P.techoGasto || Infinity;
      var objetivo = Math.min(ingresoMes * (1 - tasaMeta), techo) - vivMes;
      gastoBase = Math.max(gastoBase * 1.01, Math.min(objetivo, gastoBase * 1.15));
      var edad = P.edad + (anio - ANIO_BASE);

      // Compra de vivienda
      var dividendoAnio = 0;
      if (anioCompra && anio === anioCompra && !propia) {
        var disponible = s.fondoVivienda + s.rf + s.acciones;
        if (disponible >= costoEntrada) {
          var falta = costoEntrada;
          var usar = Math.min(s.fondoVivienda, falta); s.fondoVivienda -= usar; falta -= usar;
          usar = Math.min(s.rf, falta); s.rf -= usar; falta -= usar;
          s.acciones -= falta;
          s.viviendaValor += precio; s.hipoteca = precio * (1 - P.vivienda.pie / 100);
          propia = true;
          vivMes = div + precio * 0.003 / 12; // sin arriendo; dividendo + contribuciones
        } else {
          anioCompra += 1; // se posterga un año si no alcanza el pie
        }
      }
      if (propia && s.hipoteca > 0) {
        for (var m = 0; m < 12 && s.hipoteca > 0; m++) {
          var interes = s.hipoteca * r;
          s.hipoteca = Math.max(0, s.hipoteca - (div - interes));
        }
        dividendoAnio = div * 12;
        if (s.hipoteca <= 0) vivMes = precio * 0.003 / 12; // hipoteca pagada: quedan contribuciones
      }

      gastoMes = gastoBase + vivMes;
      var ingresoAnual = ingresoMes * 12, gastoAnual = gastoMes * 12;
      var ahorro = ingresoAnual - gastoAnual;

      // Rentabilidad del año (sobre saldos iniciales)
      s.liquidez *= 1 + rent.liquidez;
      s.rf *= 1 + rent.rf;
      s.acciones *= 1 + rent.acciones;
      s.fondoVivienda *= 1 + rent.rf;
      s.viviendaValor *= 1 + rent.vivienda;
      s.prevision *= 1 + rent.prevision;

      var resto = ahorro, apv = 0, fl = { deuda: 0, colchon: 0, vivienda: 0, cartera: 0, desahorro: 0 };
      if (resto < 0) { s.liquidez += resto; fl.desahorro = -resto; resto = 0; }
      // 1) deuda cara
      var pagoDeuda = Math.min(resto, s.deuda); s.deuda -= pagoDeuda; resto -= pagoDeuda; fl.deuda = pagoDeuda;
      // 2) colchón
      var faltaColchon = Math.max(0, mesesColchon * gastoMes - s.liquidez);
      var aColchon = Math.min(resto, faltaColchon); s.liquidez += aColchon; resto -= aColchon; fl.colchon = aColchon;
      // 3) fondo para el pie
      if (anioCompra && !propia && anio < anioCompra) {
        var aniosRest = anioCompra - anio;
        var necesita = Math.max(0, costoEntrada - s.fondoVivienda) / aniosRest;
        var aViv = Math.min(resto, necesita); s.fondoVivienda += aViv; resto -= aViv; fl.vivienda = aViv;
      }
      // 4) APV (envoltorio del ahorro de largo plazo; tope 600 UF al año)
      apv = Math.min(resto * 0.3, 600 * M.uf);
      // 5) cartera de largo plazo según edad y riesgo, con rebalanceo anual
      var pa = pctAcciones(edad, P.riesgo);
      fl.cartera = resto;
      var cartera = s.acciones + s.rf + resto;
      s.acciones = cartera * pa; s.rf = cartera * (1 - pa);

      filas.push(snapshot(anio, {
        ingresoAnual: ingresoAnual, gastoAnual: gastoAnual, ahorro: ahorro,
        tasaAhorro: ingresoAnual > 0 ? ahorro / ingresoAnual : 0, apv: apv, pctAcc: pa, dividendo: dividendoAnio, flujos: fl
      }));
      if (anioLibertad !== null && anio >= anioLibertad + 5 && edad >= Math.min(P.edad + 10, 65)) break;
    }

    return {
      filas: filas, meta: metaHoy, anioLibertad: anioLibertad, hitos: hitosVistos,
      dividendoMensual: div, costoEntrada: costoEntrada, mesesColchon: mesesColchon
    };
  }

  window.VidaEngine = { simular: simular, pctAcciones: pctAcciones, dividendoMensual: dividendoMensual, RENT: RENT, ANIO_BASE: ANIO_BASE };
})();
