
import React from 'react';
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

  React.useEffect(() => {
    const checkAdminStatus = async () => {
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
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };
    
    checkAdminStatus();
  }, []);

  const goToAdminDashboard = () => {
    navigate('/admin');
  };

  const exploreMeals = () => {
    navigate('/customer');
  };

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-20">
        {/* Hero Section */}
        <section className="h-screen flex items-center justify-center text-center px-4">
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-bold text-quantum-cyan neon-text">
              ZenithMeals
            </h1>
            <p className="text-xl md:text-2xl text-galaxy-purple max-w-2xl mx-auto">
              Experience the future of food delivery with our AI-powered meal recommendations
              and augmented reality previews
            </p>
            <button 
              className="cyber-button text-lg"
              onClick={exploreMeals}
            >
              Explore Meals
            </button>

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

        {/* Featured Meals Section */}
        <FeaturedMeals />
      </main>
    </div>
  );
};

export default Index;
