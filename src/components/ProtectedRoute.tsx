
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
  const { user, loading } = useAuth();

  console.log('ProtectedRoute: Checking access', { 
    user: !!user, 
    loading, 
    allowedUserTypes,
    userMetadata: user?.user_metadata,
    userType: user?.user_metadata?.user_type 
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
    const userType = user.user_metadata?.user_type || 'customer'; // Default to customer if no type set
    
    console.log('ProtectedRoute: User type check', { 
      userType, 
      allowedUserTypes,
      userMetadata: user.user_metadata,
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
