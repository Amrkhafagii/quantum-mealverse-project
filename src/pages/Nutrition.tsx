
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Info, ArrowRight, CalendarCheck } from 'lucide-react';
import { toast } from 'sonner';

const Nutrition = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    }
  };

  const handleSubscriptionRedirect = () => {
    toast.info("Redirecting to subscription plans");
    navigate('/subscription');
  };

  return (
    <div className="min-h-screen bg-quantum-black text-white relative overflow-hidden">
      <ParticleBackground />
      <Navbar />
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-quantum-purple/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-quantum-cyan/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
      
      <main className="container mx-auto px-4 py-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-quantum-cyan mb-4 neon-text">
            Zenith Nutrition
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-gray-300">
            Discover personalized nutrition plans designed to optimize your health and performance
          </p>
        </motion.div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-16">
          <TabsList className="w-full max-w-2xl mx-auto mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="meal-plans">Meal Plans</TabsTrigger>
            <TabsTrigger value="nutrition-science">Science</TabsTrigger>
            {user && <TabsTrigger value="my-nutrition">My Nutrition</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="overview">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
            >
              <motion.div variants={itemVariants}>
                <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 backdrop-blur-sm h-full">
                  <CardHeader>
                    <CardTitle className="text-quantum-cyan text-2xl">Personalized Nutrition</CardTitle>
                    <CardDescription className="text-gray-300">Tailored meal plans based on your goals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <Check className="text-quantum-cyan h-5 w-5" />
                        <span>Customized macronutrient ratios</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="text-quantum-cyan h-5 w-5" />
                        <span>Options for various dietary preferences</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="text-quantum-cyan h-5 w-5" />
                        <span>Regular adjustment based on your progress</span>
                      </li>
                    </ul>
                    <Button 
                      onClick={() => setActiveTab('meal-plans')} 
                      className="mt-6 bg-quantum-purple hover:bg-quantum-purple/80 text-white"
                    >
                      Explore Meal Plans <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 backdrop-blur-sm h-full">
                  <CardHeader>
                    <CardTitle className="text-quantum-cyan text-2xl">Nutritional Guidance</CardTitle>
                    <CardDescription className="text-gray-300">Expert advice to optimize your diet</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <Check className="text-quantum-cyan h-5 w-5" />
                        <span>Evidence-based nutrition recommendations</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="text-quantum-cyan h-5 w-5" />
                        <span>Food timing strategies for performance</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="text-quantum-cyan h-5 w-5" />
                        <span>Supplement guidance when appropriate</span>
                      </li>
                    </ul>
                    <Button 
                      onClick={() => setActiveTab('nutrition-science')} 
                      className="mt-6 bg-quantum-purple hover:bg-quantum-purple/80 text-white"
                    >
                      Learn More <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 text-center"
            >
              <Button 
                onClick={handleSubscriptionRedirect} 
                size="lg" 
                className="bg-quantum-purple hover:bg-quantum-purple/80 text-white"
              >
                <CalendarCheck className="mr-2 h-5 w-5" />
                View Subscription Plans
              </Button>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="meal-plans">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            >
              <motion.div variants={itemVariants}>
                <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 backdrop-blur-sm h-full">
                  <CardHeader>
                    <CardTitle className="text-quantum-cyan text-2xl">Basic Zenith</CardTitle>
                    <CardDescription className="text-gray-300">Starting at $99/month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start gap-3">
                        <Check className="text-quantum-cyan h-5 w-5 mt-1" />
                        <span>5 meals per week delivered to your door</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="text-quantum-cyan h-5 w-5 mt-1" />
                        <span>Basic meal tracking with our mobile app</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="text-quantum-cyan h-5 w-5 mt-1" />
                        <span>Email support for nutrition questions</span>
                      </li>
                    </ul>
                    <Button 
                      onClick={handleSubscriptionRedirect} 
                      className="w-full bg-transparent border border-quantum-cyan text-quantum-cyan hover:bg-quantum-cyan/10"
                    >
                      View Plan
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Card className="bg-quantum-darkBlue/30 border-quantum-purple relative overflow-hidden h-full">
                  <div className="absolute top-0 left-0 right-0 bg-quantum-purple text-center py-1 px-4 text-sm font-bold">
                    MOST POPULAR
                  </div>
                  <CardHeader className="pt-8">
                    <CardTitle className="text-quantum-purple text-2xl">Pro Zenith</CardTitle>
                    <CardDescription className="text-gray-300">$179/month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start gap-3">
                        <Check className="text-quantum-purple h-5 w-5 mt-1" />
                        <span>10 meals per week delivered to your door</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="text-quantum-purple h-5 w-5 mt-1" />
                        <span>Advanced meal and macronutrient tracking</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="text-quantum-purple h-5 w-5 mt-1" />
                        <span>Personalized meal plan based on your goals</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="text-quantum-purple h-5 w-5 mt-1" />
                        <span>Priority email & chat support</span>
                      </li>
                    </ul>
                    <Button 
                      onClick={handleSubscriptionRedirect} 
                      className="w-full bg-quantum-purple hover:bg-quantum-darkPurple text-white"
                    >
                      View Plan
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 backdrop-blur-sm h-full">
                  <CardHeader>
                    <CardTitle className="text-quantum-cyan text-2xl">Ultimate Zenith</CardTitle>
                    <CardDescription className="text-gray-300">$279/month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start gap-3">
                        <Check className="text-quantum-cyan h-5 w-5 mt-1" />
                        <span>15 meals per week delivered to your door</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="text-quantum-cyan h-5 w-5 mt-1" />
                        <span>Complete meal and biometric tracking</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="text-quantum-cyan h-5 w-5 mt-1" />
                        <span>1-on-1 consultation with a nutritionist</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="text-quantum-cyan h-5 w-5 mt-1" />
                        <span>24/7 priority support</span>
                      </li>
                    </ul>
                    <Button 
                      onClick={handleSubscriptionRedirect} 
                      className="w-full bg-transparent border border-quantum-cyan text-quantum-cyan hover:bg-quantum-cyan/10"
                    >
                      View Plan
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="nutrition-science">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-4xl mx-auto"
            >
              <motion.div variants={itemVariants}>
                <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 backdrop-blur-sm mb-8">
                  <CardHeader>
                    <CardTitle className="text-quantum-cyan text-2xl">The Science of Nutrition</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-lg">
                      At Zenith, we base our nutritional recommendations on the latest scientific research. 
                      Our approach combines principles from sports nutrition, metabolic science, and performance 
                      optimization to create truly personalized nutrition plans.
                    </p>
                    <p className="mb-6 text-lg">
                      We use evidence-based formulas like the Mifflin-St Jeor equation, modified by activity 
                      levels to calculate your specific caloric needs, and then optimize macronutrient ratios 
                      based on your personal goals and body composition.
                    </p>
                    <div className="bg-quantum-darkBlue/50 p-6 rounded-lg border border-quantum-cyan/30 mb-6">
                      <h3 className="text-xl font-bold text-quantum-cyan mb-3">Key Nutritional Principles</h3>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                          <div className="bg-quantum-cyan/20 p-2 rounded-full mt-1">
                            <Check className="text-quantum-cyan h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-bold">Protein Timing</h4>
                            <p className="text-gray-300">Strategically timed protein consumption enhances muscle protein synthesis and recovery</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="bg-quantum-cyan/20 p-2 rounded-full mt-1">
                            <Check className="text-quantum-cyan h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-bold">Carbohydrate Periodization</h4>
                            <p className="text-gray-300">Varying carbohydrate intake based on training intensity and goals optimizes performance and body composition</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="bg-quantum-cyan/20 p-2 rounded-full mt-1">
                            <Check className="text-quantum-cyan h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-bold">Essential Fatty Acids</h4>
                            <p className="text-gray-300">Strategic integration of omega-3 and omega-6 fatty acids supports cellular health and reduces inflammation</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className="flex items-center p-4 bg-quantum-purple/20 rounded-lg border border-quantum-purple/30">
                      <Info className="text-quantum-purple h-6 w-6 mr-3 flex-shrink-0" />
                      <p>Our nutrition plans are constantly updated based on the latest peer-reviewed research to ensure you're getting science-backed recommendations.</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-quantum-cyan text-2xl">Personalized Nutrition Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-6 text-lg">
                      Discover how our advanced nutritional algorithms can help optimize your diet for your specific goals:
                    </p>
                    <Button 
                      onClick={() => navigate('/fitness')} 
                      className="w-full bg-quantum-purple hover:bg-quantum-purple/80 text-white"
                    >
                      Access Nutrition Calculator
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>
          
          {user && (
            <TabsContent value="my-nutrition">
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-4xl mx-auto"
              >
                <motion.div variants={itemVariants}>
                  <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 backdrop-blur-sm mb-8">
                    <CardHeader>
                      <CardTitle className="text-quantum-cyan text-2xl">Your Nutrition Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-6">
                        Access your nutrition profile to view your personalized meal recommendations and track your progress.
                      </p>
                      <div className="grid md:grid-cols-2 gap-6">
                        <Button 
                          onClick={() => navigate('/profile')}
                          variant="outline" 
                          className="border-quantum-cyan text-quantum-cyan hover:bg-quantum-cyan/10"
                        >
                          View Subscription Status
                        </Button>
                        <Button 
                          onClick={() => navigate('/fitness')}
                          className="bg-quantum-purple hover:bg-quantum-purple/80 text-white"
                        >
                          Access Meal Calculator
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Button 
                    onClick={handleSubscriptionRedirect} 
                    className="w-full bg-quantum-purple hover:bg-quantum-purple/80 text-white"
                  >
                    <CalendarCheck className="mr-2 h-5 w-5" />
                    Manage Meal Plan Subscription
                  </Button>
                </motion.div>
              </motion.div>
            </TabsContent>
          )}
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Nutrition;
