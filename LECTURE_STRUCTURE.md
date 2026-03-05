# Lecture Structure Documentation

## Overview

This document explains the standardized structure for the IT Ethics lecture files, including how to compile them as both presentations (Beamer slides) and articles (for HTML conversion via Pandoc).

## File Structure

### Common Files

- **`lecture_preamble.tex`** - Shared preamble containing:
  - Theme configuration (Madrid theme with standardized footline)
  - Common packages (tikz, booktabs, tcolorbox, etc.)
  - **Standardized custom boxes** with uniform colors across all lectures:
    - `argumentbox` - Logical arguments (blue)
    - `quotebox` - Philosophical quotes (gray)
    - `casestudybox` - Case studies/examples (gold)
    - `objectionbox` - Objections/counterarguments (red)
    - `probox` - Supporting arguments (green)
    - `conceptbox` - Key concepts/definitions (blue)
    - `discussionbox` - Discussion questions (gold)
    - `figurebox` - Diagrams with explanations (blue)
  - **Standardized icon commands**: `\iconQuote`, `\iconBalance`, `\iconDiscussion`, `\iconIdea`, `\iconPro`, `\iconCon`
  - **Standard environments**: `argument`, `quoteslide`
  - Article mode adjustments (hyperlinks, bibliography, conditional formatting)

### Individual Lecture Files

Each lecture file (`ai_ethics_XX_*.tex`) follows this structure:

```latex
% Comments/metadata
\documentclass[aspectratio=169]{beamer}  % or [aspectratio=169,11pt]

% Load common preamble
\input{lecture_preamble.tex}

% ------------------------------------------------------------------------------
% Lecture-Specific Customizations
% ------------------------------------------------------------------------------

% Define lecture-specific colors
\definecolor{themeblue}{RGB}{0,82,147}
% ... more colors

% Apply colors to beamer theme
\setbeamercolor{structure}{fg=themeblue}
\setbeamercolor{title}{fg=white,bg=themeblue}
% ... more color settings

% Define lecture-specific custom boxes
\newtcolorbox{custombox}[1][]{...}

% Title information
\title[Short Title]{Full Title}
\subtitle{Subtitle}
\author{Author Name}
\institute{Institution}
\date{}

\begin{document}
% ... slides and content
\end{document}
```

## Compiling Lectures

### Build Output Organization

- **Source files** (.tex) - Located in workspace root
- **Generated PDFs** - Always in `/PDFs` subdirectory  
- **Artifacts** (.aux, .log, etc.) - Automatically cleaned, not committed

### Using the Build Script (Recommended)

```powershell
# Build all lectures
.\build.ps1

# Build specific lectures
.\build.ps1 -Lecture 1
.\build.ps1 -Lecture 2,4,6

# Keep artifacts for debugging
.\build.ps1 -NoCleanup
```

### As Presentations (Default)

The default `\documentclass[aspectratio=169]{beamer}` produces presentation PDFs.

```powershell
# Using build script (to /PDFs with cleanup)
.\build.ps1

# Or manually with artifact cleanup
pdflatex -output-directory=PDFs ai_ethics_01_history.tex
rm "PDFs\ai_ethics_01_history.aux", "PDFs\ai_ethics_01_history.log", etc.
```

### As Articles (for HTML Conversion)

To compile a lecture as an article for conversion to HTML:

1. **Change the documentclass**:

```latex
% Change from:
\documentclass[aspectratio=169]{beamer}

% To:
\documentclass[ignorenonframetext]{beamerarticle}
```

2. **Compile**:

```powershell
pdflatex -output-directory=PDFs ai_ethics_01_history.tex
```

3. **Convert to HTML**:

```powershell
pandoc ai_ethics_01_history.tex -o PDFs/ai_ethics_01_history.html `
  --standalone --mathjax --toc
```

## Article Mode Features

The common preamble includes special handling for article mode:

### Automatic Adjustments
- **Sections**: `\section{}` commands create proper article sections (ignored in presentation mode)
- **Article-only content**: Use `\mode<article>{...}` for text that appears only in articles
- **Hyperlinks**: Automatic blue hyperlinks for references and citations
- **Bibliography**: Biblatex integration with APA style pointing to `refs.bib`
- **Page layout**: Uses fullpage package for better article formatting

### Mode-Specific Content

```latex
% This paragraph appears ONLY in article mode, not on slides
\mode<article>{
This introductory paragraph provides context for readers of the 
article version that isn't needed for presentation audiences.
}

