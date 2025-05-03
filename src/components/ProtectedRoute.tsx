
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from 'lucide-react';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: string[];
  redirectPath?: string;
  requiresLocation?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedUserTypes,
  redirectPath = '/auth',
  requiresLocation = false
}) => {
  const { user, userType, loading } = useAuth();
  const { 
    permissionStatus, 
    isLocationStale, 
    hasInitialized, 
    requestPermission 
  } = useLocationPermission();

  const isDeliveryPath = window.location.pathname.includes('/delivery/');
  const isSettingsPath = window.location.pathname.includes('/delivery/settings');
  const shouldCheckLocation = requiresLocation || (isDeliveryPath && !isSettingsPath);
  
  // For delivery paths, check if we need to request location permission
  useEffect(() => {
    const checkAndRequestLocationForDelivery = async () => {
      if (isDeliveryPath && permissionStatus === 'prompt' && hasInitialized) {
        try {
          // Wait a moment for page to load before requesting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          toast.info("Location required", {
            description: "Delivery services need your location to function properly",
            duration: 5000
          });
          
          // Try to request permission
          await requestPermission();
        } catch (error) {
          console.error('Error requesting location permission:', error);
        }
      }
    };
    
    checkAndRequestLocationForDelivery();
  }, [isDeliveryPath, permissionStatus, hasInitialized, requestPermission]);

  if (loading || !hasInitialized) {
    return (
      <div className="h-screen flex items-center justify-center bg-quantum-black">
        <Loader className="h-8 w-8 text-quantum-cyan animate-spin" />
        <span className="ml-2 text-quantum-cyan">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If allowedUserTypes is specified, check if the user type is allowed
  if (allowedUserTypes && allowedUserTypes.length > 0) {
    if (!userType || !allowedUserTypes.includes(userType)) {
      // Redirect to appropriate dashboard based on user type
      if (userType === 'delivery') {
        return <Navigate to="/delivery/dashboard" replace />;
      } else if (userType === 'restaurant') {
        return <Navigate to="/restaurant/dashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  // Check if we need to verify location for delivery users
  if (shouldCheckLocation && userType === 'delivery') {
    // For delivery paths that require location access
    if (permissionStatus === 'denied') {
      // Redirect to settings page with query param
      return <Navigate to="/delivery/settings?locationDenied=true" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
