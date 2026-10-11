# Regenerate case-study BTS GIFs from project hero sources (max practical GIF quality).
# 960px wide, 18fps, full-frame palette, chroma-accurate scale — large files, sharp on retina.
# Requires ffmpeg on PATH. Run from repo root: powershell -File scripts/generate-bts-gifs.ps1

$ErrorActionPreference = "Stop"
$root = Join-Path $PSScriptRoot "..\public" | Resolve-Path

$tMain = 1.85
$tTypo = 1.28
$vf = "fps=18,scale=960:-1:flags=lanczos+accurate_rnd+full_chroma_int,split[s0][s1];[s0]palettegen=max_colors=256:stats_mode=full[p];[s1][p]paletteuse=dither=floyd_steinberg:diff_mode=rectangle"

function Export-Gif([string]$inPath, [double]$ss, [double]$dur, [string]$outPath) {
  if (-not (Test-Path $inPath)) { throw "Missing input: $inPath" }
  & ffmpeg -y -hide_banner -loglevel error -ss $ss -t $dur -i $inPath -an -vf $vf $outPath
}

$H = Join-Path $root "images\mockups\Header Video.mp4"
$H2 = Join-Path $root "images\mockups\Header Video v2.mp4"
$Gem = Join-Path $root "images\mockups\Gemini(2).mp4"
$App = Join-Path $root "images\mockups\Appstack-X.mp4"
$Nex = Join-Path $root "images\mockups\Nexus-1.mp4"
$Typ = Join-Path $root "videos\comp-1-1.mp4"

$d = Join-Path $root "images\bts\meta-rayban-oakley"
New-Item -ItemType Directory -Force -Path $d | Out-Null
Export-Gif $H 0 $tMain (Join-Path $d "01-flagship-open.gif")
Export-Gif $H 3.25 $tMain (Join-Path $d "02-product-reveal.gif")
Export-Gif $H 6.5 $tMain (Join-Path $d "03-ui-adjacent-beat.gif")
Export-Gif $H 9.75 $tMain (Join-Path $d "04-social-pace.gif")
Export-Gif $H 12.5 $tMain (Join-Path $d "05-hero-density.gif")
Export-Gif $H2 0 $tMain (Join-Path $d "06-alt-cut-intro.gif")
Export-Gif $H2 5.5 $tMain (Join-Path $d "07-retail-energy.gif")
Export-Gif $H2 11 $tMain (Join-Path $d "08-in-store-loop.gif")
Export-Gif $H2 16 $tMain (Join-Path $d "09-campaign-lock.gif")

$d = Join-Path $root "images\bts\google-gemini"
New-Item -ItemType Directory -Force -Path $d | Out-Null
$dur = 31.958333
$names = @(
  "01-hero-optimism", "02-research-beat", "03-drafting-flow", "04-iteration",
  "05-type-clarity", "06-ui-scale", "07-flagship-moment", "08-aspect-handoff", "09-kit-rhythm"
)
for ($i = 0; $i -lt 9; $i++) {
  $ss = [math]::Round($i * ($dur - $tMain) / 8, 3)
  Export-Gif $Gem $ss $tMain (Join-Path $d "$($names[$i]).gif")
}

$d = Join-Path $root "images\bts\appstack"
New-Item -ItemType Directory -Force -Path $d | Out-Null
$dur = 29.0
$names = @(
  "01-hook-open", "02-shell-grid", "03-typography-lock", "04-safe-zones", "05-end-card",
  "06-hook-swap", "07-template-rhythm", "08-format-stress", "09-ship-weekly"
)
for ($i = 0; $i -lt 9; $i++) {
  $ss = [math]::Round($i * ($dur - $tMain) / 8, 3)
  Export-Gif $App $ss $tMain (Join-Path $d "$($names[$i]).gif")
}

$d = Join-Path $root "images\bts\nexus"
New-Item -ItemType Directory -Force -Path $d | Out-Null
$dur = 63.125
$names = @(
  "01-sheet-slide", "02-list-reveal", "03-onboarding-loop", "04-handoff", "05-hierarchy-signal",
  "06-calm-learn", "07-density-read", "08-edge-polish", "09-native-vocab"
)
for ($i = 0; $i -lt 9; $i++) {
  $ss = [math]::Round($i * ($dur - $tMain) / 8, 3)
  Export-Gif $Nex $ss $tMain (Join-Path $d "$($names[$i]).gif")
}

$d = Join-Path $root "images\bts\typography"
New-Item -ItemType Directory -Force -Path $d | Out-Null
$dur = 11.708333
$names = @(
  "01-editorial-field", "02-contrast-pulse", "03-weight-shift", "04-scale-swell", "05-negative-space",
  "06-beat-cut", "07-silence-hold", "08-form-dominant", "09-sequence-tag"
)
for ($i = 0; $i -lt 9; $i++) {
  $ss = [math]::Round($i * ($dur - $tTypo) / 8, 3)
  Export-Gif $Typ $ss $tTypo (Join-Path $d "$($names[$i]).gif")
}

Write-Host "Done. Total size (MB):"
(Get-ChildItem (Join-Path $root "images\bts") -Recurse -Filter *.gif | Measure-Object -Property Length -Sum).Sum / 1mb
