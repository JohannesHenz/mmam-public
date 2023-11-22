param(
    [string]$argument = ""
)

if ($argument -eq "docker") {
    Set-Location -Path "db" -ErrorAction Stop
    Start-Process -FilePath "run.sh" -Wait -NoNewWindow
    Set-Location -Path $PSScriptRoot
}

npm install
npm run start

