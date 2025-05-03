
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from 'lucide-react';
import { useLocationPermission } from '@/hooks/useLocationPermission';

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
  const { user, loading } = useAuth();
  const { permissionStatus, isLocationStale, hasInitialized } = useLocationPermission();

  const isDeliveryPath = window.location.pathname.includes('/delivery/');
  const shouldCheckLocation = requiresLocation || isDeliveryPath;

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
    const userType = user.user_metadata?.user_type || 'customer';
    if (!allowedUserTypes.includes(userType)) {
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

  // No need to check location for non-delivery users on non-location required routes
  const userType = user.user_metadata?.user_type || 'customer';
  if (!shouldCheckLocation || userType !== 'delivery') {
    return <>{children}</>;
  }

  // For delivery users or routes that require location, check permission status
  if (permissionStatus === 'denied') {
    // If location is denied for delivery workers, redirect to a settings page
    // where they can get instructions to enable location services
    return <Navigate to="/delivery/settings?locationDenied=true" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
