
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import RecommendedMeals from '@/components/recommendations/RecommendedMeals';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Utensils, Calendar, Activity, ChevronRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  if (!user) {
    return null; // or loading state
  }

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-quantum-cyan mb-8 neon-text">Your Dashboard</h1>
          
          <div className="mb-8">
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Welcome back, {user.email?.split('@')[0]}</CardTitle>
                  <CardDescription>Here's what's happening with your account</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/profile')}
                  className="border-quantum-cyan text-quantum-cyan hover:bg-quantum-cyan/10"
                >
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </CardHeader>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 hover:border-quantum-cyan/50 transition-colors cursor-pointer" onClick={() => navigate('/customer')}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <Utensils className="h-8 w-8 text-quantum-cyan mb-2" />
                    <h3 className="text-lg font-semibold">Order Meals</h3>
                    <p className="text-sm text-gray-400">Browse and order from our menu</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-quantum-cyan" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 hover:border-quantum-cyan/50 transition-colors cursor-pointer" onClick={() => navigate('/nutrition')}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <TrendingUp className="h-8 w-8 text-quantum-cyan mb-2" />
                    <h3 className="text-lg font-semibold">Nutrition Planning</h3>
                    <p className="text-sm text-gray-400">Create and customize meal plans</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-quantum-cyan" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 hover:border-quantum-cyan/50 transition-colors cursor-pointer" onClick={() => navigate('/workouts')}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <Activity className="h-8 w-8 text-quantum-cyan mb-2" />
                    <h3 className="text-lg font-semibold">Workout Plans</h3>
                    <p className="text-sm text-gray-400">Track your fitness activities</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-quantum-cyan" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="recommendations" className="mb-8">
            <TabsList className="bg-quantum-darkBlue/30 w-full justify-start gap-4 p-2">
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-quantum-cyan data-[state=active]:text-quantum-black">
                Recommendations
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-quantum-cyan data-[state=active]:text-quantum-black">
                Recent Orders
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="data-[state=active]:bg-quantum-cyan data-[state=active]:text-quantum-black">
                Subscriptions
              </TabsTrigger>
            </TabsList>
            <TabsContent value="recommendations">
              <RecommendedMeals showTitle={false} />
            </TabsContent>
            <TabsContent value="orders">
              <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-xl">No recent orders</p>
                    <p className="text-gray-400 mt-2">Your order history will appear here</p>
                    <Button 
                      className="mt-4 bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90"
                      onClick={() => navigate('/customer')}
                    >
                      <Utensils className="h-4 w-4 mr-2" />
                      Order Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="subscriptions">
              <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-xl">No active subscriptions</p>
                    <p className="text-gray-400 mt-2">Subscribe to meal plans for regular deliveries</p>
                    <Button 
                      className="mt-4 bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90"
                      onClick={() => navigate('/subscription')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      View Plans
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
