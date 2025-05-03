
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: string[];
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedUserTypes,
  redirectPath = '/auth'
}) => {
  const { user, loading } = useAuth();

  if (loading) {
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

  return <>{children}</>;
};

export default ProtectedRoute;
