@echo off
if exist syncthing goto build
:cloneSyncthing
echo Cloning Syncthing...
git clone git@github.com:syncthing/syncthing.git

:build
echo.
echo Pulling latest changes...
pushd syncthing
git reset --hard
git pull origin master

echo.
echo Checking out latest syncthing release tag (v1.3.4)
git checkout v1.3.4

echo.
echo Patching syncthing
for %%f in (..\patches\*) do (
    git apply %%f
    echo Applied %%f
)

echo.
echo Building Syncthing...
go run build.go -version v1.3.4-LEGC -no-upgrade build
popd

echo.
echo Move binary into place...
move syncthing\syncthing* .\

echo.
echo Installing npm dependencies....
call npm install

echo.
echo Building LEGC LAN-Launcher...
call npm run electron:build
exit 0
