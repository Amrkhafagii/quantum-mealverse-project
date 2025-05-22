
import React, { useEffect, useState, useCallback } from 'react';
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
import { BiometricErrorBoundary } from '@/components/auth/BiometricErrorBoundary';
import { useToast } from '@/components/ui/use-toast';

interface AuthProps {
  mode?: 'login' | 'signup';
}

const Auth: React.FC<AuthProps> = ({ mode: propMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  
  // Get any state passed from navigation
  const { state } = location;
  const mode = propMode || state?.mode || 'login';
  const returnTo = state?.returnTo || '/';

  // Handle authentication errors
  const handleAuthError = useCallback((error: any) => {
    console.error('Authentication error:', error);
    toast({
      title: "Authentication error",
      description: "There was a problem with authentication. Please try again.",
      variant: "destructive",
    });
  }, [toast]);

  // Initialize platform detection safely
  useEffect(() => {
    let isMounted = true;
    let platformCheckTimer: number | undefined;
    
    const initPlatform = async () => {
      try {
        // Check if platform is initialized
        if (Platform.isInitialized()) {
          if (isMounted) {
            setIsInitialized(true);
          }
          return;
        }
        
        // Try again after a short delay
        platformCheckTimer = window.setTimeout(initPlatform, 100);
      } catch (error) {
        console.error('Error checking platform initialization:', error);
        if (isMounted) {
          // Proceed anyway to avoid blocking the auth flow
          setIsInitialized(true);
        }
      }
    };
    
    initPlatform();
    
    return () => {
      isMounted = false;
      if (platformCheckTimer) {
        clearTimeout(platformCheckTimer);
      }
    };
  }, []);

  // If user is already logged in, redirect appropriately
  useEffect(() => {
    if (user && !loading) {
      console.log("Auth: User is logged in, redirecting", { user, returnTo });
      
      // Use a short timeout to ensure any pending state updates complete
      const redirectTimer = setTimeout(() => {
        // Check if the user is a delivery person
        const userType = user.user_metadata?.user_type;
        
        try {
          if (userType === 'delivery') {
            navigate('/delivery/dashboard', { replace: true });
          } else if (userType === 'restaurant') {
            navigate('/restaurant/dashboard', { replace: true });
          } else {
            navigate(returnTo || '/', { replace: true });
          }
        } catch (error) {
          console.error("Navigation error:", error);
          // Fallback to home page if navigation fails
          navigate('/', { replace: true });
        }
      }, 100);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [user, loading, navigate, returnTo]);

  // Show loading state while both auth and platform initialization are in progress
  if (loading || !isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-quantum-black">
        <Loader className="h-8 w-8 text-quantum-cyan animate-spin" />
      </div>
    );
  }

  const renderContent = () => (
    <BiometricErrorBoundary onError={handleAuthError}>
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
    </BiometricErrorBoundary>
  );

  // Use SafeAreaView on iOS platforms with platform-safe detection
  const isIOS = (() => {
    try {
      return Platform.isInitialized() && Platform.isIOS();
    } catch (e) {
      return false;
    }
  })();

  if (isIOS) {
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
