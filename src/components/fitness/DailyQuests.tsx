
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface Quest {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
}

interface DailyQuestsProps {
  userId?: string;
}

const DailyQuests: React.FC<DailyQuestsProps> = ({ userId }) => {
  // This would typically come from a database/API
  const [quests, setQuests] = useState<Quest[]>([
    {
      id: '1',
      title: 'Morning Stretch',
      description: 'Complete a 5-minute stretching routine',
      points: 10,
      completed: false
    },
    {
      id: '2',
      title: 'Step Goal',
      description: 'Reach 5,000 steps today',
      points: 15,
      completed: false
    },
    {
      id: '3',
      title: 'Hydration',
      description: 'Log drinking 8 cups of water',
      points: 10,
      completed: false
    },
    {
      id: '4',
      title: 'Workout Warrior',
      description: 'Complete any workout session',
      points: 25,
      completed: false
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  
  const handleQuestToggle = (questId: string) => {
    if (!userId) return;
    
    setLoading(true);
    
    // In a real app, this would update the database
    setTimeout(() => {
      setQuests(quests.map(quest => 
        quest.id === questId ? { ...quest, completed: !quest.completed } : quest
      ));
      setLoading(false);
    }, 500);
  };
  
  const calculateCompletionPercentage = () => {
    const completedQuests = quests.filter(q => q.completed).length;
    return (completedQuests / quests.length) * 100;
  };
  
  const calculateTotalPoints = () => {
    return quests.reduce((total, quest) => {
      return quest.completed ? total + quest.points : total;
    }, 0);
  };

  if (!userId) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-400">Sign in to view daily quests</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Daily Quests</CardTitle>
        <Button variant="ghost" size="sm" disabled={loading} className="h-8 w-8 p-0">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-300">Daily Progress</span>
            <span className="text-sm text-gray-300">
              {Math.round(calculateCompletionPercentage())}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${calculateCompletionPercentage()}%` }}
              transition={{ duration: 0.5 }}
              className="bg-quantum-cyan h-2 rounded-full" 
            />
          </div>
        </div>
        
        <div className="space-y-3">
          {quests.map((quest) => (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`p-3 rounded-md cursor-pointer 
                ${quest.completed ? 'bg-quantum-cyan/20' : 'bg-quantum-darkBlue/40'}
                hover:bg-quantum-darkBlue/70 transition-colors`}
              onClick={() => handleQuestToggle(quest.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {quest.completed ? (
                    <CheckCircle className="h-5 w-5 text-quantum-cyan flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                  <div>
                    <h4 className="font-medium text-sm">{quest.title}</h4>
                    <p className="text-xs text-gray-400">{quest.description}</p>
                  </div>
                </div>
                <div className="bg-quantum-black/40 px-2 py-0.5 rounded text-xs font-semibold">
                  {quest.points} pts
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Total Points Today:</span>
            <span className="font-bold text-quantum-cyan">{calculateTotalPoints()} pts</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyQuests;
