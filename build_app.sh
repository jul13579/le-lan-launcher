#!/bin/bash

echo "Installing npm dependencies..."
npm install

echo -e "\nBuilding LEGC LAN-Launcher..."
npm run electron:build