
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.117bb8e72e6f4681936555049936510d',
  appName: 'quantum-mealverse-project',
  webDir: 'dist',
  server: {
    url: 'https://117bb8e7-2e6f-4681-9365-55049936510d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    BiometricAuth: {
      // Plugin-specific configurations would go here
    },
    GoogleMaps: {
      apiKey: "YOUR_GOOGLE_MAPS_API_KEY_HERE" // Replace with your actual Google Maps API key
    }
  }
};

export default config;
