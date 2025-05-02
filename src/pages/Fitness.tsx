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
import { Check, Info, ArrowRight, ActivitySquare, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkoutData } from '@/hooks/useWorkoutData';

const Fitness = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { stats, plans, loading } = useWorkoutData();
  
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

  const handleNutritionRedirect = () => {
    toast.info("Redirecting to nutrition page");
    navigate('/nutrition');
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
            Zenith Fitness
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-gray-300">
            Elevate your fitness journey with personalized workouts and expert guidance
          </p>
        </motion.div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-16">
          <TabsList className="w-full max-w-2xl mx-auto mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workout-plans">Workout Plans</TabsTrigger>
            <TabsTrigger value="fitness-science">Science</TabsTrigger>
            {user && <TabsTrigger value="my-fitness">My Fitness</TabsTrigger>}
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
                    <CardTitle className="text-quantum-cyan text-2xl">Personalized Training</CardTitle>
                    <CardDescription className="text-gray-300">Custom workout plans for your goals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <Check className="text-quantum-cyan h-5 w-5" />
                        <span>AI-generated workout routines</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="text-quantum-cyan h-5 w-5" />
                        <span>Progress tracking and adjustments</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="text-quantum-cyan h-5 w-5" />
                        <span>Video demonstrations for proper form</span>
                      </li>
                    </ul>
                    <Button 
                      onClick={() => setActiveTab('workout-plans')} 
                      className="mt-6 bg-quantum-purple hover:bg-quantum-purple/80 text-white"
                    >
                      Explore Workouts <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 backdrop-blur-sm h-full">
                  <CardHeader>
                    <CardTitle className="text-quantum-cyan text-2xl">Performance Tracking</CardTitle>
                    <CardDescription className="text-gray-300">Monitor your progress with advanced metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <Check className="text-quantum-cyan h-5 w-5" />
                        <span>Detailed workout analytics</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="text-quantum-cyan h-5 w-5" />
                        <span>Body composition tracking</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="text-quantum-cyan h-5 w-5" />
                        <span>Goal-based achievement system</span>
                      </li>
                    </ul>
                    <Button 
                      onClick={() => setActiveTab('fitness-science')} 
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
                onClick={handleNutritionRedirect} 
                size="lg" 
                className="bg-quantum-purple hover:bg-quantum-purple/80 text-white"
              >
                <Heart className="mr-2 h-5 w-5" />
                Explore Nutrition Plans
              </Button>
            </motion.div>
          </TabsContent>
          
          {/* Add more tabs content here similar to the Nutrition page */}
          
          <TabsContent value="workout-plans">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            >
              <motion.div variants={itemVariants}>
                <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 backdrop-blur-sm h-full">
                  <CardHeader>
                    <CardTitle className="text-quantum-cyan text-2xl">Beginner</CardTitle>
                    <CardDescription className="text-gray-300">Perfect for those new to fitness</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start gap-3">
                        <Check className="text-quantum-cyan h-5 w-5 mt-1" />
                        <span>3 workouts per week</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="text-quantum-cyan h-5 w-5 mt-1" />
                        <span>Focus on form and building baseline strength</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="text-quantum-cyan h-5 w-5 mt-1" />
                        <span>Gradual progression system</span>
                      </li>
                    </ul>
                    {user ? (
                      <Button 
                        className="w-full bg-quantum-purple hover:bg-quantum-purple/80 text-white"
                      >
                        Start Plan
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => navigate('/login')} 
                        className="w-full bg-transparent border border-quantum-cyan text-quantum-cyan hover:bg-quantum-cyan/10"
                      >
                        Sign In to Start
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Card className="bg-quantum-darkBlue/30 border-quantum-purple relative overflow-hidden h-full">
                  <div className="absolute top-0 left-0 right-0 bg-quantum-purple text-center py-1 px-4 text-sm font-bold">
                    MOST POPULAR
                  </div>
                  <CardHeader className="pt-8">
                    <CardTitle className="text-quantum-purple text-2xl">Intermediate</CardTitle>
                    <CardDescription className="text-gray-300">For those with some fitness experience</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start gap-3">
                        <Check className="text-quantum-purple h-5 w-5 mt-1" />
                        <span>4-5 workouts per week</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="text-quantum-purple h-5 w-5 mt-1" />
                        <span>Progressive overload techniques</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="text-quantum-purple h-5 w-5 mt-1" />
                        <span>Targeted muscle group focus</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="text-quantum-purple h-5 w-5 mt-1" />
                        <span>Periodization for consistent results</span>
                      </li>
                    </ul>
                    {user ? (
                      <Button 
                        className="w-full bg-quantum-purple hover:bg-quantum-darkPurple text-white"
                      >
                        Start Plan
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => navigate('/login')} 
                        className="w-full bg-transparent border border-quantum-purple text-quantum-purple hover:bg-quantum-purple/10"
                      >
                        Sign In to Start
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 backdrop-blur-sm h-full">
                  <CardHeader>
                    <CardTitle className="text-quantum-cyan text-2xl">Advanced</CardTitle>
                    <CardDescription className="text-gray-300">For experienced fitness enthusiasts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start gap-3">
                        <Check className="text-quantum-cyan h-5 w-5 mt-1" />
                        <span>5-6 workouts per week</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="text-quantum-cyan h-5 w-5 mt-1" />
                        <span>Advanced intensity techniques</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="text-quantum-cyan h-5 w-5 mt-1" />
                        <span>Customized split routines</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="text-quantum-cyan h-5 w-5 mt-1" />
                        <span>Performance optimization protocols</span>
                      </li>
                    </ul>
                    {user ? (
                      <Button 
                        className="w-full bg-quantum-cyan hover:bg-quantum-cyan/80 text-white"
                      >
                        Start Plan
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => navigate('/login')} 
                        className="w-full bg-transparent border border-quantum-cyan text-quantum-cyan hover:bg-quantum-cyan/10"
                      >
                        Sign In to Start
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>
          
          {user && (
            <TabsContent value="my-fitness">
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-4xl mx-auto"
              >
                <motion.div variants={itemVariants}>
                  <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 backdrop-blur-sm mb-8">
                    <CardHeader>
                      <CardTitle className="text-quantum-cyan text-2xl">Your Fitness Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <p className="text-center py-4">Loading your fitness data...</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="bg-quantum-darkBlue/50 p-4 rounded-lg border border-quantum-cyan/30">
                            <p className="text-sm text-gray-400">Total Workouts</p>
                            <p className="text-2xl font-bold">{stats?.total_workouts || 0}</p>
                          </div>
                          <div className="bg-quantum-darkBlue/50 p-4 rounded-lg border border-quantum-cyan/30">
                            <p className="text-sm text-gray-400">Current Streak</p>
                            <p className="text-2xl font-bold">{stats?.currentStreak || 0} days</p>
                          </div>
                          <div className="bg-quantum-darkBlue/50 p-4 rounded-lg border border-quantum-cyan/30">
                            <p className="text-sm text-gray-400">Active Plans</p>
                            <p className="text-2xl font-bold">{plans?.length || 0}</p>
                          </div>
                        </div>
                      )}
                      <div className="mt-6 grid md:grid-cols-2 gap-6">
                        <Button 
                          onClick={() => setActiveTab('workout-plans')}
                          variant="outline" 
                          className="border-quantum-cyan text-quantum-cyan hover:bg-quantum-cyan/10"
                        >
                          Explore Workout Plans
                        </Button>
                        <Button 
                          onClick={handleNutritionRedirect}
                          className="bg-quantum-purple hover:bg-quantum-purple/80 text-white"
                        >
                          View Nutrition Plans
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>
          )}
          
          <TabsContent value="fitness-science">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-4xl mx-auto"
            >
              <motion.div variants={itemVariants}>
                <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 backdrop-blur-sm mb-8">
                  <CardHeader>
                    <CardTitle className="text-quantum-cyan text-2xl">The Science of Fitness</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-lg">
                      At Zenith Fitness, we combine cutting-edge exercise science with practical application to 
                      maximize your results while minimizing injury risk. Our approach is built on proven 
                      physiological principles and constantly updated with the latest research.
                    </p>
                    <p className="mb-6 text-lg">
                      From optimizing recovery through properly timed nutrition to implementing 
                      scientifically-validated training methodologies, every aspect of our program is designed 
                      to help you achieve your goals efficiently and safely.
                    </p>
                    <div className="bg-quantum-darkBlue/50 p-6 rounded-lg border border-quantum-cyan/30 mb-6">
                      <h3 className="text-xl font-bold text-quantum-cyan mb-3">Key Training Principles</h3>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                          <div className="bg-quantum-cyan/20 p-2 rounded-full mt-1">
                            <Check className="text-quantum-cyan h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-bold">Progressive Overload</h4>
                            <p className="text-gray-300">Gradually increasing the weight, frequency, or number of repetitions to continuously challenge your muscles</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="bg-quantum-cyan/20 p-2 rounded-full mt-1">
                            <Check className="text-quantum-cyan h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-bold">Periodization</h4>
                            <p className="text-gray-300">Systematically varying training variables to prevent plateaus and optimize performance</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="bg-quantum-cyan/20 p-2 rounded-full mt-1">
                            <Check className="text-quantum-cyan h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-bold">Recovery Optimization</h4>
                            <p className="text-gray-300">Strategic rest periods and recovery techniques to maximize muscle growth and prevent overtraining</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className="flex items-center p-4 bg-quantum-purple/20 rounded-lg border border-quantum-purple/30">
                      <Info className="text-quantum-purple h-6 w-6 mr-3 flex-shrink-0" />
                      <p>Our training programs integrate with our nutrition plans for a complete approach to body transformation and performance enhancement.</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Fitness;
