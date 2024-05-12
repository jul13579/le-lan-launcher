@echo off

set SYNCTHING_DIR="syncthing-src"
set VERSION="v1.27.7"

if exist %SYNCTHING_DIR% goto build
:cloneSyncthing
echo Cloning Syncthing...
git clone https://github.com/syncthing/syncthing.git %SYNCTHING_DIR%

:build
echo.
echo Pulling latest changes...
pushd %SYNCTHING_DIR%
git reset --hard
git fetch

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
move %SYNCTHING_DIR%\syncthing* .\public\