#!/usr/bin/env python3
"""
Generate Julia-set fractal backgrounds for lecture title slides.

Color scheme matches lecture_preamble.tex:
  mPrimary  #1E3A5F  deep navy
  mAccent   #D4880A  warm amber

Output: images/fractal_0N.png  (1920×1080, 16:9)
Usage:  python generate_fractals.py
"""

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
from pathlib import Path

OUT_DIR = Path(__file__).parent / "images"
OUT_DIR.mkdir(exist_ok=True)

# ── Color palette ────────────────────────────────────────────────────────────
# Interior (inside set) → slow escape → fast escape
CMAP = LinearSegmentedColormap.from_list("ethics", [
    (0.00, "#0A1628"),   # deepest midnight (interior of set)
    (0.08, "#1E3A5F"),   # primary navy
    (0.25, "#1A5F7A"),   # teal transition
    (0.45, "#2E8B6A"),   # muted green-teal
    (0.65, "#8B5A00"),   # dark amber
    (0.80, "#D4880A"),   # accent amber
    (0.92, "#F0C060"),   # bright gold
    (1.00, "#FDF0D5"),   # near-white cream (fastest escape)
])

# ── Julia parameters — one per lecture ───────────────────────────────────────
# (c_real, c_imag, x_center, y_center, zoom, label, lecture_title)
FRACTALS = [
    (-0.7269,  0.1889,  0.00,  0.00, 1.30, "fractal_01", "History of IT"),
    (-0.4000,  0.6000,  0.00,  0.00, 1.40, "fractal_02", "Virtue Ethics"),
    (-0.8000,  0.1560,  0.00,  0.00, 1.30, "fractal_03", "Free Speech"),
    ( 0.2850,  0.0100,  0.00,  0.00, 1.50, "fractal_04", "Intellectual Property"),
    (-0.7269,  0.1889, -0.32,  0.07, 4.50, "fractal_05", "Cryptography"),
    (-0.1620,  1.0400,  0.00,  0.00, 1.30, "fractal_06", "Privacy"),
    ( 0.3550,  0.3550,  0.00,  0.00, 1.40, "fractal_07", "Artificial Intelligence"),
    (-0.1230,  0.7450,  0.00,  0.00, 1.30, "fractal_08", "Work & Labor"),
]

WIDTH, HEIGHT = 1920, 1080
MAX_ITER = 300


def julia(c_real, c_imag, xc, yc, zoom):
    """Smooth (continuous) Julia set escape times, shape (HEIGHT, WIDTH)."""
    c = complex(c_real, c_imag)
    xs = np.linspace(xc - 1.6 / zoom, xc + 1.6 / zoom, WIDTH)
    ys = np.linspace(yc - 0.9 / zoom, yc + 0.9 / zoom, HEIGHT)
    Z = xs[np.newaxis, :] + 1j * ys[:, np.newaxis]

    M = np.zeros(Z.shape)
    escaped = np.zeros(Z.shape, dtype=bool)

    for i in range(1, MAX_ITER + 1):
        alive = ~escaped
        Z[alive] = Z[alive] ** 2 + c
        new_esc = alive & (np.abs(Z) > 2.0)
        # Smooth escape: subtract fractional overshoot for banding-free color
        absZ = np.abs(Z[new_esc])
        M[new_esc] = i - np.log2(np.log2(np.maximum(absZ, 1.0001)))
        escaped |= new_esc

    M[~escaped] = 0.0      # interior stays dark
    return M


def vignette(shape, strength=0.55):
    """Radial vignette mask — darkens edges, keeps centre bright."""
    h, w = shape
    yv = np.linspace(-1, 1, h)
    xv = np.linspace(-1, 1, w)
    X, Y = np.meshgrid(xv, yv)
    r = np.sqrt(X**2 + Y**2)
    mask = 1.0 - np.clip(r * strength, 0, 1) ** 2
    return mask


DARKNESS = 0.38   # 0 = black, 1 = full brightness — keep low so text stays readable


def render(M, filename):
    # Normalise escape values to [0, 1] with log compression
    display = M.copy()
    interior = display == 0
    exterior = ~interior
    if exterior.any():
        vals = display[exterior]
        vals = np.log1p(vals - vals.min())
        vals = (vals - vals.min()) / (vals.max() - vals.min() + 1e-12)
        display[exterior] = vals
    display[interior] = 0.0

    # Apply vignette to the normalised map so edges stay dark
    v = vignette(display.shape, strength=0.6)
    display = display * v

    # Pull brightness down so Metropolis title text remains legible
    display = display * DARKNESS

    fig = plt.figure(figsize=(WIDTH / 100, HEIGHT / 100), dpi=100)
    ax = fig.add_axes([0, 0, 1, 1])   # fill entire figure
    ax.imshow(display, cmap=CMAP, origin="lower", aspect="auto",
              interpolation="lanczos", vmin=0, vmax=1)
    ax.axis("off")

    out = OUT_DIR / f"{filename}.png"
    fig.savefig(out, dpi=100, pad_inches=0, facecolor="#0A1628")
    plt.close(fig)
    print(f"  → {out}")


def main():
    print(f"Rendering {len(FRACTALS)} fractal backgrounds to {OUT_DIR}/\n")
    for c_r, c_i, xc, yc, zoom, name, title in FRACTALS:
        print(f"  [{name}]  c = {c_r:+.4f}{c_i:+.4f}i   ({title})")
        M = julia(c_r, c_i, xc, yc, zoom)
        render(M, name)
    print("\nDone.")


if __name__ == "__main__":
    main()
