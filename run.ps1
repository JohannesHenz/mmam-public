param(
    [string]$argument = ""
)

if ($argument -eq "docker") {
    Set-Location -Path "db" -ErrorAction Stop
    $password = Read-Host -Prompt "[sudo] required for docker: " -AsSecureString
    Start-Process -FilePath "run.ps1" -ArgumentList @("-Password", $password) -Wait -NoNewWindow
    Set-Location -Path $PSScriptRoot
}

npm install
npm run start
