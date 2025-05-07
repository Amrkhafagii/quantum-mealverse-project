
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.117bb8e72e6f4681936555049936510d',
  appName: 'quantum-mealverse-project',
  webDir: 'dist',
  server: {
    url: 'https://117bb8e7-2e6f-4681-9365-55049936510d.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#000000"
    },
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#000000",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#23cfc9",
    }
  }
};

export default config;
