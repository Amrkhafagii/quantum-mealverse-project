import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import AuthForm from '@/components/AuthForm';
import ParticleBackground from '@/components/ParticleBackground';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from 'lucide-react';

interface AuthProps {
  mode?: 'login' | 'signup';
}

const Auth: React.FC<AuthProps> = ({ mode: propMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userType, loading } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);
  
  // Get any state passed from navigation
  const { state } = location;
  const mode = propMode || state?.mode || 'login';
  
  console.log("Auth page: Current state", { user, userType, loading, hasRedirected });

  // Handle redirects for authenticated users
  useEffect(() => {
    // Prevent multiple redirects and wait for auth to finish loading
    if (hasRedirected || loading || !user) {
      return;
    }

    console.log("Auth page: User is logged in, checking redirect", { user, userType });
    
    // Set flag immediately to prevent multiple redirects
    setHasRedirected(true);
    
    // Determine redirect path based on user type
    let redirectPath = '/customer'; // default
    
    if (userType === 'delivery') {
      redirectPath = '/delivery/dashboard';
    } else if (userType === 'restaurant') {
      redirectPath = '/restaurant/dashboard';
    } else if (userType === 'customer') {
      redirectPath = '/customer';
    }
    
    console.log("Auth page: Redirecting to", redirectPath);
    
    // Small delay to ensure state updates are processed
    setTimeout(() => {
      navigate(redirectPath, { replace: true });
    }, 100);
  }, [user, userType, loading, navigate, hasRedirected]);

  // Show loading state while auth is in progress
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-quantum-black">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="h-8 w-8 text-quantum-cyan animate-spin" />
          <p className="text-quantum-cyan">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading state if user is authenticated and we're about to redirect
  if (user && !loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-quantum-black">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="h-8 w-8 text-quantum-cyan animate-spin" />
          <p className="text-quantum-cyan">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Render the auth form for non-authenticated users
  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      <div className="relative z-10 flex items-center justify-center min-h-screen py-20">
        <div className="w-full max-w-md px-4">
          <Card className="holographic-card p-8">
            <h1 className="text-4xl font-bold text-quantum-cyan mb-8 text-center neon-text">
              {mode === 'signup' ? 'Create Account' : 'HealthAndFix'}
            </h1>
            <AuthForm isSignUp={mode === 'signup'} />
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
