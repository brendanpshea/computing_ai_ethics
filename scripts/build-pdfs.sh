#!/usr/bin/env bash
# Build the 12 lecture PDFs into PDFs/.
#
# Portable counterpart to build.ps1, for Linux/macOS and CI. Same pipeline:
# pdflatex -> biber -> pdflatex -> pdflatex, run from the project root so that
# \input{lecture_preamble.tex} and images/... resolve.
#
#   ./scripts/build-pdfs.sh          # all 12 decks
#   ./scripts/build-pdfs.sh 4        # just lecture 4
#
# Requires: pdflatex, biber (TeX Live with beamer, metropolis, plex, tcolorbox,
# fontawesome5, pgf/tikz, booktabs, biblatex).
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SRC=latex
OUT=PDFs
mkdir -p "$OUT"

# pdflatex must find lecture_preamble.tex in latex/; biber must find refs.bib at
# the project root. Both are resolved relative to the directory we run from.
export TEXINPUTS="./$SRC:${TEXINPUTS:-}"
export BIBINPUTS="$ROOT:${BIBINPUTS:-}"
export max_print_line=1000

DECKS=(
  ai_ethics_01_history
  ai_ethics_02_virtues
  ai_ethics_03_free_speech
  ai_ethics_04_intellectual_property
  ai_ethics_05_crypto
  ai_ethics_06_privacy
  ai_ethics_07_ai
  ai_ethics_08_work
  ai_ethics_09_impact
  ai_ethics_10_doomsday
  ai_ethics_11_robot_rights
  ai_ethics_12_games
)

if [ $# -gt 0 ]; then
  n=$(printf '%02d' "$1" 2>/dev/null || echo "$1")
  mapfile -t DECKS < <(printf '%s\n' "${DECKS[@]}" | grep "_${n}_") || true
  [ ${#DECKS[@]} -eq 0 ] && { echo "No deck matching '$1'"; exit 2; }
fi

fail=0
for deck in "${DECKS[@]}"; do
  printf '%-38s' "$deck"
  if ! pdflatex -interaction=nonstopmode -halt-on-error \
        -output-directory "$OUT" "$SRC/$deck.tex" >"$OUT/$deck.pass1.log" 2>&1; then
    echo "FAILED (pass 1) — see $OUT/$deck.pass1.log"
    fail=1; continue
  fi
  biber --quiet "$OUT/$deck" >"$OUT/$deck.biber.log" 2>&1 \
    || { echo "FAILED (biber) — see $OUT/$deck.biber.log"; fail=1; continue; }
  pdflatex -interaction=nonstopmode -output-directory "$OUT" "$SRC/$deck.tex" >/dev/null 2>&1
  pdflatex -interaction=nonstopmode -output-directory "$OUT" "$SRC/$deck.tex" \
        >"$OUT/$deck.pass3.log" 2>&1

  undef=$(grep -c 'Citation.*undefined' "$OUT/$deck.pass3.log" || true)
  pages=$(grep -oP 'Output written.*\(\K[0-9]+' "$OUT/$deck.pass3.log" | head -1)
  if [ "$undef" != "0" ]; then
    echo "built (${pages}pp) — WARNING: $undef undefined citation(s)"
    fail=1
  else
    echo "ok (${pages}pp)"
  fi
done

# Keep only the PDFs; drop the LaTeX scratch files.
find "$OUT" -type f \( -name '*.aux' -o -name '*.log' -o -name '*.out' -o -name '*.nav' \
  -o -name '*.snm' -o -name '*.toc' -o -name '*.vrb' -o -name '*.fls' -o -name '*.bcf' \
  -o -name '*.fdb_latexmk' -o -name '*.run.xml' -o -name '*.bbl' -o -name '*.blg' \) -delete

built=$(find "$OUT" -maxdepth 1 -name 'ai_ethics_*.pdf' | wc -l)
echo "---"
echo "$built lecture PDF(s) in $OUT/"
exit $fail
