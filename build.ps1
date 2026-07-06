<#
.SYNOPSIS
  Build lecture PDFs from LaTeX sources into PDFs/.

.DESCRIPTION
  Incremental by default: a deck is skipped when its PDF is newer than its
  .tex source, lecture_preamble.tex, and refs.bib. (Image changes are NOT
  tracked -- use -Force after swapping an image.) Decks that do need building
  run in parallel background jobs, each doing the full
  pdflatex -> biber -> pdflatex x2 cycle.

.PARAMETER Lecture
  "all" (default), a lecture number 1-12, or "bib".
.PARAMETER Force
  Rebuild even if the PDF looks up to date.
.PARAMETER Quick
  Single pdflatex pass only -- fast layout checks; citations show as [?].
.PARAMETER MaxParallel
  Concurrent builds. Default: min(6, cores-1).
.PARAMETER NoCleanup
  Keep .aux/.log etc. in PDFs/ for debugging.

.EXAMPLE
  .\build.ps1                      # build only what changed
  .\build.ps1 -Lecture 4 -Quick    # fast single-pass check of lecture 4
  .\build.ps1 -Force               # full rebuild of everything
#>
param(
    [string]$Lecture = "all",
    [switch]$NoCleanup,
    [switch]$Force,
    [switch]$Quick,
    [int]$MaxParallel = 0
)

$OutputDir = "PDFs"
$SourceDir = "latex"
$Root = $PSScriptRoot
# Let pdflatex find \input{lecture_preamble.tex} etc. in latex/ while cwd is project root
$env:TEXINPUTS = ".\$SourceDir;" + $env:TEXINPUTS
# Artifacts to clean AFTER build completes (not during biber processing)
$Artifacts = @('.aux','.log','.out','.nav','.snm','.toc','.vrb','.fls','.fdb_latexmk','.bcf','.run.xml','.bbl','.blg')
$Files = @{
    "1"="ai_ethics_01_history.tex"
    "2"="ai_ethics_02_virtues.tex"
    "3"="ai_ethics_03_free_speech.tex"
    "4"="ai_ethics_04_intellectual_property.tex"
    "5"="ai_ethics_05_crypto.tex"
    "6"="ai_ethics_06_privacy.tex"
    "7"="ai_ethics_07_ai.tex"
    "8"="ai_ethics_08_work.tex"
    "9"="ai_ethics_09_impact.tex"
    "10"="ai_ethics_10_doomsday.tex"
    "11"="ai_ethics_11_robot_rights.tex"
    "12"="ai_ethics_12_games.tex"
    "bib"="bibliography.tex"
}

if ($MaxParallel -le 0) {
    $MaxParallel = [Math]::Max(1, [Math]::Min(6, [Environment]::ProcessorCount - 1))
}

# Shared dependencies: touching either invalidates every deck.
$SharedDeps = @((Join-Path $SourceDir 'lecture_preamble.tex'), 'refs.bib')

function IsUpToDate([string]$SourcePath, [string]$Base) {
    $pdf = Join-Path $OutputDir "$Base.pdf"
    if (-not (Test-Path $pdf)) { return $false }
    $pdfTime = (Get-Item $pdf).LastWriteTime
    foreach ($dep in (@($SourcePath) + $SharedDeps)) {
        if ((Test-Path $dep) -and ((Get-Item $dep).LastWriteTime -gt $pdfTime)) { return $false }
    }
    return $true
}

function CleanArtifacts([string]$BaseName) {
    foreach ($ext in $Artifacts) {
        $f = Join-Path $OutputDir "$BaseName$ext"
        if (Test-Path $f) { Remove-Item $f -Force -EA SilentlyContinue }
    }
}

# The per-deck build pipeline, run inside a background job.
$BuildScript = {
    param($Root, $SourceDir, $OutputDir, $Source, $Base, $Quick)
    Set-Location $Root
    $env:TEXINPUTS = ".\$SourceDir;" + $env:TEXINPUTS
    pdflatex -interaction=nonstopmode -output-directory $OutputDir $Source > $null 2>&1
    if ($LASTEXITCODE -ne 0) { return $false }
    if ($Quick) { return $true }
    biber "$OutputDir/$Base" > $null 2>&1
    pdflatex -interaction=nonstopmode -output-directory $OutputDir $Source > $null 2>&1
    pdflatex -interaction=nonstopmode -output-directory $OutputDir $Source > $null 2>&1
    return ($LASTEXITCODE -eq 0)
}

$sw = [System.Diagnostics.Stopwatch]::StartNew()
Write-Host ""
if (-not (Test-Path $OutputDir)) { New-Item -Type Directory $OutputDir | Out-Null }

$list = if ($Lecture -eq "all") { @("1","2","3","4","5","6","7","8","9","10","11","12","bib") } else { @($Lecture) }

# Partition into up-to-date (skip) and stale (build).
$toBuild = @(); $skipped = 0
foreach ($n in $list) {
    $src = $Files[$n]
    if (-not $src) { Write-Host "Unknown lecture '$n'" -ForegroundColor Red; continue }
    $fullSrc = Join-Path $SourceDir $src
    if (-not (Test-Path $fullSrc)) { continue }
    $base = [IO.Path]::GetFileNameWithoutExtension($src)
    if (-not $Force -and (IsUpToDate $fullSrc $base)) {
        Write-Host "Lecture $n... up to date" -ForegroundColor DarkGray
        $skipped++
    } else {
        $toBuild += ,@($n, $fullSrc, $base)
    }
}

# Launch throttled parallel jobs.
$jobs = @()
foreach ($item in $toBuild) {
    # Count every job not yet finished (freshly dispatched jobs briefly report
    # 'NotStarted', so testing for 'Running' alone lets the throttle leak).
    while (@($jobs | Where-Object { $_.Job.State -notin @('Completed','Failed','Stopped') }).Count -ge $MaxParallel) {
        Start-Sleep -Milliseconds 250
    }
    $n, $fullSrc, $base = $item
    Write-Host "Lecture $n... building" -ForegroundColor Cyan
    $job = Start-Job -ScriptBlock $BuildScript -ArgumentList $Root, $SourceDir, $OutputDir, $fullSrc, $base, [bool]$Quick
    $jobs += [PSCustomObject]@{ N=$n; Base=$base; Job=$job }
}

# Collect results.
$ok = 0; $bad = 0
foreach ($j in $jobs) {
    $null = Wait-Job $j.Job
    $result = (Receive-Job $j.Job | Select-Object -Last 1)
    Remove-Job $j.Job
    if ($result -eq $true) {
        Write-Host "Lecture $($j.N)... OK" -ForegroundColor Green
        $ok++
    } else {
        Write-Host "Lecture $($j.N)... FAIL" -ForegroundColor Red
        $bad++
    }
}

# Clean artifacts AFTER all builds complete (unless -NoCleanup is set)
if (-not $NoCleanup) {
    foreach ($j in $jobs) { CleanArtifacts $j.Base }
    Get-ChildItem -Path $OutputDir -Filter "*-SAVE-ERROR" | Remove-Item -Force -EA SilentlyContinue
}

$sw.Stop()
$elapsed = "{0:m\:ss}" -f $sw.Elapsed
Write-Host "Done: $ok OK, $bad FAIL, $skipped skipped ($elapsed)" -ForegroundColor Cyan
if ($bad -gt 0) { exit 1 } else { exit 0 }
