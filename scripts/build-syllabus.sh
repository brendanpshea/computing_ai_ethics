#!/usr/bin/env bash
# Build the HTML syllabus from the markdown source.
#   Usage: bash scripts/build-syllabus.sh [term]
# Run from the project root. Output: syllabi/ai_ethics_syllabus_<term>.html
set -euo pipefail
TERM_ID="${1:-fa26}"
SRC="syllabi/ai_ethics_syllabus_${TERM_ID}.md"
OUT="syllabi/ai_ethics_syllabus_${TERM_ID}.html"
[ -f "$SRC" ] || { echo "no such syllabus: $SRC" >&2; exit 1; }

pandoc "$SRC" \
  -f gfm -t html5 --standalone \
  --template=scripts/syllabus-template.html \
  --lua-filter=scripts/syllabus-filter.lua \
  --toc --toc-depth=2 \
  --metadata title="Syllabus | PHIL 1150 Computing & AI Ethics | Fall 2026" \
  --metadata maintitle="Computing & AI Ethics" \
  --metadata subtitle="PHIL 1150-71 · Fall 2026 · Rochester Community and Technical College" \
  --metadata eyebrow="Course Syllabus" \
  --metadata author="Brendan Shea, PhD" \
  --metadata lang="en" \
  --metadata description="Syllabus for PHIL 1150-71 Computing and AI Ethics, Fall 2026: grading, proctoring requirements, policies, and the week-by-week course calendar." \
  -o "$OUT"

echo "built $OUT ($(wc -c < "$OUT") bytes)"
