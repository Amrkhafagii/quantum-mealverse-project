
import React from 'react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dumbbell, LineChart, History, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import WorkoutPlanner from '@/components/fitness/WorkoutPlanner';

const Workouts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-quantum-cyan mb-4 neon-text">
          HealthAndFix Workouts
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mb-12">
          Find the perfect workout routine to match your fitness level and goals.
        </p>
        
        <Tabs defaultValue="plans" className="mb-12">
          <TabsList className="w-full max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-4">
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" /> Workout Plans
            </TabsTrigger>
            <TabsTrigger value="track" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" /> Track Progress
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" /> History
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4" /> Exercise Library
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="plans" className="mt-8">
            <WorkoutPlanner userId={user?.id} />
          </TabsContent>
          
          <TabsContent value="track">
            <Card className="w-full bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardContent className="pt-6 text-center">
                <LineChart className="h-16 w-16 mx-auto mb-4 text-quantum-cyan" />
                <h2 className="text-2xl font-bold mb-4">Workout Progress Tracking Coming Soon!</h2>
                <p className="text-gray-300 mb-6">
                  We're working on tools to help you track your progress, visualize your improvements,
                  and stay motivated on your fitness journey.
                </p>
                
                {user ? (
                  <Button
                    onClick={() => navigate('/fitness-profile')}
                    className="bg-quantum-purple hover:bg-quantum-purple/90"
                  >
                    View Fitness Profile
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate('/auth')}
                    className="bg-quantum-purple hover:bg-quantum-purple/90"
                  >
                    Sign Up to Get Notified
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card className="w-full bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardContent className="pt-6 text-center">
                <History className="h-16 w-16 mx-auto mb-4 text-quantum-cyan" />
                <h2 className="text-2xl font-bold mb-4">Workout History Coming Soon!</h2>
                <p className="text-gray-300 mb-6">
                  We're building a comprehensive workout history feature to help you track
                  all your past workouts and see your progress over time.
                </p>
                
                <Button
                  onClick={() => navigate('/fitness')}
                  className="bg-quantum-cyan hover:bg-quantum-cyan/90"
                >
                  Return to Nutrition Planner
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="video">
            <Card className="w-full bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardContent className="pt-6 text-center">
                <PlayCircle className="h-16 w-16 mx-auto mb-4 text-quantum-cyan" />
                <h2 className="text-2xl font-bold mb-4">Exercise Library Coming Soon!</h2>
                <p className="text-gray-300 mb-6">
                  Our team is working on a comprehensive video library with proper form demonstrations
                  for hundreds of exercises to help you train safely and effectively.
                </p>
                
                <Button
                  onClick={() => navigate('/fitness')}
                  className="bg-quantum-cyan hover:bg-quantum-cyan/90"
                >
                  Return to Nutrition Planner
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-quantum-darkBlue/30 rounded-lg p-6 border border-quantum-cyan/20">
            <h3 className="text-xl font-bold text-quantum-cyan mb-3">Evidence-Based Training</h3>
            <p className="text-gray-300">
              Our workout plans are designed by certified trainers and based on scientific research
              to ensure optimal results while minimizing injury risk.
            </p>
          </div>
          
          <div className="bg-quantum-darkBlue/30 rounded-lg p-6 border border-quantum-cyan/20">
            <h3 className="text-xl font-bold text-quantum-cyan mb-3">Progress Tracking</h3>
            <p className="text-gray-300">
              Track your strength gains, body measurements, and workout consistency to stay
              motivated and see your improvements over time.
            </p>
          </div>
          
          <div className="bg-quantum-darkBlue/30 rounded-lg p-6 border border-quantum-cyan/20">
            <h3 className="text-xl font-bold text-quantum-cyan mb-3">Integrated Approach</h3>
            <p className="text-gray-300">
              Combine nutrition planning with workout routines for a holistic approach to
              health and fitness that maximizes your results.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Workouts;
