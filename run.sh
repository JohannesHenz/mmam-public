#!/usr/bin/env bash

if [ "$1" == "docker" ]; then
    cd docker || exit
    sudo ./run.sh
    cd ..
fi

npm install
npm run start