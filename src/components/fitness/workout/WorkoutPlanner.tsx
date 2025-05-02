
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, Dumbbell, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

// Helper components - should be moved to their own files for a proper refactoring
const CreatePlanButton = () => (
  <Button className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black">
    <PlusCircle className="mr-2 h-5 w-5" /> Create New Plan
  </Button>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="bg-quantum-black/40 p-6 rounded-full mb-4">
      <Dumbbell className="h-12 w-12 text-quantum-cyan" />
    </div>
    <h3 className="text-xl font-medium mb-2">No Workout Plans Yet</h3>
    <p className="text-gray-400 mb-6 max-w-md">
      Create your first workout plan to start tracking your fitness journey. 
      Customize exercises, set goals, and monitor your progress.
    </p>
    <CreatePlanButton />
  </div>
);

const PlanCard = ({ plan }: { plan: any }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-quantum-black/30 border border-quantum-cyan/10 rounded-lg p-5 hover:border-quantum-cyan/30 transition-colors cursor-pointer"
  >
    <div className="flex justify-between items-start mb-3">
      <h3 className="font-semibold text-lg">{plan.name}</h3>
      <span className="bg-quantum-purple/20 text-quantum-purple px-2 py-1 rounded text-xs">
        {plan.level}
      </span>
    </div>
    <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
    <div className="grid grid-cols-3 gap-2 mb-4 text-center text-sm">
      <div className="bg-quantum-black/40 p-2 rounded">
        <div className="text-xs text-gray-500">Days</div>
        <div>{plan.days}/week</div>
      </div>
      <div className="bg-quantum-black/40 p-2 rounded">
        <div className="text-xs text-gray-500">Duration</div>
        <div>{plan.duration}wks</div>
      </div>
      <div className="bg-quantum-black/40 p-2 rounded">
        <div className="text-xs text-gray-500">Target</div>
        <div>{plan.target}</div>
      </div>
    </div>
    <div className="flex justify-between">
      <Button variant="outline" size="sm" className="text-xs">
        View Details
      </Button>
      <Button size="sm" className="text-xs bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90">
        Start Now
      </Button>
    </div>
  </motion.div>
);

// Main component
const WorkoutPlanner = () => {
  const [plans, setPlans] = useState<any[]>([
    {
      id: 1,
      name: "Beginner Strength",
      level: "Beginner",
      description: "Perfect for those new to strength training with focus on form and building a foundation.",
      days: 3,
      duration: 8,
      target: "Strength"
    },
    {
      id: 2,
      name: "HIIT Cardio Blast",
      level: "Intermediate",
      description: "High intensity interval training focused on burning calories and improving cardiovascular fitness.",
      days: 4,
      duration: 6,
      target: "Cardio"
    },
    {
      id: 3,
      name: "Full Body Toning",
      level: "Advanced",
      description: "Comprehensive workout plan targeting all major muscle groups for definition and strength.",
      days: 5,
      duration: 10,
      target: "Toning"
    }
  ]);
  
  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-quantum-cyan" />
            Workout Planner
          </CardTitle>
          
          {plans.length > 0 && (
            <CreatePlanButton />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="my-plans" className="space-y-4">
          <TabsList>
            <TabsTrigger value="my-plans">My Plans</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-plans">
            {plans.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map(plan => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="templates">
            <div className="py-12 text-center">
              <p className="text-gray-400">Workout templates coming soon!</p>
            </div>
          </TabsContent>
          
          <TabsContent value="recommended">
            <div className="py-12 text-center">
              <p className="text-gray-400">Personalized recommendations coming soon!</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WorkoutPlanner;
