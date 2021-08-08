#!/bin/bash

echo "Installing npm dependencies..."
npm i

echo -e "\nBuilding LEGC LAN-Launcher..."
npm run electron:build