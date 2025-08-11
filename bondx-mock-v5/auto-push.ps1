# Auto-commit & push on file change (PowerShell)
# Usage:  pwsh -File .\auto-push.ps1
# Stop:   Press Ctrl+C in this window

param(
  [string]$Path = ".",
  [int]$DebounceMs = 1500
)

Set-Location $Path

# Ensure this is a git repo
git rev-parse --is-inside-work-tree 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { Write-Host "Not a git repo here. Exiting."; exit 1 }

# File watcher
$fsw = New-Object System.IO.FileSystemWatcher
$fsw.Path = (Get-Location).Path
$fsw.IncludeSubdirectories = $true
$fsw.EnableRaisingEvents = $true
$fsw.Filter = "*.*"

# Debounce timer
$timer = New-Object Timers.Timer
$timer.Interval = $DebounceMs
$timer.AutoReset = $false

$action = {
  try {
    $status = git status --porcelain
    if ([string]::IsNullOrWhiteSpace($status)) { return }

    $ts = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    git add -A | Out-Null
    git commit -m "auto: save @ $ts" | Out-Null
    git push | Write-Host
  } catch {
    Write-Host "Auto-push error: $($_.Exception.Message)"
  }
}

$handler = {
  $timer.Stop()
  $timer.Start()
}

$created = Register-ObjectEvent $fsw Created -Action $handler
$changed = Register-ObjectEvent $fsw Changed -Action $handler
$deleted = Register-ObjectEvent $fsw Deleted -Action $handler
$renamed = Register-ObjectEvent $fsw Renamed -Action $handler
$tick    = Register-ObjectEvent $timer Elapsed -Action $action

Write-Host "Auto-push running for $(Get-Location). Press Ctrl+C to stop."
while ($true) { Start-Sleep -Seconds 1 }

# Cleanup (usually not reached unless you trap/exit)
Unregister-Event -SourceIdentifier $created.Name,$changed.Name,$deleted.Name,$renamed.Name,$tick.Name
$fsw.Dispose()
$timer.Dispose()
