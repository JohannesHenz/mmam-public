#!/usr/bin/env bash

if [ "$1" == "docker" ]; then
    echo "Running requires sudo privileges."
    cd docker || exit
    sudo ./run.sh
    cd ..
fi

npm install
npm run start