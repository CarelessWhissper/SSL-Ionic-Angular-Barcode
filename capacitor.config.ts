import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.ssl',
  appName: 'SSL-Scanner',
  webDir: 'www',
  bundledWebRuntime: false,
  cordova: {
    preferences: {
      ScrollEnabled: 'false',
      'android-minSdkVersion': '19',
      BackupWebStorage: 'none',
      AutoHideSplashScreen: 'false',
      SplashMaintainAspectRatio: 'true',
      FadeSplashScreenDuration: '300',
      SplashShowOnlyFirstTime: 'false',
      SplashScreen: 'screen',
      SplashScreenDelay: '3000'
    }
  }
,
    android: {
       buildOptions: {
          keystorePath: 'c:\Users\Marc\Documents\Key\BDScanner.keystore',
          keystoreAlias: 'BDScanner',
       }
    }
  };

export default config;
