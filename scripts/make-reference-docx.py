#!/usr/bin/env python3
"""
make-reference-docx.py
Creates reference.docx at the project root for use by Pandoc's --reference-doc flag.

Steps:
  1. Extract Pandoc's built-in default reference.docx as a starting point.
  2. Add custom paragraph styles matching the HTML chapter CSS classes.
  3. Download apa.csl (APA 7th ed.) alongside reference.docx.

Run once before building docx files:
    python scripts/make-reference-docx.py
"""

import subprocess
import sys
import urllib.request
from pathlib import Path

from docx import Document
from docx.oxml        import OxmlElement
from docx.oxml.ns     import qn
from docx.shared      import Pt, RGBColor
from docx.enum.style  import WD_STYLE_TYPE

ROOT     = Path(__file__).resolve().parent.parent
REF_DOCX = ROOT / "reference.docx"
CSL_FILE = ROOT / "apa.csl"

# ── Color palette (mirrors styles.css) ───────────────────────────────────────

BLUE_MID    = RGBColor(0x1a, 0x4a, 0x8a)
BLUE_XLIGHT = "F0F6FF"
GOLD_MID    = RGBColor(0xc8, 0x96, 0x1c)
GOLD_XLIGHT = "FFFBF0"
GREEN_MID   = RGBColor(0x2e, 0x7d, 0x32)
GREEN_XLIGHT= "F4FFF4"
RED_MID     = RGBColor(0xc6, 0x28, 0x28)
RED_XLIGHT  = "FFF5F5"
PURPLE_MID  = RGBColor(0x6a, 0x1b, 0x9a)
PURPLE_XLIGHT="FAF0FF"
GRAY_MID    = RGBColor(0x54, 0x6e, 0x7a)
GRAY_XLIGHT = "F8F9FA"
BLUE_DARK   = RGBColor(0x00, 0x28, 0x55)
TEXT_COLOR  = RGBColor(0x1a, 0x1a, 0x1a)

# ── XML helpers ───────────────────────────────────────────────────────────────

def get_or_add_pPr(style):
    """Return the <w:pPr> element for a paragraph style, creating it if absent."""
    pPr = style.element.find(qn("w:pPr"))
    if pPr is None:
        pPr = OxmlElement("w:pPr")
        style.element.insert(0, pPr)
    return pPr


def set_left_border(style, color_hex: str, sz: int = 24, space: int = 6):
    """Add a thick left border to a paragraph style."""
    pPr  = get_or_add_pPr(style)
    pBdr = pPr.find(qn("w:pBdr"))
    if pBdr is None:
        pBdr = OxmlElement("w:pBdr")
        pPr.append(pBdr)
    left = OxmlElement("w:left")
    left.set(qn("w:val"),   "single")
    left.set(qn("w:sz"),    str(sz))     # 1/8 pt units; 24 = 3 pt
    left.set(qn("w:space"), str(space))
    left.set(qn("w:color"), color_hex)
    pBdr.append(left)


def set_box_border(style, color_hex: str, sz: int = 12):
    """Add a box (all four sides) border to a paragraph style."""
    pPr  = get_or_add_pPr(style)
    pBdr = pPr.find(qn("w:pBdr"))
    if pBdr is None:
        pBdr = OxmlElement("w:pBdr")
        pPr.append(pBdr)
    for side in ("top", "left", "bottom", "right"):
        el = OxmlElement(f"w:{side}")
        el.set(qn("w:val"),   "single")
        el.set(qn("w:sz"),    str(sz))
        el.set(qn("w:space"), "4")
        el.set(qn("w:color"), color_hex)
        pBdr.append(el)


def set_shading(style, fill_hex: str):
    """Set paragraph background shading."""
    pPr = get_or_add_pPr(style)
    shd = pPr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        pPr.append(shd)
    shd.set(qn("w:val"),   "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"),  fill_hex)


def set_indent(style, left_twips: int = 180):
    """Set left indentation in twips (1 twip = 1/20 pt)."""
    pPr = get_or_add_pPr(style)
    ind = pPr.find(qn("w:ind"))
    if ind is None:
        ind = OxmlElement("w:ind")
        pPr.append(ind)
    ind.set(qn("w:left"), str(left_twips))


def set_space(style, before: int = 60, after: int = 60):
    """Set space-before/after in twips."""
    pPr  = get_or_add_pPr(style)
    spng = pPr.find(qn("w:spacing"))
    if spng is None:
        spng = OxmlElement("w:spacing")
        pPr.append(spng)
    spng.set(qn("w:before"), str(before))
    spng.set(qn("w:after"),  str(after))


# ── Style factory ─────────────────────────────────────────────────────────────

def add_style(doc, name, base_name="Normal"):
    """Add a new paragraph style, or return existing one."""
    styles = doc.styles
    try:
        return styles[name]
    except KeyError:
        pass
    base  = styles[base_name]
    style = styles.add_style(name, WD_STYLE_TYPE.PARAGRAPH)
    style.base_style = base
    style.font.name = "Calibri"
    style.font.size = Pt(11)
    return style


