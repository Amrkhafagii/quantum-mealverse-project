
export const capacitorGeolocation = {
  getCurrentPosition: async () => {
    throw new Error('Capacitor not implemented');
  },
  watchPosition: () => {
    throw new Error('Capacitor not implemented');
  },
  clearWatch: () => {
    throw new Error('Capacitor not implemented');
  },
  checkPermissions: async () => {
    return { location: 'prompt' };
  },
  requestPermissions: async () => {
    return { location: 'prompt' };
  }
};
