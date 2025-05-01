
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Calendar, 
  Flame, 
  CheckSquare, 
  ListChecks,
  ScrollText,
  ChevronRight
} from 'lucide-react';
import { WorkoutHistoryItem, WorkoutLog } from '@/types/fitness';
import { format } from 'date-fns';

interface WorkoutDetailProps {
  workout: WorkoutHistoryItem;
  workoutLog?: WorkoutLog;
}

const WorkoutDetail: React.FC<WorkoutDetailProps> = ({ workout, workoutLog }) => {
  const formattedDate = format(new Date(workout.date), 'PPP');
  const completionPercentage = Math.round((workout.exercises_completed / workout.total_exercises) * 100);
  
  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader className="border-b border-quantum-cyan/20">
        <CardTitle className="text-2xl text-quantum-cyan flex justify-between items-center">
          <span>{workout.workout_plan_name}</span>
          <Badge className="bg-quantum-purple text-white">{workout.workout_day_name}</Badge>
        </CardTitle>
        <div className="flex items-center text-sm text-gray-300">
          <Calendar className="h-4 w-4 mr-1" />
          {formattedDate}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center bg-quantum-darkBlue/40 p-3 rounded-md">
            <Clock className="h-5 w-5 text-quantum-cyan mr-2" />
            <div>
              <p className="text-xs text-gray-400">Duration</p>
              <p className="font-medium">{workout.duration} minutes</p>
            </div>
          </div>
          
          {workout.calories_burned && (
            <div className="flex items-center bg-quantum-darkBlue/40 p-3 rounded-md">
              <Flame className="h-5 w-5 text-orange-400 mr-2" />
              <div>
                <p className="text-xs text-gray-400">Calories Burned</p>
                <p className="font-medium">{workout.calories_burned}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center bg-quantum-darkBlue/40 p-3 rounded-md">
            <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
            <div>
              <p className="text-xs text-gray-400">Completion</p>
              <p className="font-medium">{completionPercentage}% ({workout.exercises_completed}/{workout.total_exercises} exercises)</p>
            </div>
          </div>
        </div>
        
        {workoutLog && (
          <>
            <Separator className="my-4 bg-quantum-cyan/20" />
            
            <div className="space-y-4">
              <h3 className="flex items-center text-lg font-medium">
                <ListChecks className="h-5 w-5 mr-2 text-quantum-cyan" />
                Exercises Completed
              </h3>
              
              <div className="space-y-3">
                {workoutLog.completed_exercises.map((exercise, index) => (
                  <div key={index} className="bg-quantum-darkBlue/40 p-3 rounded-md">
                    <h4 className="font-medium mb-2">{exercise.exercise_name}</h4>
                    
                    <div className="space-y-2">
                      {exercise.sets_completed.map((set: any, setIndex: number) => (
                        <div key={setIndex} className="flex items-center text-sm bg-quantum-black/40 p-2 rounded">
                          <div className="w-14 font-medium">Set {setIndex + 1}:</div>
                          <div className="flex-1">
                            {set.reps && <span>{set.reps} reps</span>}
                            {set.weight ? <span> @ {set.weight} kg</span> : ''}
                            {set.duration ? <span> for {set.duration}s</span> : ''}
                          </div>
                          <ChevronRight className="h-4 w-4 text-quantum-cyan" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {workoutLog?.notes && (
          <div className="mt-4 pt-4 border-t border-quantum-cyan/20">
            <h3 className="flex items-center text-lg font-medium mb-2">
              <ScrollText className="h-5 w-5 mr-2 text-quantum-cyan" />
              Notes
            </h3>
            <p className="text-gray-300 bg-quantum-darkBlue/40 p-3 rounded-md">
              {workoutLog.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkoutDetail;
