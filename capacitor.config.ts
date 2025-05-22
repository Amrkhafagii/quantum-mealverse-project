
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.117bb8e72e6f4681936555049936510d',
  appName: 'quantum-mealverse-project',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
    // Development URL removed to ensure app loads web assets from bundle
    // Uncomment the below lines during development only
    // url: 'http://localhost:8080',
    // cleartext: true
  },
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
