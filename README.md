# NIKOLAI · Radiografía profesional y plan de libertad financiera

Sitio estático que responde, con evidencia de la cuenta (GitHub, Vercel e historial de sesiones de Claude):

1. Qué trabajos y proyectos se han hecho.
2. Qué profesiones implica ese trabajo.
3. Cuánto costaría hacerlo con profesionales en **Chile (CLP)** y **EE.UU. (USD)**.
4. A cuántos equipos de una empresa solapa.
5. Dónde enfocarse para lograr la libertad financiera, con una calculadora interactiva.

## Plan de vida (`/vida`)

Dashboard con 15 pestañas (Resumen, Mi perfil, Dinero, Inversión, Patrimonio, Negocio y apps, Dónde vivir, Vacaciones, Alimentación, Salud, Deporte, Estudios, Coaches, Año a año, Prompt). El perfil es editable y todo se recalcula en el navegador con un motor de proyección anual (`public/vida/engine.js`). El prompt que lo genera está en `PROMPT_PLAN_DE_VIDA.md` y los datos de mercado y de vida, con fuente, en `data/vida/`.

```bash
python3 scripts/build_vida.py   # regenera public/vida/data.js
```

## Estructura

| Ruta | Qué es |
|---|---|
| `PROMPT_MAESTRO.md` | El prompt maestro que generó el análisis. Vuelve a correrlo cada trimestre. |
| `data/proyectos.json` | Análisis de los 100 repositorios (saneado: sin datos personales ni slugs de repos privados). |
| `data/sesiones.json` | Trabajo no-código detectado en las sesiones, por categoría. |
| `data/tarifas.json` | Tarifas por rol (Chile y EE.UU.), tipo de cambio, UF y fuentes. |
| `data/resumen.json` | Totales calculados (generado). |
| `scripts/build_data.py` | Une los datos, reparte horas por rol y calcula costos. Genera `public/data.js`. |
| `public/` | El sitio (HTML, CSS y JS sin dependencias ni build). |

## Actualizar

```bash
python3 scripts/build_data.py   # recalcula data/resumen.json y public/data.js
```

Vercel publica la carpeta `public/` (ver `vercel.json`). El sitio lleva `noindex` para que no aparezca en buscadores.

## Supuestos clave

- Horas = lo que tardaría un equipo profesional competente, no el tiempo real invertido con IA.
- Las copias, versiones fechadas y repos vacíos no suman horas.
- Tarifas de facturación de agencia o consultor; el costo de equipo mensual usa sueldos brutos más cargas del empleador.
- USD 1 = CLP 966 y UF = CLP 41.016 (25-sep-2026).
- Estimaciones con incertidumbre de ±30 %. No es asesoría financiera personalizada.
