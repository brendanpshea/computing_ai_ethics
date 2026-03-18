param([string]$Lecture="all", [switch]$NoCleanup)

$OutputDir = "PDFs"
# Artifacts to clean AFTER build completes (not during biber processing)
$Artifacts = @('.aux','.log','.out','.nav','.snm','.toc','.vrb','.fls','.fdb_latexmk','.bcf','.run.xml','.bbl','.blg')
$Files = @{
    "1"="ai_ethics_01_history.tex"
    "2"="ai_ethics_02_virtues.tex"
    "3"="ai_ethics_03.free_speech.tex"
    "4"="ai_ethics_04_intellectual_property.tex"
    "5"="ai_ethics_05.crypto.tex"
    "6"="ai_ethics_06_privacy.tex"
    "7"="ai_ethics_07_ai.tex"
    "8"="ai_ethics_08_work.tex"
    "9"="ai_ethics_09_impact.tex"
    "bib"="bibliography.tex"
}

function CleanArtifacts([string]$BaseName) {
    foreach ($ext in $Artifacts) {
        $f = Join-Path $OutputDir "$BaseName$ext"
        if (Test-Path $f) { Remove-Item $f -Force -EA SilentlyContinue }
    }
}

function BuildLecture([string]$Source, [string]$Num, [string]$Base) {
    Write-Host "Lecture $Num..." -NoNewline
    # Run pdflatex to generate .bcf file for biber
    pdflatex -interaction=nonstopmode -output-directory $OutputDir $Source > $null 2>&1
    # Process bibliography with biber
    biber "$OutputDir/$Base" > $null 2>&1
    # Run pdflatex twice more to fully resolve all references
    pdflatex -interaction=nonstopmode -output-directory $OutputDir $Source > $null 2>&1
    pdflatex -interaction=nonstopmode -output-directory $OutputDir $Source > $null 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " OK" -ForegroundColor Green
        # Don't clean during build - clean after all lectures finish
        return 1
    } else {
        Write-Host " FAIL" -ForegroundColor Red
        return 0
    }
}

Write-Host ""
if (-not (Test-Path $OutputDir)) { New-Item -Type Directory $OutputDir | Out-Null }

$list = if ($Lecture -eq "all") { @("1","2","3","4","5","6","7","8","9","bib") } else { @($Lecture) }
$ok = 0; $bad = 0

foreach ($n in $list) {
    $src = $Files[$n]
    if (Test-Path $src) {
        $base = [IO.Path]::GetFileNameWithoutExtension($src)
        if ((BuildLecture $src $n $base) -eq 1) { $ok++ } else { $bad++ }
    }
}

# Clean artifacts AFTER all builds complete (unless -NoCleanup is set)
if (-not $NoCleanup) {
    foreach ($n in $list) {
        $src = $Files[$n]
        if (Test-Path $src) {
            $base = [IO.Path]::GetFileNameWithoutExtension($src)
            CleanArtifacts $base
        }
    }
    # Clean up any biber SAVE-ERROR files
    Get-ChildItem -Path $OutputDir -Filter "*-SAVE-ERROR" | Remove-Item -Force -EA SilentlyContinue
}

Write-Host "Done: $ok OK, $bad FAIL" -ForegroundColor Cyan
