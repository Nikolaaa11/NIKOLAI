"""Une los análisis por repo, las sesiones y las tarifas en data/resumen.json y public/data.js.

Uso: python3 scripts/build_data.py
"""
import json
import os
import re
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")

tarifas = json.load(open(os.path.join(DATA, "tarifas.json")))
sesiones = json.load(open(os.path.join(DATA, "sesiones.json")))
proyectos = json.load(open(os.path.join(DATA, "proyectos.json")))
roles = {r["id"]: r for r in tarifas["roles"]}

# Palabras clave (sin tildes, minúsculas) -> rol canónico. El primero que calza gana.
MAPA = [
    (r"abogad|legal|juridic|quiebra", "abogado"),
    (r"compliance|cumplimiento", "abogado"),
    (r"esg|ambiental|\brep\b|respel|regulatori|sanitari|sostenib|huella|reciclaje|economia circular|salud|nutricion", "esg"),
    (r"viaje|turismo|trekking|montana", "asistente"),
    (r"grafic|audiovisual|video|ilustr|motion|fotograf|branding", "diseno_grafico"),
    (r"presentacion|informes|traductor|documentacion|copywriter$|redactor", "comunicaciones"),
    (r"\bqa\b|tester|sre", "qa_sre"),
    (r"seguridad de la informacion|arquitect|devops|cloud|infraestructura", "arquitecto"),
    (r"\bia\b|inteligencia artificial|machine learning|\bml\b|llm|prompt|automatiz|vision por computador", "ia"),
    (r"\bsig\b|\bgis\b|geoespacial|cartograf", "gis"),
    (r"remuneracion|controller|contador|contab|tesorer|auditor|cobranza|cuentas por pagar", "controller"),
    (r"datos|data|\bbi\b|business intelligence|base de datos|econometr", "datos"),
    (r"\bux\b|\bui\b|experiencia de usuario", "ux"),
    (r"product manager|gerente de producto|product owner|marketplace|monetizacion", "pm"),
    (r"full.?stack|desarrollador|developer|programador|frontend|front-end|backend|ingeniero de software|diseñador web|disenador web|audio|dsp", "dev_fullstack"),
    (r"inversion|fondo|portafolio|venture|private equity|m&a|gobierno corporativo|inversionistas", "inversiones"),
    (r"corfo|fundrais|postulacion|fondos publicos|subsidio|i\+d", "fundraising"),
    (r"financ|economist|modelad|credito", "fin_analista"),
    (r"electric|energia|solar|bess|fotovolta|renovable", "ing_energia"),
    (r"miner|minas|metalurg|mantenimiento|industrial|mecanic|confiabilidad|vibracion|piping|procesos \(|construccion|civil|inmobil|bim|edificacion|tasador|control documental", "ing_industrial"),
    (r"inmigracion|visa|mercado laboral|reclut|headhunter|coach|carrera|rrhh|recursos humanos|talento", "rrhh"),
    (r"tesis|metodolog|investigador|academ|bibliotec|literatura", "investigador"),
    (r"tutor|profesor|docente|instruccional|educa|pedagog|instructor", "educacion"),
    (r"marketing|growth|seo|email|contenido|community|copy", "mkt"),
    (r"ventas|comercial|business development|desarrollo de negocio|account", "ventas"),
    (r"project manager|proyecto|pmo|scrum|operaciones", "pmo"),
    (r"estrateg|mercado|consultor|analista de negocio|negocios|research|procesos|organizacional", "estrategia"),
    (r"soporte|tecnico ti|helpdesk", "soporte_ti"),
    (r"asistente|secretari|administrativ", "asistente"),
]

# Peso relativo de cada rol al repartir las horas de un repo.
PESO = {"dev_fullstack": 4, "arquitecto": 1.5, "ia": 1.5, "datos": 1.5, "ux": 1.5, "pm": 1, "qa_sre": 1}