def make_box_style(doc, name, border_rgb: RGBColor, bg_hex: str,
                   border_hex: str, box_border=False, bold_label=False):
    style = add_style(doc, name)
    set_shading(style, bg_hex)
    if box_border:
        set_box_border(style, border_hex, sz=12)
    else:
        set_left_border(style, border_hex, sz=24)
    set_indent(style, left_twips=144)   # ~0.1 in
    set_space(style, before=60, after=60)
    style.font.color.rgb = TEXT_COLOR
    if bold_label:
        style.font.bold = True
    return style


# ── Build reference.docx ──────────────────────────────────────────────────────

def main():
    # 1. Extract Pandoc's default reference.docx
    print("Extracting Pandoc default reference.docx ...")
    result = subprocess.run(
        ["pandoc", "--print-default-data-file", "reference.docx"],
        capture_output=True, cwd=str(ROOT)
    )
    if result.returncode != 0:
        sys.exit(f"pandoc failed: {result.stderr.decode()}")
    REF_DOCX.write_bytes(result.stdout)
    print(f"  Written: {REF_DOCX}")

    # 2. Open and augment with custom styles
    doc = Document(str(REF_DOCX))

    # ── Box styles ─────────────────────────────────────────────────────
    make_box_style(doc, "Definition Box",
                   BLUE_MID,   bg_hex="F0F6FF", border_hex="1A4A8A", box_border=True)

    make_box_style(doc, "Argument Box",
                   BLUE_MID,   bg_hex="F0F6FF", border_hex="1A4A8A")

    make_box_style(doc, "Key Thinker",
                   PURPLE_MID, bg_hex="FAF0FF", border_hex="6A1B9A")

    make_box_style(doc, "Case Study",
                   GOLD_MID,   bg_hex="FFFBF0", border_hex="C8961C")

    make_box_style(doc, "Pro Argument",
                   GREEN_MID,  bg_hex="F4FFF4", border_hex="2E7D32")

    make_box_style(doc, "Objection",
                   RED_MID,    bg_hex="FFF5F5", border_hex="C62828")

    make_box_style(doc, "Thought Questions",
                   GOLD_MID,   bg_hex="FFFBF0", border_hex="C8961C")

    make_box_style(doc, "Key Points",
                   GREEN_MID,  bg_hex="F4FFF4", border_hex="2E7D32")

    make_box_style(doc, "Central Questions",
                   BLUE_MID,   bg_hex="F0F6FF", border_hex="1A4A8A")

    make_box_style(doc, "Block Quote",
                   GRAY_MID,   bg_hex="F8F9FA", border_hex="546E7A")

    # ── Within-box label / title styles ───────────────────────────────
    lbl = add_style(doc, "Box Label")
    lbl.font.bold      = True
    lbl.font.size      = Pt(8.5)
    lbl.font.color.rgb = GRAY_MID
    lbl.font.all_caps  = True
    set_space(lbl, before=0, after=30)

    ttl = add_style(doc, "Box Title")
    ttl.font.bold      = True
    ttl.font.size      = Pt(11.5)
    ttl.font.color.rgb = BLUE_DARK
    set_space(ttl, before=30, after=40)

    dfn_term = add_style(doc, "Definition Term")
    dfn_term.font.bold      = True
    dfn_term.font.color.rgb = BLUE_DARK
    set_space(dfn_term, before=40, after=10)

    dfn_body = add_style(doc, "Definition Body")
    dfn_body.font.color.rgb = TEXT_COLOR
    set_indent(dfn_body, left_twips=180)
    set_space(dfn_body, before=0, after=40)

    conc = add_style(doc, "Argument Conclusion")
    conc.font.bold      = True
    conc.font.color.rgb = BLUE_DARK
    set_indent(conc, left_twips=180)
    set_space(conc, before=40, after=40)

    # ── Chapter header styles ──────────────────────────────────────────
    eyebrow = add_style(doc, "Chapter Eyebrow")
    eyebrow.font.name      = "Calibri"
    eyebrow.font.size      = Pt(10)
    eyebrow.font.bold      = True
    eyebrow.font.all_caps  = True
    eyebrow.font.color.rgb = BLUE_MID
    set_space(eyebrow, before=0, after=20)

    subtitle = add_style(doc, "Chapter Subtitle")
    subtitle.font.name      = "Calibri"
    subtitle.font.size      = Pt(14)
    subtitle.font.italic    = True
    subtitle.font.color.rgb = GRAY_MID
    set_space(subtitle, before=20, after=120)

    doc.save(str(REF_DOCX))
    print(f"  Custom styles added. Saved: {REF_DOCX}")

    # 3. Download APA 7th ed. CSL
    if not CSL_FILE.exists():
        csl_url = (
            "https://raw.githubusercontent.com/"
            "citation-style-language/styles/master/apa.csl"
        )
        print(f"\nDownloading APA CSL -> {CSL_FILE} ...")
        try:
            urllib.request.urlretrieve(csl_url, str(CSL_FILE))
            print("  Done.")
        except Exception as e:
            print(f"  Warning: could not download CSL ({e}).")
            print("  Citations will use Pandoc's default style (Chicago author-date).")
    else:
        print(f"\nAPA CSL already present: {CSL_FILE}")

    print("\nSetup complete. Run:  npm run build-docx")


if __name__ == "__main__":
    main()
