
import React from 'react';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { useAuth } from '@/hooks/useAuth';

export const BackgroundTrackingPermissions: React.FC = () => {
  const { 
    permissionStatus,
    backgroundPermissionStatus,
  } = useLocationPermission();
  
  const { user } = useAuth();

  // Return null - we're not showing permission prompts anymore
  return null;
};

