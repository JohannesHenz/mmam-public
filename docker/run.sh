#!/usr/bin/env bash

docker build -f Dockerfile.db -t mmam-db .

image="$(docker ps | awk '/5432/ {print $1}')"
if [ -n "$image" ]; then docker kill $image; fi

docker run -p 5432:5432 mmam-db &
