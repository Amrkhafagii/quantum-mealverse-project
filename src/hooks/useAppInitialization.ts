
import { useEffect } from 'react';
import { LocationServiceFactory, ILocationService } from '@/services/location/LocationService';
import { MapServiceFactory } from '@/services/maps/MapService';

/**
 * Hook for initializing app services
 * This ensures location and map services are properly initialized early in the app lifecycle
 */
export const useAppInitialization = () => {
  useEffect(() => {
    // Initialize essential services asynchronously
    const initializeServices = async () => {
      try {
        console.info('Initializing core services...');
        
        // Initialize location service first
        const locationService = await LocationServiceFactory.getLocationService();
        
        // Initialize map service after location service
        const mapService = await MapServiceFactory.getMapService();
        
        console.info('Core services initialized successfully');
      } catch (error) {
        console.error('Failed to initialize core services:', error);
      }
    };

    initializeServices();
  }, []);
};

export default useAppInitialization;
