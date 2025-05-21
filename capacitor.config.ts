
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.117bb8e72e6f4681936555049936510d',
  appName: 'quantum-mealverse-project',
  webDir: 'dist',
 
  plugins: {
    BiometricAuth: {
      // Plugin-specific configurations would go here
    },
    GoogleMaps: {
      apiKey: "AIzaSyBKQztvlSSaT-kjpzWBHIZ1uzgRh8rPlVs" // Replace with your actual Google Maps API key
    }
  }
};

export default config;
