
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ParticleBackground from '@/components/ParticleBackground';
import { FeaturedMeals } from '@/components/FeaturedMeals';
import Navbar from '@/components/Navbar';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('admin_users')
            .select()
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (data) {
            setIsAdmin(true);
          }
        }
      } catch (error: any) {
        console.error("Error checking admin status:", error);
        setError(error?.message || "Failed to check admin status");
        
        // Show toast for better user feedback
        toast({
          title: "Connection Error",
          description: "Unable to connect to the server. Please check your internet connection.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [toast]);

  const goToAdminDashboard = () => {
    navigate('/admin');
  };

  const exploreSolutions = () => {
    navigate('/customer');
  };

  const exploreFitness = () => {
    navigate('/fitness');
  };

  // If we're having connection issues, show a fallback UI
  if (error) {
    return (
      <div className="min-h-screen bg-quantum-black text-white flex items-center justify-center">
        <div className="text-center p-4">
          <h1 className="text-3xl font-bold text-quantum-cyan mb-4">Connection Issue</h1>
          <p className="mb-4">{error}</p>
          <p className="mb-6">Please check your internet connection and reload the app.</p>
          <button 
            className="cyber-button text-lg"
            onClick={() => window.location.reload()}
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-20">
        {/* Hero Section */}
        <section className="h-screen flex items-center justify-center text-center px-4">
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-bold text-quantum-cyan neon-text">
              HealthAndFix
            </h1>
            <p className="text-xl md:text-2xl text-galaxy-purple max-w-2xl mx-auto">
              Experience the future of health and wellness with our AI-powered personalized solutions
              and holistic wellness approach
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="cyber-button text-lg"
                onClick={exploreSolutions}
              >
                Order Food
              </button>

              <button 
                className="cyber-button text-lg bg-quantum-purple"
                onClick={exploreFitness}
              >
                Fitness Planner
              </button>
            </div>

            {/* Admin section */}
            {isAdmin && (
              <div className="mt-8">
                <div className="p-4 bg-green-900/30 border border-green-500/50 rounded-lg max-w-md mx-auto">
                  <p className="text-green-400 mb-2">✓ You are logged in as an admin user</p>
                  <button 
                    onClick={goToAdminDashboard}
                    className="cyber-button bg-green-700 hover:bg-green-800 w-full"
                  >
                    Access Admin Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Featured Solutions Section */}
        <FeaturedMeals />
      </main>
    </div>
  );
};

export default Index;
