<#
.SYNOPSIS
  Publish the static site to the gh-pages branch as a single force-pushed commit.

.DESCRIPTION
  `main` stays source-only: the built lecture PDFs are gitignored. This script
  (re)builds them with build.ps1, then copies the site (index.html, PDFs/, html/,
  images/, docx/) into a throwaway staging repo and force-pushes it to the
  `gh-pages` branch. Because gh-pages is overwritten each run, it never
  accumulates history -- no binary bloat on any branch.

  One-time GitHub setup: Settings -> Pages -> Build and deployment ->
  Source = "Deploy from a branch", Branch = gh-pages, folder = / (root).

.PARAMETER SkipBuild
  Publish the PDFs already present in PDFs/ instead of rebuilding them first.

.EXAMPLE
  .\deploy-pages.ps1
.EXAMPLE
  .\deploy-pages.ps1 -SkipBuild
#>
param([switch]$SkipBuild)

# git writes progress and normalization warnings to stderr; under 'Stop',
# PowerShell 5.1 turns that into a terminating error. Use 'Continue' and gate
# on $LASTEXITCODE instead. Critical cmdlets get explicit -ErrorAction Stop.
$ErrorActionPreference = 'Continue'
$root = $PSScriptRoot

function Assert-LastExit([string]$what) {
    if ($LASTEXITCODE -ne 0) { throw "$what failed (exit $LASTEXITCODE)" }
}

if (-not $SkipBuild) {
    & "$root\build.ps1"
    Assert-LastExit 'build.ps1'
}

# Sanity: all 12 lecture PDFs must exist before we publish.
$pdfs = Get-ChildItem (Join-Path $root 'PDFs') -Filter 'ai_ethics_*.pdf' -ErrorAction SilentlyContinue
if (-not $pdfs -or $pdfs.Count -lt 12) {
    throw "Expected 12 lecture PDFs in PDFs/, found $($pdfs.Count). Build first (drop -SkipBuild)."
}

$remote = (git -C $root remote get-url origin).Trim()
if (-not $remote) { throw "No 'origin' remote configured." }

# Everything the published pages reference. html/ carries its own css/js and
# quiz-data/; chapters load ../images/... so images/ must sit at the site root.
$include = @('index.html', 'PDFs', 'html', 'images', 'docx')

$staging = Join-Path ([IO.Path]::GetTempPath()) ("ghpages_" + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force $staging -ErrorAction Stop | Out-Null
try {
    foreach ($item in $include) {
        $src = Join-Path $root $item
        if (Test-Path $src) { Copy-Item $src -Destination $staging -Recurse -Force -ErrorAction Stop }
        else { Write-Warning "site asset not found, skipping: $item" }
    }
    # Disable Jekyll so files/folders (incl. any leading-underscore names) serve verbatim.
    Set-Content -Path (Join-Path $staging '.nojekyll') -Value '' -NoNewline -ErrorAction Stop

    Push-Location $staging
    try {
        git init -q;                    Assert-LastExit 'git init'
        git checkout -q -b gh-pages;    Assert-LastExit 'git checkout'
        # Commit bytes as-is and skip line-ending normalization warnings.
        git config core.autocrlf false; Assert-LastExit 'git config autocrlf'
        git config core.safecrlf false; Assert-LastExit 'git config safecrlf'
        git add -A;                     Assert-LastExit 'git add'
        $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
        git -c user.name=site-deploy -c user.email=site-deploy@localhost commit -q -m "Deploy site $stamp"
        Assert-LastExit 'git commit'
        Write-Host "Force-pushing gh-pages -> $remote ..." -ForegroundColor Cyan
        git push -q --force $remote gh-pages
        Assert-LastExit 'git push'
    } finally {
        Pop-Location
    }
    Write-Host "Published gh-pages ($($pdfs.Count) lecture PDFs)." -ForegroundColor Green
    Write-Host "First time only: set Pages source to the gh-pages branch (/ root) in repo Settings." -ForegroundColor Yellow
}
finally {
    Remove-Item -Recurse -Force $staging -ErrorAction SilentlyContinue
}
