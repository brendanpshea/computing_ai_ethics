# Build System

Quick reference for building IT Ethics lectures.

## Quick Start

```powershell
# Build all lectures to /PDFs directory
.\build.ps1

# Build specific lectures
.\build.ps1 -Lecture 1
.\build.ps1 -Lecture 3
```

## What the Build System Does

1. **Compiles** .tex files to PDFs using pdflatex
2. **Outputs** PDFs to the `/PDFs` subdirectory
3. **Cleans** compilation artifacts (.aux, .log, .nav, etc.)
4. **Reports** success/failure for each lecture

## Features

- **Clean workspace**: No artifact clutter in root directory
- **Organized output**: All PDFs in one place (/PDFs)
- **Fast iteration**: Compile only what you need
- **Automatic cleanup**: Artifacts removed by default

## Usage

### All Lectures
```powershell
.\build.ps1
```

### Specific Lectures
```powershell
.\build.ps1 -Lecture 1        # Lecture 1 only
.\build.ps1 -Lecture 2        # Lecture 2 only
```

### Keep Artifacts (for debugging)
```powershell
.\build.ps1 -NoCleanup        # Keeps .aux, .log files in /PDFs
```

## Output

```
✓ Success = Lecture compiled and artifacts cleaned
✗ Failed = Compilation error (check source file)
```

## Example Session

```powershell
PS> .\build.ps1 -Lecture 1

Lecture 1... OK
Done: 1 OK, 0 FAIL
```

## Workflow

### Editing and Testing

```powershell
# 1. Edit lecture file
editor ai_ethics_01_history.tex

# 2. Quick compile/test
.\build.ps1 -Lecture 1

# 3. View result
Start-Process "PDFs\ai_ethics_01_history.pdf"
```

### Batch Build (all lectures)

```powershell
# 1. Make changes across multiple lectures
editor ai_ethics_*.tex

# 2. Build and verify all
.\build.ps1

# 3. Check PDFs in /PDFs directory
```

## File Organization

**Source files** stay in workspace root:
- `ai_ethics_01_history.tex`
- `ai_ethics_02_virtues.tex`
- etc.

**Generated PDFs** go to `/PDFs`:
- `PDFs/ai_ethics_01_history.pdf`
- `PDFs/ai_ethics_02_virtues.pdf`
- etc.

**Artifacts are NOT kept** (cleaned automatically):
- ✓ `.aux`, `.log`, `.nav` files removed
- ✓ `.snm`, `.toc`, `.vrb` files removed
- ✓ Root directory stays clean

## Troubleshooting

### Build fails with "Error"

Check the source file for LaTeX syntax errors:

```powershell
# Rebuild with artifacts kept to inspect errors
.\build.ps1 -Lecture 1 -NoCleanup

# Check the log file
cat "PDFs\ai_ethics_01_history.log" | grep -i error
```

### Can't find source file

Make sure you're in the `computing_ai_ethics` directory:

```powershell
cd computing_ai_ethics
.\build.ps1
```

### PDFs are old

Remove and rebuild:

```powershell
rm PDFs\ai_ethics_*.pdf  # Remove old PDFs
.\build.ps1              # Rebuild all
```

## Manual Compilation

If you need to compile without the script:

```powershell
# Compile to /PDFs
pdflatex -output-directory=PDFs ai_ethics_01_history.tex

# Clean artifacts
rm "PDFs\ai_ethics_01_history.aux", "PDFs\ai_ethics_01_history.log", etc.
```
