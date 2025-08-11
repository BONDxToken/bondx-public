param(
  [string]$Path = ".",
  [int]$IntervalSec = 5
)

Set-Location $Path

# Locate git.exe (PS 5.1 compatible)
$git = $null
$cmd = Get-Command git -ErrorAction SilentlyContinue
if ($cmd) { $git = $cmd.Source }
if (-not $git) {
  $candidates = @(
    "C:\Program Files\Git\cmd\git.exe",
    "C:\Program Files\Git\bin\git.exe",
    "C:\Program Files (x86)\Git\cmd\git.exe",
    "C:\Program Files (x86)\Git\bin\git.exe"
  )
  foreach ($p in $candidates) { if (Test-Path $p) { $git = $p; break } }
}
if (-not $git) { Write-Host "Git not found"; exit 1 }

# Ensure upstream is set (first time only)
& $git rev-parse --is-inside-work-tree 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { Write-Host "Not a git repo"; exit 1 }
& $git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { & $git push -u origin main }

Write-Host "Auto-push (poll) running every $IntervalSec s. Ctrl+C to stop."

$busy = $false
while ($true) {
  try {
    if ($busy) { Start-Sleep -Seconds 1; continue }
    $status = & $git status --porcelain
    if ([string]::IsNullOrWhiteSpace($status)) { Start-Sleep -Seconds $IntervalSec; continue }

    # Guard: if a previous Git left a lock, clear it if stale (>60s)
    $lock = Join-Path (Get-Location) ".git\index.lock"
    if (Test-Path $lock) {
      $age = (New-TimeSpan -Start (Get-Item $lock).LastWriteTime -End (Get-Date)).Duration().TotalSeconds
      if ($age -gt 60) {
        try { Remove-Item $lock -Force } catch { }
      } else {
        # Git is busy — skip this tick
        Start-Sleep -Seconds $IntervalSec
        continue
      }
    }

    $busy = $true
    & $git add -A | Out-Null
    $ts = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    & $git commit -m "auto: save @ $ts" | Out-Null
    & $git push | Out-Null
    Write-Host "[$ts] Changes pushed." -ForegroundColor Green
  } catch {
    Write-Host ("[ERROR] " + $_.Exception.Message) -ForegroundColor Yellow
  } finally {
    $busy = $false
    Start-Sleep -Seconds $IntervalSec
  }
}
