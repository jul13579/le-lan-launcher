#!/bin/bash
VERSION="v1.8.0"

if [ ! -d "syncthing" ]; then
    echo "Cloning Syncthing..."
    git clone git@github.com:syncthing/syncthing.git
fi

echo -e "\nPulling latest changes..."
pushd syncthing
git reset --hard
git pull origin main

echo -e "\nChecking out latest syncthing release tag ($VERSION)"
git checkout $VERSION

echo -e "Patching syncthing"
for f in ../patches/*;
do
    git apply $f
    echo "Applied $f"
done

echo -e "Building syncthing..."
go run build.go -version $VERSION-LEGC -no-upgrade build
popd

echo -e "Move binary into place..."
mv syncthing/syncthing* ./