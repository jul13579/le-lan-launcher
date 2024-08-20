#!/bin/bash

echo "Installing npm dependencies..."
npm ci

echo -e "\nBuilding LEGC LAN-Launcher..."
npm run make