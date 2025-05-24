
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/useAuth';
import { User, Apple, Target, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';

const Nutrition = () => {
  const { user } = useAuth();
  const [selectedMealPlan, setSelectedMealPlan] = useState('balanced');

  const mealPlans = [
    {
      id: 'balanced',
      name: 'Balanced Nutrition',
      description: 'Perfect balance of proteins, carbs, and healthy fats',
      calories: '2000-2200',
      protein: '25%',
      carbs: '45%',
      fats: '30%'
    },
    {
      id: 'high-protein',
      name: 'High Protein',
      description: 'Ideal for muscle building and recovery',
      calories: '2100-2300',
      protein: '35%',
      carbs: '35%',
      fats: '30%'
    },
    {
      id: 'low-carb',
      name: 'Low Carb',
      description: 'Reduced carbohydrates for weight management',
      calories: '1800-2000',
      protein: '30%',
      carbs: '25%',
      fats: '45%'
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-quantum-black text-white relative">
        <ParticleBackground />
        <Navbar />
        
        <main className="relative z-10 pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-quantum-cyan mb-6 neon-text">Nutrition Planning</h1>
              <p className="text-xl text-gray-300 mb-8">
                Discover personalized meal plans and nutrition guidance to achieve your health goals
              </p>
              
              <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 mb-8">
                <CardHeader>
                  <User className="h-12 w-12 text-quantum-cyan mx-auto mb-4" />
                  <CardTitle className="text-2xl">Sign in for Personalized Nutrition</CardTitle>
                  <CardDescription className="text-gray-300">
                    Get custom meal plans, track your progress, and receive personalized recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/auth">
                    <Button className="bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90 mb-4">
                      Sign in to Get Started
                    </Button>
                  </Link>
                  <p className="text-sm text-gray-400">
                    New to Quantum Mealverse? Create your free account to access nutrition features
                  </p>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-quantum-darkBlue/20 border-quantum-cyan/10">
                  <CardContent className="pt-6 text-center">
                    <Apple className="h-12 w-12 text-quantum-cyan mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Custom Meal Plans</h3>
                    <p className="text-gray-400 text-sm">
                      Personalized nutrition plans based on your goals, preferences, and dietary restrictions
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-quantum-darkBlue/20 border-quantum-cyan/10">
                  <CardContent className="pt-6 text-center">
                    <Target className="h-12 w-12 text-quantum-cyan mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Goal Tracking</h3>
                    <p className="text-gray-400 text-sm">
                      Monitor your nutrition goals and track progress with detailed analytics
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-quantum-darkBlue/20 border-quantum-cyan/10">
                  <CardContent className="pt-6 text-center">
                    <Utensils className="h-12 w-12 text-quantum-cyan mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Meal Recommendations</h3>
                    <p className="text-gray-400 text-sm">
                      AI-powered suggestions from our quantum meal database to meet your needs
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-quantum-darkBlue/20 border-quantum-cyan/10">
                <CardHeader>
                  <CardTitle className="text-xl">Sample Meal Plans</CardTitle>
                  <CardDescription>
                    Preview what you can achieve with personalized nutrition planning
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {mealPlans.map((plan) => (
                      <div key={plan.id} className="p-4 border border-quantum-cyan/20 rounded-lg">
                        <h4 className="font-semibold text-quantum-cyan mb-2">{plan.name}</h4>
                        <p className="text-sm text-gray-400 mb-3">{plan.description}</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Calories:</span>
                            <span>{plan.calories}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Protein:</span>
                            <span>{plan.protein}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Carbs:</span>
                            <span>{plan.carbs}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fats:</span>
                            <span>{plan.fats}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-quantum-cyan mb-8 neon-text">Nutrition Planning</h1>
          
          <Tabs defaultValue="meal-plans" className="mb-8">
            <TabsList className="bg-quantum-darkBlue/30 w-full justify-start gap-4 p-2">
              <TabsTrigger value="meal-plans" className="data-[state=active]:bg-quantum-cyan data-[state=active]:text-quantum-black">
                Meal Plans
              </TabsTrigger>
              <TabsTrigger value="goals" className="data-[state=active]:bg-quantum-cyan data-[state=active]:text-quantum-black">
                Nutrition Goals
              </TabsTrigger>
              <TabsTrigger value="tracking" className="data-[state=active]:bg-quantum-cyan data-[state=active]:text-quantum-black">
                Progress Tracking
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="meal-plans">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                    <CardHeader>
                      <CardTitle>Your Personalized Meal Plans</CardTitle>
                      <CardDescription>
                        Choose from custom plans designed for your goals
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {mealPlans.map((plan) => (
                          <div 
                            key={plan.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedMealPlan === plan.id 
                                ? 'border-quantum-cyan bg-quantum-cyan/10' 
                                : 'border-quantum-cyan/20 hover:border-quantum-cyan/50'
                            }`}
                            onClick={() => setSelectedMealPlan(plan.id)}
                          >
                            <h3 className="font-semibold text-quantum-cyan mb-2">{plan.name}</h3>
                            <p className="text-gray-300 text-sm mb-3">{plan.description}</p>
                            <div className="grid grid-cols-4 gap-2 text-xs">
                              <div>
                                <span className="text-gray-400">Calories:</span>
                                <div className="font-medium">{plan.calories}</div>
                              </div>
                              <div>
                                <span className="text-gray-400">Protein:</span>
                                <div className="font-medium">{plan.protein}</div>
                              </div>
                              <div>
                                <span className="text-gray-400">Carbs:</span>
                                <div className="font-medium">{plan.carbs}</div>
                              </div>
                              <div>
                                <span className="text-gray-400">Fats:</span>
                                <div className="font-medium">{plan.fats}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Link to="/customer">
                        <Button className="w-full bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90">
                          Browse Meals
                        </Button>
                      </Link>
                      <Link to="/fitness">
                        <Button variant="outline" className="w-full border-quantum-cyan text-quantum-cyan">
                          View Fitness Plans
                        </Button>
                      </Link>
                      <Button variant="outline" className="w-full border-quantum-cyan text-quantum-cyan">
                        Schedule Consultation
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="goals">
              <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                <CardHeader>
                  <CardTitle>Nutrition Goals</CardTitle>
                  <CardDescription>
                    Set and track your nutrition objectives
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-xl">Goal setting feature coming soon!</p>
                    <p className="text-gray-400 mt-2">Track calories, macros, and nutrition targets</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tracking">
              <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                <CardHeader>
                  <CardTitle>Progress Tracking</CardTitle>
                  <CardDescription>
                    Monitor your nutrition journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-xl">Progress tracking coming soon!</p>
                    <p className="text-gray-400 mt-2">Visualize your nutrition data and trends</p>
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

export default Nutrition;
