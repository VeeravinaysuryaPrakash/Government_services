# PowerShell script to kill process on port 5000
$port = 5000
$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($process) {
    $processId = $process.OwningProcess
    $processName = (Get-Process -Id $processId -ErrorAction SilentlyContinue).ProcessName
    Write-Host "Found process $processName (PID: $processId) using port $port"
    
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Write-Host "Process killed successfully"
    Start-Sleep -Seconds 2
} else {
    Write-Host "No process found on port $port"
}

