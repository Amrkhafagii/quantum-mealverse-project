
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dumbbell, Target, Calendar, Trophy, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

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
        
        <div className="flex justify-center mb-8">
          <Card className="w-full max-w-4xl bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardContent className="pt-6 text-center">
              <Dumbbell className="h-16 w-16 mx-auto mb-4 text-quantum-cyan" />
              <h2 className="text-2xl font-bold mb-4">Workout Module Coming Soon!</h2>
              <p className="text-gray-300 mb-6">
                We're working hard to bring you a comprehensive workout tracking and planning system.
                Soon you'll be able to:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className="bg-quantum-darkBlue/50 p-4 rounded-lg flex items-start gap-4">
                  <Calendar className="h-6 w-6 text-quantum-cyan flex-shrink-0 mt-1" />
                  <div className="text-left">
                    <h3 className="font-semibold mb-1">Plan Workouts</h3>
                    <p className="text-sm text-gray-400">Create personalized workout routines based on your goals and available equipment</p>
                  </div>
                </div>
                
                <div className="bg-quantum-darkBlue/50 p-4 rounded-lg flex items-start gap-4">
                  <Clock className="h-6 w-6 text-quantum-purple flex-shrink-0 mt-1" />
                  <div className="text-left">
                    <h3 className="font-semibold mb-1">Track Progress</h3>
                    <p className="text-sm text-gray-400">Log weights, sets, reps, and see your strength progression over time</p>
                  </div>
                </div>
                
                <div className="bg-quantum-darkBlue/50 p-4 rounded-lg flex items-start gap-4">
                  <Target className="h-6 w-6 text-quantum-cyan flex-shrink-0 mt-1" />
                  <div className="text-left">
                    <h3 className="font-semibold mb-1">Exercise Library</h3>
                    <p className="text-sm text-gray-400">Access a comprehensive database of exercises with proper form instructions</p>
                  </div>
                </div>
                
                <div className="bg-quantum-darkBlue/50 p-4 rounded-lg flex items-start gap-4">
                  <Trophy className="h-6 w-6 text-quantum-purple flex-shrink-0 mt-1" />
                  <div className="text-left">
                    <h3 className="font-semibold mb-1">Get Rewards</h3>
                    <p className="text-sm text-gray-400">Earn achievements and track your fitness milestones</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Button
                  onClick={() => navigate('/fitness')}
                  className="bg-quantum-cyan hover:bg-quantum-cyan/90"
                >
                  Return to Nutrition Planner
                </Button>
                
                {user && (
                  <Button
                    onClick={() => navigate('/fitness-profile')}
                    className="bg-quantum-purple hover:bg-quantum-purple/90 ml-4"
                  >
                    View Fitness Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Workouts;
