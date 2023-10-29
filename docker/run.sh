#!/usr/bin/env bash

# build and run the docker image
docker build -t mmam .
docker kill $(docker ps | awk '/5432/ {print $1}')
docker run -d -p 5432:5432 $(docker images --format "{{.ID}}" | head -n 1)