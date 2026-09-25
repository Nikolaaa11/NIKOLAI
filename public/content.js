// Contenido editorial: diagnóstico, apuestas y plan. Los números vienen de data.js.
window.CONTENT = {
  diagnostico: [
    {
      tipo: "good",
      etiqueta: "Fortaleza",
      titulo: "Capacidad de un equipo de ~24 personas",
      puntos: [
        "En ~7 meses produjiste el equivalente a <b>{horas} horas</b> de trabajo profesional: <b>{fte} jornadas completas</b> sostenidas.",
        "<b>{profesiones} profesiones</b> distintas, de full-stack y arquitectura a abogado corporativo, controller, ingeniero eléctrico y consultor CORFO.",
        "No son maquetas: hay plataformas en producción con miles de tests (el ERP del fondo, Presupuestos, FibraZero, CSL) y más de 100 proyectos en Vercel."
      ]
    },
    {
      tipo: "good",
      etiqueta: "Ventaja injusta",
      titulo: "Dominio regulatorio + velocidad con IA",
      puntos: [
        "Pocas personas en Chile combinan <b>regulación de fondos</b> (FIP, CMF, CORFO, UAF, NCG 435) con la capacidad de <b>construir el software</b> que la cumple.",
        "Conoces a fondo energía (BESS, solar), minería (RAM/RCM), Ley REP y finanzas de pymes: sectores con presupuesto y dolor real.",
        "Tu método (prompts maestros, agentes, trazabilidad de cada cifra) es replicable y vendible."
      ]
    },
    {
      tipo: "warn",
      etiqueta: "Fuga",
      titulo: "El valor se crea, pero no se captura",
      puntos: [
        "La mayor parte de las horas fue para el ecosistema del fondo y sus empresas. Si eso no se refleja en tu sueldo, participación o regalías, <b>estás regalando un activo</b>.",
        "De {repos} repositorios, <b>{dup} son copias, variantes o están vacíos</b>. Cada idea nueva abre un repo nuevo en lugar de profundizar el que ya existe.",
        "Muchos prototipos no tienen cliente ni precio: se trabajan como hobby aunque cuestan cientos de horas."
      ]
    },
    {
      tipo: "crit",
      etiqueta: "Riesgo",
      titulo: "Concentración y orden",
      puntos: [
        "Casi todo depende de un solo ecosistema de clientes. Si esa relación cambia, tus ingresos cambian con ella.",
        "La propiedad intelectual de lo construido no está clara: sin un acuerdo escrito, lo que hiciste puede no ser tuyo.",
        "Algunos repositorios públicos contienen información de terceros. Con la nueva ley de datos personales, conviene pasarlos a privados y limpiarlos."
      ]
    }
  ],

  focoLead: "Tu problema no es la capacidad: es la captura. Hoy produces a ritmo de empresa y cobras como persona. El foco es convertir lo que ya construiste en ingresos recurrentes, con una apuesta principal que aproveche tu mayor activo y dos de apoyo que paguen las cuentas mientras crece.",

  apuestas: [
    {
      rango: "Apuesta principal",
      principal: true,
      titulo: "Back-office con IA para fondos, family offices y holdings",
      que: "Empaqueta el ERP del fondo, Presupuestos, el generador de documentos regulatorios y el control de cumplimiento como un servicio: implementas y operas el back-office financiero y regulatorio de otros FIP, AGF, family offices y holdings con líneas CORFO.",
      porque: [
        "Es tu activo más grande (más de 10.000 horas equivalentes) y ya funciona en producción con usuarios reales.",
        "El cliente paga caro por no tener multas ni errores: contabilidad, remuneraciones, F29/F22, informes CMF/CORFO y aportantes.",
        "Tu ventaja regulatoria es difícil de copiar para un software genérico (Nubox, Defontana)."
      ],
      modelo: "Implementación UF 150–300 + mensualidad UF 30–60 por fondo o holding. Empezar como servicio gestionado, no como SaaS autoservicio.",
      meta: "8 clientes a UF 45/mes ≈ CLP 15 millones al mes.",
      primerPaso: "Firmar con el fondo un acuerdo de propiedad intelectual o licencia (spin-off, regalía o participación) y conseguir 2 clientes piloto que paguen la implementación."
    },
    {
      rango: "Apoyo 1 · producto",
      titulo: "FibraZero: trazabilidad Ley REP",
      que: "El SaaS más listo para vender: multiempresa real, cobro con MercadoPago, contratos tipo y cientos de tests. La regulación empuja la demanda.",
      porque: [
        "Ya no necesita más código: necesita clientes.",
        "Ingreso recurrente con costo marginal casi cero.",
        "El piloto con el primer valorizador es la prueba social para los siguientes."
      ],
      modelo: "Planes mensuales por empresa (valorizadores, gestores y generadores). Validar el precio por kg antes de publicarlo.",
      meta: "15 empresas a CLP 300 mil/mes ≈ CLP 4,5 millones al mes.",
      primerPaso: "Convertir el piloto en contrato pagado, dominio propio y 10 reuniones con valorizadores y marcas textiles."
    },
    {
      rango: "Apoyo 2 · caja",
      titulo: "Consultoría técnica express con IA",
      que: "Vende como productos de precio fijo lo que ya hiciste varias veces: estudio de mercado, due diligence de BESS, auditoría RAM/RCM de planta, postulación CORFO y barrido geoespacial.",
      porque: [
        "Paga las cuentas mientras el producto crece: caja en semanas, no en meses.",
        "Cada proyecto te acerca a clientes que después compran el producto.",
        "Tu costo real es una fracción del precio de mercado gracias a la IA."
      ],
      modelo: "Precio fijo por entregable: CLP 3–15 millones según el alcance. Postulaciones CORFO: honorario fijo + éxito.",
      meta: "1 proyecto al mes ≈ CLP 6 millones al mes promedio.",
      primerPaso: "Una página con 4 servicios, precio y ejemplo real (anonimizado), y 20 correos a contactos de energía y minería."
    }
  ],

  congelar: "Congela (no borres) lo que no sirve a estas tres apuestas: marketplace EPC, wellness, arriendo de oficinas, suite Bitácora mientras no se adjudique el CORFO, juegos y apps personales. Regla: ninguna idea nueva hasta cumplir la meta de ingreso recurrente del trimestre.",

  horizontes: [
    {
      titulo: "0 a 90 días · Ordenar y cobrar",
      cuando: "oct – dic 2026",
      acciones: [
        "Acuerdo escrito con el fondo sobre la propiedad de las plataformas y tu compensación.",
        "Oferta y precios del back-office; 2 clientes piloto con implementación pagada.",
        "FibraZero: piloto → contrato pagado, dominio propio, 10 reuniones.",
        "4 servicios de consultoría con precio fijo; cerrar 2.",
        "Fondo de emergencia de 6 meses y ahorro automático del 30 %.",
        "Repos públicos con datos de terceros → privados."
      ],
      kpis: [["Ingreso recurrente (MRR)", "CLP 2 M"], ["Ventas de consultoría", "CLP 10 M"], ["Tasa de ahorro", "30 %"]]
    },
    {
      titulo: "3 a 6 meses · Empaquetar",
      cuando: "ene – mar 2027",
      acciones: [
        "Versión multiempresa del ERP (un código, varios clientes).",
        "Onboarding documentado: implementar un cliente en menos de 4 semanas.",
        "Casos de éxito publicados con permiso de los pilotos.",
        "Primer contrato de apoyo (operaciones o desarrollo junior) para liberar tu tiempo."
      ],
      kpis: [["Clientes que pagan", "6"], ["MRR", "CLP 7 M"], ["Tasa de ahorro", "40 %"]]
    },
    {
      titulo: "6 a 12 meses · Escalar",
      cuando: "abr – sep 2027",
      acciones: [
        "Canal con contadores, abogados y AGF que recomienden el servicio.",
        "Precios anuales con descuento para asegurar caja.",
        "Invertir cada mes el excedente en un portafolio indexado y diversificado.",
        "Reevaluar el foco con este mismo prompt maestro."
      ],
      kpis: [["Clientes que pagan", "15"], ["MRR", "CLP 15–20 M"], ["Tasa de ahorro", "50 %"]]
    }
  ],

  reglasDinero: [
    { titulo: "1 · Págate primero", texto: "El día que entra el ingreso, una transferencia automática mueve el 30 % (meta 50 %) a inversión. Vives con lo que queda." },
    { titulo: "2 · Colchón antes que riesgo", texto: "6 meses de gastos en un fondo money market o depósito a plazo. Con ingresos de emprendedor, el colchón es lo que te permite decir que no a malos clientes." },
    { titulo: "3 · Cero deuda cara", texto: "Tarjetas y créditos de consumo se pagan antes de invertir un peso: ninguna inversión rinde lo que cobra esa deuda." },
    { titulo: "4 · Núcleo aburrido y global", texto: "El núcleo del patrimonio va a fondos indexados globales de bajo costo (y APV si te conviene tributariamente). Tu capital humano ya está concentrado en Chile y en un solo ecosistema: no concentres también el financiero." },
    { titulo: "5 · Tope para ideas nuevas", texto: "Máximo 20 % de las utilidades del negocio se reinvierte en productos nuevos, y solo después de cumplir la meta de ingreso recurrente del trimestre." },
    { titulo: "6 · La casa es consumo", texto: "Si compras vivienda, que el dividendo no pase del 25 % del ingreso neto. La vivienda propia es seguridad, no la inversión que te da libertad." }
  ],

  metodo: [
    "<b>Medido</b>: 100 repositorios de GitHub (70 públicos, 30 privados, todos clonados y leídos), 100+ proyectos en Vercel, 211 sesiones de Claude y ~915 mil líneas de código brutas.",
    "<b>Deduplicado</b>: copias, versiones fechadas y repos vacíos se marcaron y no suman horas. Quedan {unicos} proyectos únicos.",
    "<b>Estimado</b>: horas que un equipo profesional competente necesitaría para producir lo que existe en cada repo (tamaño real del código, tests, integraciones, documentación). A eso se suman {hses} horas de trabajo no-código detectado en las sesiones (contratos, finanzas, postulaciones, estudios, presentaciones).",
    "<b>Tarifas</b>: tarifas de facturación de agencia o consultor en Chile (CLP/hora) y EE.UU. (USD/hora). El equipo mensual usa sueldos brutos con cargas del empleador ({cl}% Chile, {us}% EE.UU.) y {meses} meses de actividad.",
    "<b>Cambio</b>: USD 1 = CLP {usd} y UF = CLP {uf} al {fecha}.",
    "<b>Límites</b>: las horas son una estimación con incertidumbre de ±30 %. El análisis cubre lo que hay en la cuenta (código, despliegues y sesiones), no reuniones ni trabajo fuera de ella."
  ]
};