def norm(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    return s


def canon(nombre):
    n = norm(nombre)
    for patron, rid in MAPA:
        if re.search(patron, n):
            return rid
    return "estrategia"


horas_rol = {rid: 0.0 for rid in roles}
horas_rol_codigo = {rid: 0.0 for rid in roles}
evidencia = {rid: [] for rid in roles}

for p in proyectos:
    if p.get("duplicado_de"):
        continue  # las variantes/copias no suman horas
    h = float(p.get("horas_equipo_profesional") or 0)
    ids = []
    for r in p.get("roles_profesionales") or []:
        rid = canon(r)
        if rid not in ids:
            ids.append(rid)
    if not ids or h <= 0:
        continue
    total_peso = sum(PESO.get(i, 1) for i in ids)
    for rid in ids:
        parte = h * PESO.get(rid, 1) / total_peso
        horas_rol[rid] += parte
        horas_rol_codigo[rid] += parte
        if len(evidencia[rid]) < 6:
            evidencia[rid].append(p["name_humano"])

horas_rol_sesiones = {rid: 0.0 for rid in roles}
for c in sesiones["categorias"]:
    if not c["rol"]:
        continue
    h = c["sesiones"] * c["horas_por_sesion"]
    horas_rol[c["rol"]] += h
    horas_rol_sesiones[c["rol"]] += h
    evidencia[c["rol"]] = (c["ejemplos"][:3] + evidencia[c["rol"]])[:6]

usd = tarifas["usd_clp"]
meses = tarifas["meses_actividad"]
hmes = tarifas["horas_mes_fte"]
filas = []
for rid, r in roles.items():
    h = round(horas_rol[rid])
    if h <= 0:
        continue
    fte = h / (meses * hmes)
    filas.append({
        "id": rid,
        "nombre": r["nombre"],
        "equipo": r["equipo"],
        "horas": h,
        "horas_codigo": round(horas_rol_codigo[rid]),
        "horas_sesiones": round(horas_rol_sesiones[rid]),
        "cl_hora": r["cl_hora"],
        "us_hora": r["us_hora"],
        "costo_cl_clp": h * r["cl_hora"],
        "costo_us_usd": h * r["us_hora"],
        "fte": round(fte, 2),
        "mensual_cl_clp": round(fte * r["cl_mes"] * (1 + tarifas["cargas_empleador_cl"])),
        "mensual_us_usd": round(fte * r["us_anual"] / 12 * (1 + tarifas["cargas_empleador_us"])),
        "evidencia": evidencia[rid],
    })
filas.sort(key=lambda f: -f["costo_cl_clp"])

equipos = {}
for f in filas:
    e = equipos.setdefault(f["equipo"], {"id": f["equipo"], "nombre": tarifas["equipos"][f["equipo"]], "horas": 0, "roles": [], "costo_cl_clp": 0, "costo_us_usd": 0})
    e["horas"] += f["horas"]
    e["roles"].append(f["nombre"])
    e["costo_cl_clp"] += f["costo_cl_clp"]
    e["costo_us_usd"] += f["costo_us_usd"]
equipos = sorted(equipos.values(), key=lambda e: -e["horas"])

unicos = [p for p in proyectos if not p.get("duplicado_de") and p.get("madurez") != "vacio"]
tot = {
    "repos": len(proyectos),
    "repos_unicos": len(unicos),
    "horas": sum(f["horas"] for f in filas),
    "horas_codigo": sum(f["horas_codigo"] for f in filas),
    "horas_sesiones": sum(f["horas_sesiones"] for f in filas),
    "costo_cl_clp": sum(f["costo_cl_clp"] for f in filas),
    "costo_us_usd": sum(f["costo_us_usd"] for f in filas),
    "mensual_cl_clp": sum(f["mensual_cl_clp"] for f in filas),
    "mensual_us_usd": sum(f["mensual_us_usd"] for f in filas),
    "fte": round(sum(f["fte"] for f in filas), 1),
    "profesiones": len(filas),
    "equipos": len(equipos),
}
tot["costo_cl_usd"] = round(tot["costo_cl_clp"] / usd)
tot["costo_us_clp"] = tot["costo_us_usd"] * usd
tot["mensual_cl_usd"] = round(tot["mensual_cl_clp"] / usd)
tot["mensual_us_clp"] = tot["mensual_us_usd"] * usd

dominios = {}
for p in unicos:
    d = dominios.setdefault(p["dominio"], {"dominio": p["dominio"], "proyectos": 0, "horas": 0})
    d["proyectos"] += 1
    d["horas"] += p.get("horas_equipo_profesional") or 0
dominios = sorted(dominios.values(), key=lambda d: -d["horas"])

prompt = open(os.path.join(ROOT, "PROMPT_MAESTRO.md")).read()

resumen = {
    "prompt_maestro": prompt,
    "tarifas": {k: tarifas[k] for k in ("fecha", "usd_clp", "uf_clp", "meses_actividad", "horas_mes_fte", "cargas_empleador_cl", "cargas_empleador_us")},
    "fuentes": tarifas["fuentes"],
    "totales": tot,
    "roles": filas,
    "equipos": equipos,
    "dominios": dominios,
    "sesiones": sesiones,
    "proyectos": proyectos,
}
json.dump(resumen, open(os.path.join(DATA, "resumen.json"), "w"), ensure_ascii=False, indent=1)
os.makedirs(os.path.join(ROOT, "public"), exist_ok=True)
with open(os.path.join(ROOT, "public", "data.js"), "w") as f:
    f.write("// Generado por scripts/build_data.py — no editar a mano.\n")
    f.write("window.DATA = " + json.dumps(resumen, ensure_ascii=False) + ";\n")

print(json.dumps(tot, indent=1))
for f in filas:
    print(f'{f["nombre"]:52s} {f["horas"]:6d} h  CL ${f["costo_cl_clp"]:>13,}  US ${f["costo_us_usd"]:>10,}  FTE {f["fte"]}')
