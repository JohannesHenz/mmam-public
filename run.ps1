param(
    [string]$argument = ""
)

if ($argument -eq "docker") {
    Set-Location -Path "docker" -ErrorAction Stop
    Invoke-Expression -Command ".\run.ps1" 
    Set-Location -Path "..\" -ErrorAction Stop
}

npm install
npm run start

