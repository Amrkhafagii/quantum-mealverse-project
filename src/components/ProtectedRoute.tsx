
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from 'lucide-react';

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

  console.log('ProtectedRoute: Checking access', { 
    user: !!user, 
    loading, 
    allowedUserTypes,
    userType,
    pathname: window.location.pathname
  });

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-quantum-black">
        <Loader className="h-8 w-8 text-quantum-cyan animate-spin" />
        <span className="ml-2 text-quantum-cyan">Loading...</span>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // If allowedUserTypes is specified, check if the user type is allowed
  if (allowedUserTypes && allowedUserTypes.length > 0) {
    // Wait for userType to be determined
    if (!userType) {
      console.log('ProtectedRoute: User type still loading');
      return (
        <div className="h-screen flex items-center justify-center bg-quantum-black">
          <Loader className="h-8 w-8 text-quantum-cyan animate-spin" />
          <span className="ml-2 text-quantum-cyan">Checking permissions...</span>
        </div>
      );
    }
    
    console.log('ProtectedRoute: User type check', { 
      userType, 
      allowedUserTypes,
      userEmail: user.email 
    });
    
    if (!allowedUserTypes.includes(userType)) {
      console.log('ProtectedRoute: User type not allowed, redirecting based on type');
      // Redirect to appropriate dashboard based on user type
      if (userType === 'delivery') {
        return <Navigate to="/delivery/dashboard" replace />;
      } else if (userType === 'restaurant') {
        return <Navigate to="/restaurant/dashboard" replace />;
      } else {
        return <Navigate to="/customer" replace />;
      }
    }
  }

  console.log('ProtectedRoute: Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;
