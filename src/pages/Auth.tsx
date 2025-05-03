
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { AuthForm } from '@/components/AuthForm';
import ParticleBackground from '@/components/ParticleBackground';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Get any state passed from navigation
  const { state } = location;
  const mode = state?.mode || 'login';
  const returnTo = state?.returnTo || '/';

  // If user is already logged in, redirect appropriately
  React.useEffect(() => {
    if (user) {
      // Check if the user is a delivery person
      const userType = user.user_metadata?.user_type;
      
      if (userType === 'delivery') {
        navigate('/delivery/dashboard', { replace: true });
      } else if (userType === 'restaurant') {
        navigate('/restaurant/dashboard', { replace: true });
      } else {
        navigate(returnTo || '/', { replace: true });
      }
    }
  }, [user, navigate, returnTo]);

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      <div className="relative z-10 flex items-center justify-center min-h-screen py-20">
        <div className="w-full max-w-md px-4">
          <Card className="holographic-card p-8">
            <h1 className="text-4xl font-bold text-quantum-cyan mb-8 text-center neon-text">HealthAndFix</h1>
            <AuthForm isRegister={mode === 'signup'} />
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
