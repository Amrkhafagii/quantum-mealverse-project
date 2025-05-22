
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { AuthForm } from '@/components/AuthForm';
import ParticleBackground from '@/components/ParticleBackground';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from 'lucide-react';
import SafeAreaView from '@/components/ios/SafeAreaView';
import { Platform } from '@/utils/platform';

interface AuthProps {
  mode?: 'login' | 'signup';
}

const Auth: React.FC<AuthProps> = ({ mode: propMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Get any state passed from navigation
  const { state } = location;
  const mode = propMode || state?.mode || 'login';
  const returnTo = state?.returnTo || '/';

  // Initialize platform detection safely
  useEffect(() => {
    let isMounted = true;
    
    const initPlatform = async () => {
      try {
        // Small delay to ensure everything is loaded
        await new Promise(resolve => setTimeout(resolve, 50));
        
        if (isMounted) {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing platform:', error);
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };
    
    initPlatform();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // If user is already logged in, redirect appropriately
  useEffect(() => {
    if (user && !loading && isInitialized) {
      console.log("Auth: User is logged in, redirecting", { user, returnTo });
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
  }, [user, loading, navigate, returnTo, isInitialized]);

  if (loading || !isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-quantum-black">
        <Loader className="h-8 w-8 text-quantum-cyan animate-spin" />
      </div>
    );
  }

  const renderContent = () => (
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
  );

  // Use SafeAreaView on iOS platforms
  if (Platform.isIOS()) {
    return (
      <div className="min-h-screen bg-quantum-black text-white relative">
        <ParticleBackground />
        <SafeAreaView>
          <Navbar />
        </SafeAreaView>
        {renderContent()}
        <Footer />
      </div>
    );
  }

  // Default rendering for non-iOS platforms
  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      {renderContent()}
      <Footer />
    </div>
  );
};

export default Auth;
