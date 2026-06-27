# EduNex Ultra Landing Push Script
# Uruchom TEN SKRYPT z folderu głównego repozytorium:
# C:\...\evolve-project

$ErrorActionPreference = "Stop"

Write-Host "=== EduNex Ultra Landing Push ===" -ForegroundColor Cyan

$Destination = "evolve-project-shine-main\src\routes\index.tsx"
$Source = Join-Path $PSScriptRoot "index.tsx"

if (!(Test-Path ".git")) {
  Write-Host "BŁĄD: Nie jesteś w folderze repozytorium Git." -ForegroundColor Red
  Write-Host "Wejdź do folderu repo, np.:" -ForegroundColor Yellow
  Write-Host "cd C:\ścieżka\do\evolve-project" -ForegroundColor Yellow
  exit 1
}

if (!(Test-Path $Source)) {
  Write-Host "BŁĄD: Nie widzę pliku index.tsx obok skryptu." -ForegroundColor Red
  Write-Host "Wrzuć index.tsx i push-ultra-landing.ps1 do tego samego folderu." -ForegroundColor Yellow
  exit 1
}

if (!(Test-Path "evolve-project-shine-main\src\routes")) {
  Write-Host "BŁĄD: Nie widzę folderu evolve-project-shine-main\src\routes" -ForegroundColor Red
  Write-Host "Uruchom skrypt z głównego folderu repozytorium." -ForegroundColor Yellow
  exit 1
}

git checkout main
git pull origin main

Copy-Item $Source $Destination -Force
Write-Host "Podmieniono: $Destination" -ForegroundColor Green

git add $Destination
git commit -m "Add ultra animated landing page"
git push origin main

Write-Host ""
Write-Host "GOTOWE: push poszedł na main. Vercel powinien odpalić Production deploy." -ForegroundColor Green
