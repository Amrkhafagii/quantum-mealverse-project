import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface ExerciseInstruction {
  id: string;
  instruction_type: 'video' | 'image' | 'text';
  content_url?: string;
  instruction_text?: string;
  order_index: number;
}

interface Exercise {
  id: string;
  name: string;
  muscle_groups: string[];
  difficulty: string;
  equipment_needed?: string[];
  description?: string;
}

interface ExerciseInstructionsProps {
  exercise: Exercise;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

export const ExerciseInstructions: React.FC<ExerciseInstructionsProps> = ({
  exercise,
  isExpanded = false,
  onToggleExpanded
}) => {
  const [instructions, setInstructions] = useState<ExerciseInstruction[]>([]);
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstructions();
  }, [exercise.id]);

  const fetchInstructions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exercise_instructions')
        .select('*')
        .eq('exercise_id', exercise.id)
        .order('order_index');

      if (error) throw error;
      
      // Type assertion with proper validation
      const typedInstructions = (data || []).map(item => ({
        id: item.id,
        instruction_type: item.instruction_type as 'video' | 'image' | 'text',
        content_url: item.content_url,
        instruction_text: item.instruction_text,
        order_index: item.order_index
      }));
      
      setInstructions(typedInstructions);
    } catch (error) {
      console.error('Error fetching exercise instructions:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentInstruction = instructions[currentInstructionIndex];

  const nextInstruction = () => {
    setCurrentInstructionIndex(prev => 
      prev < instructions.length - 1 ? prev + 1 : 0
    );
  };

  const prevInstruction = () => {
    setCurrentInstructionIndex(prev => 
      prev > 0 ? prev - 1 : instructions.length - 1
    );
  };

  const getMuscleGroupColor = (muscleGroup: string) => {
    const colors = {
      'chest': 'bg-red-500/20 text-red-400',
      'back': 'bg-blue-500/20 text-blue-400',
      'legs': 'bg-green-500/20 text-green-400',
      'shoulders': 'bg-yellow-500/20 text-yellow-400',
      'arms': 'bg-purple-500/20 text-purple-400',
      'core': 'bg-orange-500/20 text-orange-400',
      'cardio': 'bg-pink-500/20 text-pink-400'
    };
    return colors[muscleGroup.toLowerCase() as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  if (!isExpanded) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 cursor-pointer hover:border-quantum-cyan/40 transition-colors">
        <CardContent className="p-4" onClick={onToggleExpanded}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-quantum-cyan" />
              <div>
                <h3 className="font-semibold text-quantum-cyan">{exercise.name}</h3>
                <div className="flex gap-1 mt-1">
                  {exercise.muscle_groups.slice(0, 2).map((group, index) => (
                    <Badge key={index} className={`text-xs ${getMuscleGroupColor(group)}`}>
                      {group}
                    </Badge>
                  ))}
                  {exercise.muscle_groups.length > 2 && (
                    <Badge className="text-xs bg-gray-500/20 text-gray-400">
                      +{exercise.muscle_groups.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-quantum-cyan">
              {exercise.difficulty}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-quantum-cyan">{exercise.name}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpanded}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {exercise.muscle_groups.map((group, index) => (
            <Badge key={index} className={getMuscleGroupColor(group)}>
              {group}
            </Badge>
          ))}
          <Badge variant="outline" className="text-quantum-cyan">
            {exercise.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading instructions...</p>
          </div>
        ) : instructions.length > 0 ? (
          <Tabs defaultValue="instructions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="instructions" className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentInstructionIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentInstruction?.instruction_type === 'video' && currentInstruction.content_url && (
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        src={currentInstruction.content_url}
                        className="w-full h-48 object-cover"
                        controls
                        muted={isMuted}
                        onPlay={() => setIsVideoPlaying(true)}
                        onPause={() => setIsVideoPlaying(false)}
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setIsMuted(!isMuted)}
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {currentInstruction?.instruction_type === 'image' && currentInstruction.content_url && (
                    <img
                      src={currentInstruction.content_url}
                      alt={`${exercise.name} demonstration`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                  
                  {currentInstruction?.instruction_text && (
                    <div className="bg-quantum-black/40 p-4 rounded-lg">
                      <p className="text-gray-200 leading-relaxed">
                        {currentInstruction.instruction_text}
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              
              {instructions.length > 1 && (
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevInstruction}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  <div className="flex gap-1">
                    {instructions.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentInstructionIndex 
                            ? 'bg-quantum-cyan' 
                            : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextInstruction}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4">
              {exercise.description && (
                <div>
                  <h4 className="font-semibold text-quantum-cyan mb-2">Description</h4>
                  <p className="text-gray-300">{exercise.description}</p>
                </div>
              )}
              
              {exercise.equipment_needed && exercise.equipment_needed.length > 0 && (
                <div>
                  <h4 className="font-semibold text-quantum-cyan mb-2">Equipment Needed</h4>
                  <div className="flex flex-wrap gap-2">
                    {exercise.equipment_needed.map((equipment, index) => (
                      <Badge key={index} variant="outline">
                        {equipment}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="font-semibold text-quantum-cyan mb-2">Target Muscles</h4>
                <div className="flex flex-wrap gap-2">
                  {exercise.muscle_groups.map((group, index) => (
                    <Badge key={index} className={getMuscleGroupColor(group)}>
                      {group}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <Info className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No instructions available for this exercise</p>
            {exercise.description && (
              <p className="text-gray-300 mt-2">{exercise.description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
