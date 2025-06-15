
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Dumbbell, TrendingUp, Heart, Star } from 'lucide-react';
import { WorkoutLog } from '@/types/fitness/workouts';

interface WorkoutLogDetailsProps {
  log: WorkoutLog;
  showProgressCharts?: boolean;
}

const WorkoutLogDetails: React.FC<WorkoutLogDetailsProps> = ({ 
  log, 
  showProgressCharts = true 
}) => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Generate sample progress data for visualization
    if (log.completed_exercises) {
      const progressData = log.completed_exercises.map((exercise, index) => ({
        exercise: exercise.name?.substring(0, 10) || `Ex ${index + 1}`,
        volume: exercise.sets?.reduce((total, set) => 
          total + ((set.weight || 0) * (set.reps || 0)), 0) || 0,
        maxWeight: Math.max(...(exercise.sets?.map(set => set.weight || 0) || [0]))
      }));
      setChartData(progressData);
    }
  }, [log]);

  const totalVolume = log.completed_exercises?.reduce((total, exercise) => 
    total + (exercise.sets?.reduce((setTotal, set) => 
      setTotal + ((set.weight || 0) * (set.reps || 0)), 0) || 0), 0) || 0;

  const totalSets = log.completed_exercises?.reduce((total, exercise) => 
    total + (exercise.sets?.length || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header with Key Stats */}
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-quantum-cyan">{log.workout_plan_name}</span>
            <Badge variant="outline" className="bg-quantum-black/20">
              {new Date(log.date).toLocaleDateString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-quantum-cyan" />
              <div>
                <p className="text-sm text-gray-400">Duration</p>
                <p className="font-semibold">{log.duration} min</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-quantum-cyan" />
              <div>
                <p className="text-sm text-gray-400">Total Sets</p>
                <p className="font-semibold">{totalSets}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-quantum-cyan" />
              <div>
                <p className="text-sm text-gray-400">Volume</p>
                <p className="font-semibold">{totalVolume.toFixed(0)} lbs</p>
              </div>
            </div>
            
            {log.calories_burned && (
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-400" />
                <div>
                  <p className="text-sm text-gray-400">Calories</p>
                  <p className="font-semibold">{log.calories_burned}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="exercises" className="w-full">
        <TabsList className="bg-quantum-darkBlue/50">
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          {showProgressCharts && <TabsTrigger value="charts">Progress</TabsTrigger>}
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="space-y-4">
          <ScrollArea className="h-[500px] w-full">
            <div className="space-y-4">
              {log.completed_exercises?.map((exercise, index) => (
                <Card key={index} className="bg-quantum-black/30 border-quantum-cyan/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{exercise.name}</span>
                      {exercise.target_muscle && (
                        <Badge variant="secondary" className="text-xs">
                          {exercise.target_muscle}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {exercise.sets?.map((set, setIndex) => (
                        <div 
                          key={setIndex} 
                          className="flex items-center justify-between p-2 bg-quantum-darkBlue/20 rounded"
                        >
                          <span className="text-sm font-medium">Set {setIndex + 1}</span>
                          <div className="flex items-center gap-4 text-sm">
                            {set.weight && (
                              <span>{set.weight} lbs</span>
                            )}
                            <span>{set.reps} reps</span>
                            {set.rest_seconds && (
                              <span className="text-gray-400">{set.rest_seconds}s rest</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {exercise.notes && (
                      <div className="mt-3 p-2 bg-quantum-darkBlue/10 rounded">
                        <p className="text-sm text-gray-300">{exercise.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )) || (
                <div className="text-center py-8 text-gray-400">
                  No exercise data available
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {showProgressCharts && (
          <TabsContent value="charts" className="space-y-4">
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardHeader>
                <CardTitle>Workout Volume Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="exercise" tick={{ fill: '#ccc' }} />
                      <YAxis tick={{ fill: '#ccc' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a2e', 
                          border: '1px solid #16213e', 
                          color: '#fff' 
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="volume" 
                        stroke="#00FFFF" 
                        strokeWidth={2}
                        dot={{ fill: '#00FFFF' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="notes" className="space-y-4">
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Workout Notes & Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {log.notes ? (
                  <div className="p-4 bg-quantum-black/30 rounded-lg">
                    <h4 className="font-medium mb-2">Personal Notes</h4>
                    <p className="text-gray-300">{log.notes}</p>
                  </div>
                ) : (
                  <div className="p-4 bg-quantum-black/30 rounded-lg text-center text-gray-400">
                    No notes recorded for this workout
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-quantum-black/30 rounded-lg">
                    <h4 className="font-medium mb-2">Performance Summary</h4>
                    <ul className="text-sm space-y-1 text-gray-300">
                      <li>• Completed {log.completed_exercises?.length || 0} exercises</li>
                      <li>• Total workout time: {log.duration} minutes</li>
                      <li>• Average rest between sets: ~60 seconds</li>
                      {log.calories_burned && <li>• Calories burned: {log.calories_burned}</li>}
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-quantum-black/30 rounded-lg">
                    <h4 className="font-medium mb-2">Next Session Focus</h4>
                    <ul className="text-sm space-y-1 text-gray-300">
                      <li>• Consider increasing weight by 2.5-5 lbs</li>
                      <li>• Focus on form over speed</li>
                      <li>• Maintain consistent rest periods</li>
                      <li>• Track perceived exertion</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkoutLogDetails;
