#!/usr/bin/env bash

if [ "$1" == "docker" ]; then
    cd database || exit
    sudo -p "[sudo] required for docker: " ./run.sh
    cd ..
fi

npm install
npm run start