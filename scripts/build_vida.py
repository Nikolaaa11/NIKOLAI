"""Arma public/vida/data.js con los datos de investigación (data/vida/*.json) y el prompt maestro.

Uso: python3 scripts/build_vida.py
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "data", "vida")

URL = re.compile(r"https?://[^\s;,)]+")


def primera_url(v):
    if not isinstance(v, str):
        return v
    m = URL.search(v)
    return m.group(0) if m else v


def normalizar(o):
    """Deja una sola URL en los campos de fuente/url para que los enlaces funcionen."""
    if isinstance(o, dict):
        out = {}
        for k, v in o.items():
            if k in ("fuente", "url") and isinstance(v, str):
                out[k] = primera_url(v)
            else:
                out[k] = normalizar(v)
        return out
    if isinstance(o, list):
        return [normalizar(x) for x in o]
    return o


def cargar(nombre):
    p = os.path.join(SRC, nombre)
    return normalizar(json.load(open(p))) if os.path.exists(p) else {}


finanzas = cargar("finanzas.json")
lugares = cargar("lugares.json")
vida = cargar("vida.json")

HOY = "2026-09-25"
MESES = {"ene": 1, "feb": 2, "mar": 3, "abr": 4, "may": 5, "jun": 6, "jul": 7, "ago": 8, "sep": 9, "set": 9, "oct": 10, "nov": 11, "dic": 12}


def fechas_en(texto):
    """Todas las fechas reconocibles en un texto libre (ISO, 9-oct-2026, 20-24 abr 2027, marzo 2027)."""
    t = texto.lower()
    out = []
    for y, m, d in re.findall(r"(20\d\d)-(\d\d)-(\d\d)", t):
        out.append("%s-%s-%s" % (y, m, d))
    for d, mes, y in re.findall(r"(\d{1,2})(?:\s*-\s*\d{1,2})?[\s\-]+(?:de\s+)?([a-z]{3})[a-z]*\.?[\s\-]+(?:de\s+)?\(?(20\d\d)", t):
        if mes in MESES:
            out.append("%s-%02d-%02d" % (y, MESES[mes], int(d)))
    if not out:  # solo mes y año cuando no hay fechas con día
        for mes, y in re.findall(r"(?<![0-9a-z])([a-z]{3})[a-z]*\.?\s+(?:de\s+)?(20\d\d)", t):
            if mes in MESES:
                out.append("%s-%02d-01" % (y, MESES[mes]))
    return sorted(set(out))


for o in vida.get("oportunidades", []):
    texto = str(o.get("fecha_o_ventana") or "")
    futuras = [f for f in fechas_en(texto) if f >= HOY]
    o["proxima"] = futuras[0] if futuras else None
    o["estado"] = "permanente" if "permanente" in texto.lower() else ("abierta" if futuras else "por_confirmar")

macro = finanzas.get("macro", {})


def valor(x, defecto):
    if isinstance(x, dict):
        for k in ("valor", "observado", "valor_observado"):
            if isinstance(x.get(k), (int, float)):
                return x[k]
    return x if isinstance(x, (int, float)) else defecto


mercado = {
    "fecha": "2026-09-25",
    "uf": valor(macro.get("uf"), 41016.28),
    "usd": valor(macro.get("dolar") or macro.get("dolar_observado") or macro.get("usd"), 946),
    "utm": valor(macro.get("utm"), 71721),
}

datos = {
    "mercado": mercado,
    "finanzas": finanzas,
    "lugares": lugares,
    "vida": vida,
    "prompt": open(os.path.join(ROOT, "PROMPT_PLAN_DE_VIDA.md")).read(),
}
dest = os.path.join(ROOT, "public", "vida", "data.js")
with open(dest, "w") as f:
    f.write("// Generado por scripts/build_vida.py — no editar a mano.\n")
    f.write("window.VIDA = " + json.dumps(datos, ensure_ascii=False) + ";\n")
print("mercado:", mercado)
print("instrumentos:", len(finanzas.get("instrumentos", [])), "ciudades:", len(lugares.get("ciudades", [])),
      "vacaciones:", len(lugares.get("vacaciones", [])), "oportunidades:", len(vida.get("oportunidades", [])),
      "bytes:", os.path.getsize(dest))