% This appears in BOTH modes
\begin{frame}{Slide Title}
Content appears in both presentation and article...
\end{frame}
```

## Customization

### What's Standardized Across All Lectures

**Custom Boxes** - All lectures use the same box definitions with consistent colors:
- Blue boxes (arguments, concepts): Professional navy for logical/definitional content
- Green boxes (pro arguments): Forest green for supporting positions  
- Red boxes (objections): Crimson for counterarguments and critiques
- Gold boxes (case studies, discussions): Amber for practical examples
- Gray boxes (quotes): Neutral gray for citations

**Icon Commands** - Unified text-based icons (since fontawesome is unavailable):
- `\iconQuote` ("), `\iconBalance` (▷), `\iconDiscussion` (?), `\iconIdea` (★), `\iconPro` (+), `\iconCon` (--)

**Environments** - Standard across all lectures:
- `\begin{argument}...\end{argument}` - For standard form logical arguments
- `\begin{quoteslide}{Author}{Quote text}...\end{quoteslide}` - For formatted quotes

### What's Lecture-Specific

**Theme Colors** - Each lecture customizes the frame/title colors to match its topic:

- Lecture 1 (History): `primaryblue`, `accentgold`, `quotegreen`
- Lecture 2 (Virtues): `aristotleblue`, `virtuegreen`, `warningred`, `techgray`
- Lecture 3 (Free Speech): `millblue`, `libertygreen`, `goldaccent`
- Lecture 4 (IP): `ipblue`, `innovgreen`, `publicdomain`
- Lecture 5 (Crypto): `cryptoblue`, `cryptogold`, `cryptogreen`, `cryptored`
- Lecture 6 (Privacy): `privacyblue`, `privacygreen`, `privacyred`, `privacygold`
- Lecture 7 (AI): `aiblue`, `aigreen`, `aiorange`, `aipurple`
- Lecture 8 (Work): `laborblue`, `laborgreen`, `labororange`, `laborgold`

These lecture-specific colors are used for:
- Frame titles (`\setbeamercolor{frametitle}`)
- Slide titles (`\setbeamercolor{title}`)
- TikZ diagrams and custom graphics
- Beamer block backgrounds

**Important**: Do NOT redefine the standard boxes (`argumentbox`, `quotebox`, etc.) in individual lecture files. These definitions come from the preamble and are intentionally uniform.

## Benefits of This Structure

1. **Consistency**: All lectures share the same basic configuration and standardized boxes
2. **Maintainability**: Changes to common elements only need to be made once in `lecture_preamble.tex`
3. **Uniform appearance**: Students see the same visual language across all lectures (blue=argument, red=objection, etc.)
4. **Minimal complexity**: No lecture-specific box redefinitions to maintain
5. **Dual-mode support**: Easy switching between presentation and article formats
6. **Semantic structure**: Proper use of `\section` and `\mode<article>` enables better HTML conversion
7. **Visual identity**: Lectures retain unique title/frame colors while maintaining uniform content boxes

## Workflow: From Slides to HTML

Complete workflow for converting lectures to accessible HTML:

```powershell
# 1. Edit lecture file to use beamerarticle
#    (change \documentclass line)

# 2. Compile to PDF (optional, for proofreading)
pdflatex -output-directory=PDFs ai_ethics_01_history.tex

# 3. Convert directly to HTML with Pandoc
pandoc ai_ethics_01_history.tex -o PDFs/ai_ethics_01_history.html `
  --standalone --mathjax --toc

# 4. Advanced: Use custom CSS for better styling
pandoc ai_ethics_01_history.tex -o PDFs/ai_ethics_01_history.html `
  --standalone --mathjax --toc --css=custom.css
```

## Build Management

### Understanding the Build System

- **`build.ps1`** - PowerShell script that:
  - Compiles all or selected lectures
  - Outputs PDFs to `/PDFs` directory  
  - Automatically cleans up compilation artifacts
  - Reports success/failure status

### Artifacts Cleaned by Default

After each successful compilation, these files are removed:
- `.aux`, `.log`, `.out` - Compilation metadata
- `.nav`, `.snm`, `.toc`, `.vrb` - Beamer presentation data
- `.fls`, `.fdb_latexmk` - Dependency tracking

### Manual Cleanup

If you compile directly with pdflatex (not using build.ps1):

```powershell
# Remove artifacts for a single lecture
rm "PDFs\ai_ethics_01_history.aux", "PDFs\ai_ethics_01_history.log", etc.

# Remove all artifacts
Get-ChildItem PDFs -Include *.aux,*.log,*.out,*.nav,*.snm,*.toc,*.vrb | Remove-Item
```

### Workspace Structure After Build

```
computing_ai_ethics/
  ai_ethics_01_history.tex      (source only, no artifacts)
  ai_ethics_02_virtues.tex
  ... (other lecture sources)
  
  lecture_preamble.tex          (shared preamble)
  build.ps1                     (build script)
  
  PDFs/
    ai_ethics_01_history.pdf    (generated)
    ai_ethics_02_virtues.pdf
    ... (other PDFs)
    ai_ethics_syllabus.pdf      (other documents)
```

## Tips

- **Bibliography**: Ensure `refs.bib` is in the same directory for citations to work
- **Images**: TikZ diagrams with `\caption{}` commands convert well to HTML
- **Frames**: In article mode, frame titles become emphasized text rather than slides
- **Overlays**: Beamer overlays (`\pause`, `\only<>`, etc.) are ignored in article mode
- **Testing**: Always test compile after switching document classes to catch issues

## Future Improvements

Potential enhancements to consider:

- [ ] Create a shell script to batch convert all lectures to HTML
- [ ] Develop custom CSS for consistent web styling
- [ ] Add metadata for better web accessibility
- [ ] Create article-specific title pages
- [ ] Add navigation between lectures in HTML versions
