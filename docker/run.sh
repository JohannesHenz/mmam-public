#!/usr/bin/env bash

docker build -t mmam .
image="$(docker ps | awk '/5432/ {print $1}')"
docker kill $image
docker run -p 5432:5432 mmam &