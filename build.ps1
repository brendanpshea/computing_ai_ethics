param([string]$Lecture="all", [switch]$NoCleanup)

$OutputDir = "PDFs"
$Artifacts = @('.aux','.log','.out','.nav','.snm','.toc','.vrb','.fls','.fdb_latexmk')
$Files = @{
    "1"="ai_ethics_01_history.tex"
    "2"="ai_ethics_02_virtues.tex"
    "3"="ai_ethics_03.free_speech.tex"
    "4"="ai_ethics_04_intellectual_property.tex"
    "5"="ai_ethics_05.crypto.tex"
    "6"="ai_ethics_06_privacy.tex"
    "7"="ai_ethics_07_ai.tex"
    "8"="ai_ethics_08_work.tex"
}

function CleanArtifacts([string]$BaseName) {
    foreach ($ext in $Artifacts) {
        $f = Join-Path $OutputDir "$BaseName$ext"
        if (Test-Path $f) { Remove-Item $f -Force -EA SilentlyContinue }
    }
}

function BuildLecture([string]$Source, [string]$Num, [string]$Base) {
    Write-Host "Lecture $Num..." -NoNewline
    pdflatex -interaction=nonstopmode -output-directory=$OutputDir $Source > $null 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " OK" -ForegroundColor Green
        if (-not $NoCleanup) { CleanArtifacts $Base }
        return 1
    } else {
        Write-Host " FAIL" -ForegroundColor Red
        return 0
    }
}

Write-Host ""
if (-not (Test-Path $OutputDir)) { New-Item -Type Directory $OutputDir | Out-Null }

$list = if ($Lecture -eq "all") { @("1","2","3","4","5","6","7","8") } else { @($Lecture) }
$ok = 0; $bad = 0

foreach ($n in $list) {
    $src = $Files[$n]
    if (Test-Path $src) {
        $base = [IO.Path]::GetFileNameWithoutExtension($src)
        if ((BuildLecture $src $n $base) -eq 1) { $ok++ } else { $bad++ }
    }
}

Write-Host "Done: $ok OK, $bad FAIL" -ForegroundColor Cyan
