// Contenido editorial del plan de vida (recomendaciones propias, no datos de mercado).
window.CONTENIDO = {
  perfilEjemplo: {
    nombre: "Nikolai", edad: 32, ciudad: "Santiago", hogar: "solo",
    ingresoNeto: 4000000, gastoMensual: 2500000, arriendo: 800000,
    liquidez: 3000000, inversiones: 7000000, prevision: 15000000, inmobiliario: 0, deudaCara: 0,
    riesgo: "media", gastoLibertad: 3000000, techoGasto: 4500000, tasaAhorroMeta: 0.5, swr: 3.5,
    escenario: "base", mercado: "base", ingresoVariable: true, peso: 78,
    vivienda: { comprar: true, anio: 2030, precioUF: 5500, pie: 20, tasa: 4.1, plazo: 25 },
    rueda: { dinero: 5, negocio: 6, salud: 6, deporte: 5, alimentacion: 5, relaciones: 6, estudios: 6, descanso: 4 }
  },

  areasRueda: [
    ["dinero", "Dinero y patrimonio"], ["negocio", "Negocio y carrera"], ["salud", "Salud"], ["deporte", "Deporte"],
    ["alimentacion", "Alimentación"], ["relaciones", "Relaciones"], ["estudios", "Estudios"], ["descanso", "Descanso y ocio"]
  ],

  // Reparto del gasto mensual (sin vivienda). Pesos relativos.
  presupuesto: [
    { id: "alimentacion", nombre: "Alimentación (súper + feria)", peso: 22, tab: "alimentacion" },
    { id: "hogar", nombre: "Servicios del hogar (luz, agua, gas, internet, celular)", peso: 9 },
    { id: "transporte", nombre: "Transporte", peso: 11 },
    { id: "salud", nombre: "Salud, isapre/Fonasa y seguros", peso: 12, tab: "salud" },
    { id: "deporte", nombre: "Deporte (gimnasio, equipo, inscripciones)", peso: 5, tab: "deporte" },
    { id: "estudios", nombre: "Estudios y libros", peso: 7, tab: "estudios" },
    { id: "vacaciones", nombre: "Vacaciones (fondo mensual)", peso: 11, tab: "vacaciones" },
    { id: "ocio", nombre: "Salidas, restaurantes y ocio", peso: 10 },
    { id: "personal", nombre: "Ropa y cuidado personal", peso: 6 },
    { id: "regalos", nombre: "Familia, regalos y donaciones", peso: 4 },
    { id: "imprevistos", nombre: "Imprevistos", peso: 3 }
  ],

  ordenDinero: [
    { t: "Págate primero", d: "El día que entra la plata, una transferencia automática mueve tu tasa de ahorro meta a inversión. Vives con lo que queda." },
    { t: "Colchón de emergencia", d: "6 meses de gasto (12 si tu ingreso es variable) en un fondo money market o depósito a plazo renovable. Es lo que te deja decir que no a un mal cliente." },
    { t: "Cero deuda cara", d: "Tarjetas, líneas de crédito y consumo se pagan antes de invertir: ninguna inversión rinde lo que cobran." },
    { t: "APV hasta donde convenga", d: "Régimen A si tu tasa marginal es baja (bonificación del Estado); régimen B si es alta (rebaja de impuestos). Dentro del APV, fondos indexados de bajo costo." },
    { t: "Núcleo global indexado", d: "El grueso del ahorro de largo plazo va a un fondo o ETF global de bajo costo. Aportes mensuales automáticos, sin mirar el mercado." },
    { t: "Renta fija en UF según tu edad", d: "La parte que no va a acciones va a renta fija en UF (protege de la inflación). Aumenta con los años." },
    { t: "Pie de vivienda (si es meta)", d: "Si vas a comprar, junta el pie en un bolsillo separado de renta fija corta. No lo mezcles con la inversión de largo plazo." },
    { t: "Negocio con tope", d: "Tu empresa se financia con sus propias utilidades. Máximo 20 % de ellas va a productos nuevos, y solo después de cumplir la meta de ingreso recurrente." }
  ],

  cuentas: [
    { n: "Cuenta de ingresos", d: "Aquí llegan pagos de clientes y sueldo. No se usa para gastar." },
    { n: "Inversión automática", d: "Día de pago +1: transferencia programada por tu tasa de ahorro (APV + fondo global + renta fija)." },
    { n: "Cuenta de gastos fijos", d: "Arriendo o dividendo, servicios, seguros, suscripciones. Todo con PAC o PAT." },
    { n: "Tarjeta de gasto semanal", d: "Monto fijo semanal para súper, salidas y variables. Si se acaba, se acaba." },
    { n: "Bolsillos con meta", d: "Vacaciones, pie de vivienda, estudios y colchón: cada uno con su saldo visible." }
  ],

  evitar: [
    "Concentrar tu patrimonio en el mismo ecosistema del que depende tu ingreso.",
    "Fondos con comisiones altas cuando existe una alternativa indexada equivalente.",
    "Elegir acciones individuales o hacer trading con dinero de largo plazo.",
    "Cripto por sobre el 5 % del patrimonio financiero.",
    "Comprar vivienda con un dividendo sobre el 25 % del ingreso neto.",
    "Seguros con ahorro incluido (mezclan protección con inversión cara)."
  ],

  apps: [
    { nombre: "Back-office con IA para fondos y holdings", base: "ERP del fondo + Presupuestos + generador de documentos regulatorios", decision: "vender", inicio: "2026-T4",
      cliente: "FIP, AGF, family offices y holdings con líneas CORFO", modelo: "Implementación UF 150–300 + UF 30–60/mes", mrr: [0, 6000000, 15000000, 22000000],
      puntajes: { mercado: 4, ventaja: 5, esfuerzo: 3, tiempo: 3 }, siguiente: "Acuerdo de propiedad intelectual con el fondo y 2 clientes piloto." },
    { nombre: "FibraZero (trazabilidad Ley REP)", base: "SaaS multiempresa ya en producción", decision: "vender", inicio: "2026-T4",
      cliente: "Valorizadores, gestores y marcas textiles", modelo: "Plan mensual por empresa", mrr: [300000, 2500000, 4500000, 7000000],
      puntajes: { mercado: 4, ventaja: 4, esfuerzo: 5, tiempo: 4 }, siguiente: "Piloto a contrato pagado, dominio propio y 10 reuniones." },
    { nombre: "Consultoría técnica express", base: "Estudios de mercado, due diligence BESS, auditoría RAM, barridos geoespaciales", decision: "vender", inicio: "2026-T4",
      cliente: "Pymes de energía, minería, construcción y fondos", modelo: "Precio fijo CLP 3–15 M por entregable", mrr: [3000000, 6000000, 6000000, 5000000],
      puntajes: { mercado: 4, ventaja: 5, esfuerzo: 4, tiempo: 5 }, siguiente: "Página con 4 servicios, precios y un caso anonimizado." },
    { nombre: "Copiloto CORFO (postulaciones con IA)", base: "Experiencia en PTEC, BID Lab, Semilla y respuestas formales", decision: "siguiente", inicio: "2027-T2",
      cliente: "Pymes, startups y consultoras que postulan a fondos públicos", modelo: "Plan por postulación + honorario de éxito", mrr: [0, 1000000, 3000000, 5000000],
      puntajes: { mercado: 4, ventaja: 4, esfuerzo: 3, tiempo: 3 }, siguiente: "Probarlo primero como servicio en 3 postulaciones reales." },
    { nombre: "RAM PdM-IA (confiabilidad minera)", base: "Auditoría RAM/RCM y mantenimiento predictivo con IA", decision: "siguiente", inicio: "2027-T1",
      cliente: "Plantas mineras e industriales", modelo: "Piloto pagado + licencia anual por planta", mrr: [0, 1500000, 4000000, 8000000],
      puntajes: { mercado: 4, ventaja: 4, esfuerzo: 2, tiempo: 2 }, siguiente: "Un piloto pagado con datos reales de una planta." },
    { nombre: "Screener de arbitraje BESS por nodo", base: "Metodología del caso de batería presentado a un banco", decision: "siguiente", inicio: "2027-T3",
      cliente: "Desarrolladores PMGD, bancos y fondos de energía", modelo: "Informe por nodo + suscripción de datos", mrr: [0, 500000, 2500000, 4000000],
      puntajes: { mercado: 3, ventaja: 4, esfuerzo: 3, tiempo: 3 }, siguiente: "Vender 3 informes antes de automatizar." },
    { nombre: "Licencia Chile (prueba de manejo)", base: "App con ~700 preguntas, simulacro y monitor de cupos", decision: "siguiente", inicio: "2027-T1",
      cliente: "Postulantes a licencia clase B", modelo: "Gratis con anuncios + premium de pago único", mrr: [0, 300000, 800000, 1200000],
      puntajes: { mercado: 3, ventaja: 2, esfuerzo: 5, tiempo: 4 }, siguiente: "Dominio, SEO y alianza con 2 escuelas de conductores." },
    { nombre: "Marketplace EPC, wellness, arriendo de oficinas, Bitácora, apps personales", base: "Prototipos sin cliente", decision: "congelar", inicio: "—",
      cliente: "—", modelo: "Se retoma solo si un cliente lo pide y lo paga", mrr: [0, 0, 0, 0],
      puntajes: { mercado: 2, ventaja: 2, esfuerzo: 2, tiempo: 1 }, siguiente: "Archivar y documentar. Bitácora vuelve solo si se adjudica el CORFO." }
  ],

  coaches: [
    { id: "patrimonio", nombre: "Coach Patrimonio", ini: "P", color: "--s1", foco: "Ahorro, inversión, previsión e impuestos",
      pregunta: "¿Qué parte del ingreso de este mes ya quedó invertida?",
      metricas: ["Tasa de ahorro", "Meses de colchón", "Patrimonio financiero vs meta"],
      acciones: ["Programar la transferencia automática del día de pago", "Abrir o revisar APV y elegir régimen", "Rebalancear una vez al año, en enero"],
      tipos: ["inversion"] },
    { id: "negocios", nombre: "Coach Negocios", ini: "N", color: "--s2", foco: "Clientes, precios e ingreso recurrente",
      pregunta: "¿Qué vendiste esta semana y a quién?",
      metricas: ["MRR", "Clientes que pagan", "Reuniones de venta por semana"],
      acciones: ["10 reuniones de venta al mes", "Precio publicado para cada producto", "Un caso de éxito por trimestre"],
      tipos: ["aceleradora", "inversion"] },
    { id: "oportunidades", nombre: "Coach Oportunidades", ini: "O", color: "--s3", foco: "Fondos, licitaciones, eventos y alianzas",
      pregunta: "¿Qué ventana se cierra en los próximos 30 días?",
      metricas: ["Postulaciones enviadas", "Eventos con reuniones agendadas", "Monto adjudicado"],
      acciones: ["Revisar el radar cada lunes", "Postular a 1 fondo por trimestre", "Ir a 1 feria del sector por semestre con reuniones agendadas"],
      tipos: ["financiamiento", "licitacion", "evento", "regulacion"] },
    { id: "carrera", nombre: "Coach Carrera y Estudios", ini: "C", color: "--s4", foco: "Habilidades, idiomas, red y certificaciones",
      pregunta: "¿Qué habilidad multiplica más tu ingreso el próximo año?",
      metricas: ["Horas de estudio por semana", "Nivel de inglés", "Contactos nuevos de calidad al mes"],
      acciones: ["Inglés 3 h/semana hasta C1", "Un curso de ventas B2B y negociación", "Almorzar con 2 personas clave al mes"],
      tipos: ["mentoria"] },
    { id: "hogar", nombre: "Coach Hogar y Lugar", ini: "H", color: "--s5", foco: "Dónde vivir, vivienda y movilidad",
      pregunta: "¿Este lugar te acerca a tus clientes, a la naturaleza y a tu gente?",
      metricas: ["Costo de vivienda / ingreso", "Tiempo de traslado diario", "Días al año en la naturaleza"],
      acciones: ["Decidir comprar o arrendar con números, no con ansiedad", "Probar 1 mes de trabajo remoto fuera de Santiago", "Mantener el dividendo bajo el 25 % del ingreso"],
      tipos: [] },
    { id: "salud", nombre: "Coach Salud", ini: "S", color: "--s1", foco: "Chequeos, sueño y salud mental",
      pregunta: "¿Cuándo fue tu último chequeo y qué dijo?",
      metricas: ["Horas de sueño", "Presión arterial", "Perfil lipídico y glicemia"],
      acciones: ["Agendar el EMPA o chequeo preventivo anual", "Dentista cada 6 meses", "Dormir 7–9 horas con horario fijo"],
      tipos: [] },
    { id: "deporte", nombre: "Coach Deporte", ini: "D", color: "--s2", foco: "Fuerza, cardio y eventos",
      pregunta: "¿Cuántos minutos de actividad hiciste esta semana?",
      metricas: ["Minutos de zona 2 por semana", "Sesiones de fuerza", "Un evento al año"],
      acciones: ["3 sesiones de fuerza a la semana", "150 minutos de cardio suave", "Inscribirte hoy al próximo evento"],
      tipos: [] },
    { id: "alimentacion", nombre: "Coach Alimentación", ini: "A", color: "--s3", foco: "Plato, proteína, compras y preparación",
      pregunta: "¿Qué vas a comer el martes, y ya está comprado?",
      metricas: ["Proteína diaria", "Comidas cocinadas en casa", "Porciones de verdura"],
      acciones: ["Menú semanal el domingo", "Compra en feria + súper una vez por semana", "Cocinar 2 bases para 3 días"],
      tipos: [] },
    { id: "vida", nombre: "Coach Vida y Descanso", ini: "V", color: "--s4", foco: "Vacaciones, relaciones y propósito",
      pregunta: "¿Cuándo es tu próximo descanso real y ya está reservado?",
      metricas: ["Días de vacaciones reales al año", "Tiempo con personas importantes", "Horas sin pantalla"],
      acciones: ["Reservar las vacaciones del año en enero", "Un fin de semana largo fuera por trimestre", "Un día a la semana sin trabajo"],
      tipos: [] }
  ],

  fases: [
    { desde: 2026, hasta: 2026, nombre: "Ordenar y cobrar" },
    { desde: 2027, hasta: 2027, nombre: "Empaquetar y vender" },
    { desde: 2028, hasta: 2028, nombre: "Escalar el ingreso recurrente" },
    { desde: 2029, hasta: 2029, nombre: "Consolidar y delegar" },
    { desde: 2030, hasta: 2032, nombre: "Acelerar el patrimonio" },
    { desde: 2033, hasta: 2099, nombre: "Libertad parcial: elegir proyectos" }
  ],

  metasNegocio: {
    2026: "Acuerdo de propiedad intelectual con el fondo; 2 pilotos pagados; FibraZero con primer contrato.",
    2027: "6 clientes que pagan; versión multiempresa del ERP; primer colaborador de apoyo.",
    2028: "15 clientes; canal con contadores y abogados; ingreso recurrente CLP 15–20 M/mes.",
    2029: "Equipo de 3–5 personas; tú en ventas y producto, no en operación.",
    2030: "Segunda línea de producto (RAM o BESS) con clientes; evaluar socios o inversión.",
    2031: "Ingreso recurrente que no depende de tus horas; decidir si vender, crecer o mantener.",
    default: "Negocio que funciona sin ti día a día; tú eliges proyectos y clientes."
  },

  menu: [
    { dia: "Lunes", des: "Avena con yogur, plátano y nueces", alm: "Porotos con riendas y ensalada de tomate", cen: "Tortilla de verduras con pan integral", col: "Fruta + puñado de maní" },
    { dia: "Martes", des: "Huevos revueltos, palta y pan integral", alm: "Merluza al horno con papas y ensalada", cen: "Ensalada completa con quinoa y pollo", col: "Yogur natural" },
    { dia: "Miércoles", des: "Avena con leche, manzana y canela", alm: "Lentejas con arroz y ensalada chilena", cen: "Crema de zapallo y huevo duro", col: "Zanahoria y hummus" },
    { dia: "Jueves", des: "Pan integral con queso fresco y tomate", alm: "Pollo al horno con verduras asadas", cen: "Reineta a la plancha con ensalada", col: "Fruta de estación" },
    { dia: "Viernes", des: "Yogur con granola sin azúcar y berries", alm: "Charquicán con huevo", cen: "Libre (comida fuera, sin culpa)", col: "Nueces" },
    { dia: "Sábado", des: "Huevos con tomate y palta", alm: "Cazuela de vacuno o ave", cen: "Pizza casera integral con verduras", col: "Fruta" },
    { dia: "Domingo", des: "Panqueques de avena y plátano", alm: "Asado magro o pescado + ensaladas", cen: "Sopa de verduras y sándwich de pollo", col: "Yogur" }
  ],

  compras: [
    ["Feria (verduras y frutas)", "Tomate, lechuga, zanahoria, zapallo, cebolla, brócoli, palta, fruta de estación (7–10 porciones de fruta a la semana)"],
    ["Proteínas", "Pollo, pescado 2 veces a la semana (merluza, reineta, jurel), huevos (12–18), legumbres secas (porotos, lentejas, garbanzos)"],
    ["Lácteos", "Yogur natural, leche, quesillo o queso fresco"],
    ["Granos", "Avena, arroz, quinoa, pan integral, papas"],
    ["Grasas buenas", "Aceite de oliva, nueces, maní, palta"],
    ["Evitar en el carro", "Bebidas azucaradas, productos con muchos sellos \"ALTO EN\", ultraprocesados"]
  ],

  semanaDeporte: [
    { dia: "Lunes", s: "Fuerza A", d: "Sentadilla, press banca, remo. 45 min." },
    { dia: "Martes", s: "Zona 2", d: "45 min de bici, trote suave o caminata en subida. Puedes hablar sin ahogarte." },
    { dia: "Miércoles", s: "Fuerza B", d: "Peso muerto, press militar, dominadas asistidas. 45 min." },
    { dia: "Jueves", s: "Intervalos + movilidad", d: "6 × 3 min fuerte / 2 min suave + 15 min de movilidad." },
    { dia: "Viernes", s: "Deporte social", d: "Pádel, fútbol o escalada con amigos." },
    { dia: "Sábado", s: "Salida larga al aire libre", d: "Cerro (Manquehue, San Cristóbal, La Campana) 2–3 h." },
    { dia: "Domingo", s: "Descanso activo", d: "Caminata, elongación y preparar la semana." }
  ],

  progresionDeporte: [
    { anio: 2027, meta: "Correr 10K sin parar; 3 sesiones de fuerza fijas", evento: "Una carrera de 10K" },
    { anio: 2028, meta: "Media maratón o trail 21K", evento: "Maratón de Santiago (21K) o un trail" },
    { anio: 2029, meta: "Circuito W o O de Torres del Paine", evento: "Trekking Torres del Paine" },
    { anio: 2030, meta: "Maratón, trail largo o travesía en Patagonia", evento: "Patagonian International Marathon u otro" },
    { anio: 2031, meta: "Mantener VO2max alto y fuerza (peso muerto ≈ 1,5× tu peso)", evento: "Un evento de aventura al año" }
  ],

  estudiosPlan: [
    { anio: 2026, que: "Ventas B2B y negociación", por: "Tu cuello de botella es cobrar, no construir." },
    { anio: 2027, que: "Inglés C1 (con certificación)", por: "Abre clientes, socios e inversionistas fuera de Chile." },
    { anio: 2028, que: "Diplomado en gestión de fondos o finanzas corporativas", por: "Formaliza lo que ya haces y da credibilidad frente a AGF y bancos." },
    { anio: 2029, que: "Liderazgo y gestión de equipos", por: "Pasas de hacer a dirigir." },
    { anio: 2030, que: "Programa ejecutivo o MBA (opcional)", por: "Solo si buscas levantar capital o vender la empresa." }
  ],

  libros: [
    "$100M Offers (Alex Hormozi) — cómo armar ofertas que se venden",
    "The Mom Test (Rob Fitzpatrick) — conversar con clientes sin engañarte",
    "Psicología del dinero (Morgan Housel)",
    "El inversor inteligente, cap. 8 y 20 (Benjamin Graham)",
    "Outlive (Peter Attia) — salud y longevidad",
    "Hábitos atómicos (James Clear)",
    "Traction (Gabriel Weinberg) — canales de venta",
    "Die With Zero (Bill Perkins) — gastar bien la vida, no solo ahorrar"
  ],

  etapasVivir: [
    { desde: 2026, hasta: 2028, texto: "Santiago, cerca de clientes y del fondo. Arrienda donde el traslado sea corto; no compres mientras el ingreso es variable y el colchón no está completo." },
    { desde: 2029, hasta: 2031, texto: "Base en Santiago con vivienda propia si el plan lo permite, y 1–2 meses al año de trabajo remoto en regiones (Puerto Varas, Viña/Concón)." },
    { desde: 2032, hasta: 2099, texto: "Vida híbrida: base en Chile y temporadas largas donde elijas (Patagonia, Lisboa, Nueva Zelanda). El negocio ya no depende de estar presente." }
  ],

  bucketPorAnio: {
    2027: "Torres del Paine (circuito W)",
    2028: "San Pedro de Atacama + Salar de Uyuni",
    2029: "Nueva Zelanda (3 semanas)",
    2030: "Japón en primavera",
    2031: "Carretera Austral completa",
    2032: "Europa por 1 mes trabajando remoto",
    2033: "Isla de Pascua",
    default: "Un viaje largo al año elegido en enero"
  }
};
