
// This script is for initializing the Google Maps API key in the database
// Run this script with appropriate admin credentials
const API_KEY = 'AIzaSyBKQztvlSSaT-kjpzWBHIZ1uzgRh8rPlVs';

const initGoogleMapsKey = async () => {
  if (!API_KEY) {
    console.error('Google Maps API key is not set');
    return;
  }

  // Create a random admin key for one-time use
  const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'your-admin-key-here';
  
  try {
    const response = await fetch('https://hozgutjvbrljeijybnyg.supabase.co/functions/v1/init-app-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        admin_key: ADMIN_KEY,
        google_maps_api_key: API_KEY
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error initializing Google Maps API key:', data.error || response.statusText);
    } else {
      console.log('Google Maps API key initialized successfully:', data.message);
    }
  } catch (error) {
    console.error('Failed to initialize Google Maps API key:', error);
  }
};

// Run the initialization
initGoogleMapsKey();
