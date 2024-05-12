#!/bin/bash

SYNCTHING_DIR="syncthing-src"
VERSION="v1.27.7"

if [ ! -d "$SYNCTHING_DIR" ]; then
    echo "Cloning Syncthing..."
    git clone https://github.com/syncthing/syncthing.git $SYNCTHING_DIR
fi

echo -e "\nPulling latest changes..."
pushd $SYNCTHING_DIR
git reset --hard
git fetch

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
mv $SYNCTHING_DIR/syncthing* ./public/