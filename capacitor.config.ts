import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.ionic.ssl1",
  appName: "scanner-app",
  webDir: "www",
  bundledWebRuntime: false,
  cordova: {
    preferences: {
      ScrollEnabled: "false",
      "android-minSdkVersion": "22",
      BackupWebStorage: "none",
      AutoHideSplashScreen: "false",
      SplashMaintainAspectRatio: "true",
      FadeSplashScreenDuration: "3300",
      SplashShowOnlyFirstTime: "false",
      SplashScreen: "screen",
      SplashScreenDelay: "5000", // Adjust the value to 5000 (5 seconds)
    },
  },
  android: {
    buildOptions: {
      keystorePath: "c:UsersMarcDocumentsKeyBDScanner.keystore",
      keystoreAlias: "BDScanner",
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 5000,
      launchAutoHide: true,
      androidScaleType: "CENTER_CROP",
      splashImmersive: true,
      splashFullScreen: true,
      backgroundColor:"#fff"
    },
  },
};

export default config;
