@echo off

set VERSION="v1.8.0"

if exist syncthing goto build
:cloneSyncthing
echo Cloning Syncthing...
git clone git@github.com:syncthing/syncthing.git

:build
echo.
echo Pulling latest changes...
pushd syncthing
git reset --hard
git pull origin main

echo.
echo Checking out latest syncthing release tag (%VERSION%)
git checkout %VERSION%

echo.
echo Patching syncthing
for %%f in (..\patches\*) do (
    git apply %%f
    echo Applied %%f
)

echo.
echo Building Syncthing...
go run build.go -version %VERSION%-LEGC -no-upgrade build
popd

echo.
echo Move binary into place...
move syncthing\syncthing* .\