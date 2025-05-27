
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { AuthForm } from '@/components/AuthForm';
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
  const { user, loading } = useAuth();
  
  // Get any state passed from navigation
  const { state } = location;
  const mode = propMode || state?.mode || 'login';
  const returnTo = state?.returnTo || '/';

  // If user is already logged in, redirect appropriately
  useEffect(() => {
    if (user && !loading) {
      console.log("Auth page: User is logged in, checking redirect", { user, returnTo });
      
      // Check if the user is a restaurant owner
      const userType = user.user_metadata?.user_type;
      
      console.log("Auth page: User type from metadata:", userType);
      
      if (userType === 'delivery') {
        console.log("Auth page: Redirecting delivery user to dashboard");
        navigate('/delivery/dashboard', { replace: true });
      } else if (userType === 'restaurant') {
        console.log("Auth page: Redirecting restaurant user to dashboard");
        navigate('/restaurant/dashboard', { replace: true });
      } else if (userType === 'customer') {
        console.log("Auth page: Redirecting customer user to customer page");
        navigate('/customer', { replace: true });
      } else {
        // Default redirect for users without type - but prioritize customer page for general users
        console.log("Auth page: No specific user type, redirecting to customer page");
        navigate('/customer', { replace: true });
      }
    }
  }, [user, loading, navigate, returnTo]);

  // Show loading state while auth is in progress
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-quantum-black">
        <Loader className="h-8 w-8 text-quantum-cyan animate-spin" />
      </div>
    );
  }

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
            <AuthForm isRegister={mode === 'signup'} />
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
