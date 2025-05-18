
import { useState, useEffect } from 'react';
import ARPreview, { ModelLoadOptions, ARPreviewOptions } from '../plugins/ARPreviewPlugin';

export const useARPreview = () => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  
  useEffect(() => {
    const checkSupport = async () => {
      try {
        const result = await ARPreview.isSupported();
        setIsSupported(result.supported);
      } catch (err) {
        console.error('Error checking AR support:', err);
        setError('Failed to check AR support');
        setIsSupported(false);
      }
    };
    
    checkSupport();
  }, []);
  
  const startARSession = async (options: ARPreviewOptions = { planeDetection: true }) => {
    if (!isSupported) {
      setError('AR is not supported on this device');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await ARPreview.startARSession(options);
      setIsActive(true);
      return true;
    } catch (err) {
      console.error('Error starting AR session:', err);
      setError('Failed to start AR session');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadModel = async (options: ModelLoadOptions) => {
    if (!isActive) {
      setError('AR session must be active to load a model');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await ARPreview.loadModel(options);
      return result.success;
    } catch (err) {
      console.error('Error loading AR model:', err);
      setError('Failed to load AR model');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const placeModel = async (position?: { x: number, y: number, z: number }) => {
    if (!isActive) {
      setError('AR session must be active to place a model');
      return false;
    }
    
    try {
      await ARPreview.placeModel(position);
      return true;
    } catch (err) {
      console.error('Error placing AR model:', err);
      setError('Failed to place AR model');
      return false;
    }
  };
  
  const stopARSession = async () => {
    if (!isActive) return;
    
    try {
      await ARPreview.stopARSession();
      setIsActive(false);
    } catch (err) {
      console.error('Error stopping AR session:', err);
      setError('Failed to stop AR session');
    }
  };
  
  return {
    isSupported,
    isLoading,
    error,
    isActive,
    startARSession,
    loadModel,
    placeModel,
    stopARSession
  };
};
