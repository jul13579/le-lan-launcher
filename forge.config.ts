import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { MakerDMG } from "@electron-forge/maker-dmg";
import { MakerWix } from "@electron-forge/maker-wix";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import { icnsIcon, icoIcon, icon, pngIcon } from "./src/config/icons";
import { rename } from "fs";
import { join } from "path";

const syncthingPath = "public/syncthing";

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: icon,
    executableName: "legc-lan-launcher",
    // We can only use static file paths here, so we have to handle the platform-specific executable extension in the following hooks
    extraResource: [syncthingPath],
    // If building on `win32`, rename the `syncthing.exe` => `syncthing` before copying extra resources
    beforeCopyExtraResources: [
      (buildPath, electronVersion, platform, arch, callback) => {
        if (platform !== "win32") {
          callback();
          return;
        }
        rename(
          join(__dirname, `${syncthingPath}.exe`),
          join(__dirname, syncthingPath),
          callback,
        );
      },
    ],
    // After copying extra resources, revert the rename
    afterCopyExtraResources: [
      async (buildPath, electronVersion, platform, arch, callback) => {
        if (platform !== "win32") {
          callback();
          return;
        }
        try {
          await Promise.all([
            new Promise((resolve, reject) => {
              rename(
                join(__dirname, syncthingPath),
                join(__dirname, `${syncthingPath}.exe`),
                (err) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(err);
                  }
                },
              );
            }),
            new Promise((resolve, reject) => {
              rename(
                join(buildPath, "resources", "syncthing"),
                join(buildPath, "resources", "syncthing.exe"),
                (err) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(err);
                  }
                },
              );
            }),
          ]);
          callback();
        } catch (e) {
          callback(e);
        }
      },
    ],
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      setupIcon: icoIcon,
    }),
    new MakerZIP({}, ["darwin"]),
    new MakerRpm({
      options: {
        icon: pngIcon,
      },
    }),
    new MakerDeb({
      options: {
        icon: pngIcon,
      },
    }),
    new MakerDMG({
      icon: icnsIcon,
    }),
    new MakerWix({
      icon: icoIcon,
    }),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: "src/main.ts",
          config: "vite.main.config.ts",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.ts",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.ts",
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
