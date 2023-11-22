# Build Docker image
docker build -t mmam .

# Get container ID for the running container on port 5432
$image = docker ps | ForEach-Object { 
    if ($_ -match "5432") {
        $_.Split(" ")[0]
    }
}

# Kill the running container
if ($image) {
    docker rm -f $image
}

# Run the Docker container on port 5432
Start-Process -FilePath "docker" -ArgumentList @("run", "-d", "-p", "5432:5432", "mmam") -Wait -NoNewWindow
