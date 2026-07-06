# Build System

Quick reference for building lecture PDFs and Word (docx) chapter downloads.

---

## Directory layout

```
latex/       LaTeX sources (.tex files, lecture_preamble, bibliography)
html/        Authored HTML chapters
images/      Shared image assets (used by LaTeX, HTML, and docx builds)
scripts/     Build scripts (build-docx.js, make-reference-docx.py, etc.)
PDFs/        Generated lecture PDFs
docx/        Generated Word chapter downloads
refs.bib     Shared bibliography (LaTeX and docx pipelines)
build.ps1    LaTeX build script (root)
package.json Node tooling for docx build (root)
```

All scripts are run from the **project root**.

---

## LaTeX → PDF

### Quick start

```powershell
.\build.ps1                 # build only decks whose sources changed (incremental)
.\build.ps1 -Lecture 1      # chapter 1 only
.\build.ps1 -Lecture 4 -Quick   # single pdflatex pass — fast layout check, citations show [?]
.\build.ps1 -Force          # rebuild everything regardless of timestamps
.\build.ps1 -NoCleanup      # keep .aux/.log files in PDFs/ for debugging
```

### What it does

1. Prepends `latex/` to `TEXINPUTS` so `\input{lecture_preamble.tex}` resolves.
2. **Incremental**: skips a deck when its PDF is newer than its `.tex`,
   `lecture_preamble.tex`, and `refs.bib`. Caveat: **image changes are not
   tracked** — after swapping an image, use `-Force` (or `-Lecture N`).
3. Builds stale decks **in parallel** (default: min(6, cores−1) jobs; tune with
   `-MaxParallel N`), each running `pdflatex` → `biber` → `pdflatex` × 2.
4. Writes PDFs to `PDFs/`; exits nonzero if any deck fails.
5. Cleans build artifacts (`.aux`, `.log`, `.nav`, `.bcf`, etc.) unless `-NoCleanup` is set.

### Editing and testing

```powershell
# 1. Edit a lecture
code latex\ai_ethics_01_history.tex

# 2. Compile
.\build.ps1 -Lecture 1

# 3. View
Start-Process PDFs\ai_ethics_01_history.pdf
```

### Manual compilation (without the script)

```powershell
$env:TEXINPUTS = ".\latex;" + $env:TEXINPUTS
pdflatex -output-directory=PDFs latex\ai_ethics_01_history.tex
biber PDFs\ai_ethics_01_history
pdflatex -output-directory=PDFs latex\ai_ethics_01_history.tex
pdflatex -output-directory=PDFs latex\ai_ethics_01_history.tex
```

`\includegraphics{images/...}` and `\addbibresource{refs.bib}` both resolve against the project root, so no paths inside `.tex` files need to change when compiling this way. Both the script and manual compilation **must be run from the project root** — setting `TEXINPUTS` to include `latex\` is what lets `\input{lecture_preamble.tex}` resolve.

### Article mode (not maintained)

The preamble and lectures contain `\mode<article>{...}` blocks for a `beamerarticle` handout build. **This build is not maintained or distributed** — the article-mode narrative blocks are incomplete in later lectures and nothing in this repo compiles them. The blocks are harmless in the normal presentation build (beamer ignores them); don't sink time into extending them.

---

## Publishing to GitHub Pages

The lecture PDFs are **not tracked on `main`** (they're gitignored) so the repo
doesn't gain a fresh ~20 MB binary snapshot on every rebuild. They're built
locally and published to a `gh-pages` branch that is **force-pushed as a single
commit** each deploy, so no branch accumulates PDF history.

### One-time setup

In GitHub: **Settings → Pages → Build and deployment** → **Source = "Deploy from
a branch"**, **Branch = `gh-pages`**, folder **`/ (root)`**.

### Deploy

```powershell
.\deploy-pages.ps1              # rebuild all decks, then publish the site
.\deploy-pages.ps1 -SkipBuild   # publish the PDFs already in PDFs/
```

The script runs `build.ps1`, copies the site (`index.html`, `PDFs/`, `html/`,
`images/`, `docx/`) into a throwaway repo, adds `.nojekyll`, and force-pushes it
to `gh-pages`. `main` never carries the built PDFs; `gh-pages` is overwritten
each run.

> **First-time rollout order:** (1) run `.\deploy-pages.ps1`, (2) switch the
> Pages source to `gh-pages`, (3) then `git push` main. Pushing main first would
> 404 the live PDFs until Pages is repointed, since `main` no longer serves them.

`docx/` is still tracked on `main` (those change rarely and rebuilding them needs
the heavier node+pandoc+mermaid pipeline). Give it the same treatment later if
its history grows.

---

## HTML → Word (docx)

### One-time setup

```powershell
npm install                                # installs mermaid-cli + cheerio
python scripts\make-reference-docx.py      # creates reference.docx + downloads apa.csl
```

### Build

```powershell
npm run build-docx                         # all 12 chapters
node scripts\build-docx.js ch03            # single chapter (prefix match)
```

Outputs land in `docx/`.

### What it does

1. Parses each HTML chapter with cheerio.
2. Strips navigation, TOC, footer, and `<script>` tags.
3. Extracts `<div class="mermaid">` diagrams and renders them to PNG via `mmdc`.
4. Wraps inner styled paragraphs (`p.box-label`, `p.term`, etc.) so their classes survive Pandoc's HTML reader.
5. Converts `<cite data-key="key">` to citation spans, then to `Cite` AST nodes via a Lua filter.
6. Invokes Pandoc with `--citeproc`, `--bibliography refs.bib`, `--csl apa.csl`, and the custom `reference.docx` to apply Word styles.

### Customizing Word styles

Open `reference.docx` in Word, modify any of the custom paragraph styles (`Definition Box`, `Argument Box`, `Case Study`, `Key Thinker`, etc.), save, and rebuild. The changes apply to all 12 chapter outputs.

To reset to the scripted defaults, re-run `python scripts\make-reference-docx.py`.

---

## Troubleshooting

### LaTeX build fails

```powershell
.\build.ps1 -Lecture 1 -NoCleanup
# then inspect:
cat PDFs\ai_ethics_01_history.log | Select-String -Pattern "error" -CaseSensitive:$false
```

### PDFs look stale

```powershell
Remove-Item PDFs\ai_ethics_*.pdf
.\build.ps1
```

### docx build fails with "reference.docx not found"

Run the one-time setup first: `python scripts\make-reference-docx.py`.

### docx build fails with "mmdc not found"

Run `npm install` from the project root.
