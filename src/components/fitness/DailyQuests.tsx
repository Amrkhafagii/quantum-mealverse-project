
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { DailyQuest } from '@/types/fitness'; // FIXED: import from root
import { CheckCircle2, Clock, Award, Flag } from 'lucide-react';

interface DailyQuestsProps {
  userId?: string;
}

const DailyQuests: React.FC<DailyQuestsProps> = ({ userId }) => {
  // This would typically come from an API or database
  const [quests, setQuests] = useState<DailyQuest[]>([
    {
      id: '1',
      title: 'Track Your Weight',
      description: 'Log your weight measurement today',
      points: 10,
      type: 'tracking',
      requirements: { action: 'log_weight' },
      completed: false,
    },
    {
      id: '2',
      title: 'Complete a Workout',
      description: 'Do any workout for at least 15 minutes',
      points: 15,
      type: 'workout',
      requirements: { min_duration: 15 },
      completed: false,
    },
    {
      id: '3',
      title: 'Hit Protein Goal',
      description: 'Meet your daily protein intake goal',
      points: 20,
      type: 'nutrition',
      requirements: { macro: 'protein', target: 100 },
      completed: false,
    },
    {
      id: '4',
      title: 'Take 10,000 Steps',
      description: 'Complete 10,000 steps today',
      points: 25,
      type: 'activity',
      requirements: { steps: 10000 },
      completed: false,
      deadline: new Date().toISOString(), // Today
    },
  ]);

  const handleCompleteQuest = (questId: string) => {
    // In a real app, this would verify the completion with backend
    setQuests(quests.map(quest => 
      quest.id === questId ? { ...quest, completed: true } : quest
    ));
    
    // You would also call an API to update user's points/achievements
  };

  if (!userId) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6">
          <p className="text-center text-gray-400">Sign in to view daily quests</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="h-5 w-5 text-quantum-purple" />
          Daily Quests
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {quests.length === 0 ? (
          <div className="text-center p-4 text-gray-400">
            <p>No active quests available right now.</p>
            <p className="text-sm">Check back tomorrow for new challenges!</p>
          </div>
        ) : (
          quests.map(quest => (
            <div 
              key={quest.id} 
              className={`bg-quantum-black/30 p-4 rounded-lg border ${quest.completed 
                ? 'border-green-500/30' 
                : 'border-quantum-purple/20'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{quest.title}</h3>
                    <Badge className={quest.completed ? 'bg-green-600' : 'bg-quantum-purple'}>
                      {quest.completed ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Completed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Active
                        </span>
                      )}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{quest.description}</p>
                </div>
                <Badge className="bg-amber-700">+{quest.points} pts</Badge>
              </div>
              
              {!quest.completed && (
                <Button
                  className="mt-3 bg-quantum-purple hover:bg-quantum-purple/90 text-sm"
                  size="sm"
                  onClick={() => handleCompleteQuest(quest.id)}
                >
                  Complete Quest
                </Button>
              )}
            </div>
          ))
        )}
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
          <div className="flex items-center">
            <Award className="h-4 w-4 text-amber-500 mr-1" />
            <span className="text-sm">Daily points available: 70</span>
          </div>
          <Button variant="outline" size="sm" className="text-xs">
            Refresh Quests
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyQuests;
