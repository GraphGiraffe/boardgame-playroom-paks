#!/usr/bin/python3
"""Regenerate the original 101 deck. Requires PyGObject/Rsvg, Cairo and Pillow."""
import hashlib
import io
import json
import subprocess
from pathlib import Path

import cairo
import gi
from PIL import Image

gi.require_version("Rsvg", "2.0")
from gi.repository import Rsvg

PACK = Path(__file__).resolve().parents[1] / "packs/one-oh-one"
PAPER = "#fffaf0"
# Elemental Brawl exports its public geometry and ink for other pack authors.
ELEMENTS = {"red": "fire", "yellow": "earth", "green": "air", "blue": "water"}
TINTS = {"red": "#f8e7de", "yellow": "#f6ecd5", "green": "#e6efe5", "blue": "#e3edf2"}
RANKS = "2 3 4 5 6 7 8 9 10 J Q K A".split()


def text(x, y, size, value, color, anchor="middle"):
    return (f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family="DejaVu Sans" '
            f'font-weight="bold" font-size="{size}" fill="{color}">{value}</text>')


def face(color, rank, variant, art):
    element = ELEMENTS[color]
    ink, emblem = art["colors"][element], art["ink"][element]
    effect = {"6": "+1" if variant == "penalty" else "↻", "7": "+2", "8": "↻",
              "10": "⇄", "Q": "✦", "K": "+5" if color == "red" else "+4", "A": "⊘"}.get(rank)
    background = TINTS[color]
    index = text(14, 39, 32, rank, "#3b403a", "start")
    center = (f'<g color="{ink}" transform="translate(-7 29) scale(2.14)">{emblem}</g>'
              f'<circle cx="100" cy="140" r="32" fill="{PAPER}" opacity=".85"/>'
              + text(100, 152, 35, effect or rank, "#302e29"))
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="180" height="252" viewBox="0 0 200 280">'
            f'<rect x="2" y="2" width="196" height="276" rx="15" fill="{background}" stroke="#d7c6a4" stroke-width="4"/>'
            f'{center}{index}<g transform="rotate(180 100 140)">{index}</g></svg>')


def main():
    provider = PACK.parent / "mage-brawl/presentation/rule-illustrations.js"
    load = """global.PlayroomViews={helpers:{playerColor:String,translator:()=>({format:o=>o.key})}};
              const {ink,colors}=require(process.argv[1]);process.stdout.write(JSON.stringify({ink,colors}));"""
    art = json.loads(subprocess.check_output(["node", "-e", load, str(provider)]))
    for color in ELEMENTS:
        for rank in RANKS:
            for variant in (("penalty", "cover") if rank == "6" else ("",)):
                document = Rsvg.Handle.new_from_data(face(color, rank, variant, art).encode())
                surface = cairo.ImageSurface(cairo.FORMAT_ARGB32, 180, 252)
                box = Rsvg.Rectangle()
                box.width, box.height = 180, 252
                document.render_document(cairo.Context(surface), box)
                png = io.BytesIO()
                surface.write_to_png(png)
                path = PACK / "assets" / f"elements-{color}-{rank}{variant}.webp"
                Image.open(png).save(path, "WEBP", quality=92, method=4)
    ledger = PACK / "sdk/assets.json"
    records = json.loads(ledger.read_text())
    for name, record in records.items():
        record["sha256"] = hashlib.sha256((PACK / name).read_bytes()).hexdigest()
    ledger.write_text(json.dumps(records, indent=2) + "\n")


if __name__ == "__main__":
    main()
