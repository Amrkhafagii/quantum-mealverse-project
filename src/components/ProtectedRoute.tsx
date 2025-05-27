
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
    userMetadata: user?.user_metadata
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
    const currentUserType = userType || 'customer'; // Only use customer as absolute fallback
    
    console.log('ProtectedRoute: User type check', { 
      currentUserType, 
      allowedUserTypes,
      userType,
      userMetadata: user.user_metadata,
      userEmail: user.email 
    });
    
    if (!allowedUserTypes.includes(currentUserType)) {
      console.log('ProtectedRoute: User type not allowed, redirecting based on type');
      // Redirect to appropriate dashboard based on user type
      if (currentUserType === 'delivery') {
        return <Navigate to="/delivery/dashboard" replace />;
      } else if (currentUserType === 'restaurant') {
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
