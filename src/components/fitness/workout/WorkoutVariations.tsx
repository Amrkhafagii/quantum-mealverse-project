
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shuffle, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WorkoutVariation {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  exercises: any[];
  created_at: string;
}

interface WorkoutVariationsProps {
  baseWorkoutId?: string;
  onVariationSelect?: (variation: WorkoutVariation) => void;
}

const WorkoutVariations: React.FC<WorkoutVariationsProps> = ({ 
  baseWorkoutId, 
  onVariationSelect 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [variations, setVariations] = useState<WorkoutVariation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && baseWorkoutId) {
      loadWorkoutVariations();
    }
  }, [user, baseWorkoutId]);

  // Single responsibility: Load variations from database
  const loadWorkoutVariations = async () => {
    try {
      setIsLoading(true);
      const data = await fetchVariationsFromDatabase();
      setVariations(data);
    } catch (error) {
      handleVariationError('Failed to load workout variations', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Single responsibility: Database query for variations
  const fetchVariationsFromDatabase = async (): Promise<WorkoutVariation[]> => {
    const { data, error } = await supabase
      .from('workout_variations')
      .select('*')
      .eq('user_id', user?.id)
      .eq('base_workout_id', baseWorkoutId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  // Single responsibility: Create a new variation
  const createNewVariation = async () => {
    try {
      setIsLoading(true);
      const variationData = generateVariationData();
      const newVariation = await saveVariationToDatabase(variationData);
      updateVariationsState(newVariation);
      showSuccessToast('Workout variation created successfully');
    } catch (error) {
      handleVariationError('Failed to create workout variation', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Single responsibility: Generate variation data structure
  const generateVariationData = () => {
    return {
      name: `Variation ${variations.length + 1}`,
      description: 'AI-generated workout variation',
      difficulty: 'intermediate',
      exercises: generateRandomExercises(),
      user_id: user?.id,
      base_workout_id: baseWorkoutId
    };
  };

  // Single responsibility: Generate random exercises for variation
  const generateRandomExercises = () => {
    const exercisePool = [
      { name: 'Push-ups', sets: 3, reps: 12 },
      { name: 'Squats', sets: 3, reps: 15 },
      { name: 'Lunges', sets: 3, reps: 10 },
      { name: 'Plank', sets: 3, duration: 30 },
      { name: 'Burpees', sets: 3, reps: 8 }
    ];
    
    return shuffleArray(exercisePool).slice(0, 3);
  };

  // Single responsibility: Array shuffling utility
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Single responsibility: Save variation to database
  const saveVariationToDatabase = async (variationData: any) => {
    const { data, error } = await supabase
      .from('workout_variations')
      .insert([variationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Single responsibility: Update local state with new variation
  const updateVariationsState = (newVariation: WorkoutVariation) => {
    setVariations(prev => [newVariation, ...prev]);
  };

  // Single responsibility: Delete a variation
  const deleteVariation = async (variationId: string) => {
    if (!confirmDeletion()) return;

    try {
      setIsLoading(true);
      await removeVariationFromDatabase(variationId);
      removeVariationFromState(variationId);
      showSuccessToast('Workout variation deleted');
    } catch (error) {
      handleVariationError('Failed to delete workout variation', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Single responsibility: Confirm deletion dialog
  const confirmDeletion = (): boolean => {
    return window.confirm('Are you sure you want to delete this workout variation?');
  };

  // Single responsibility: Database deletion
  const removeVariationFromDatabase = async (variationId: string) => {
    const { error } = await supabase
      .from('workout_variations')
      .delete()
      .eq('id', variationId)
      .eq('user_id', user?.id);

    if (error) throw error;
  };

  // Single responsibility: Remove from local state
  const removeVariationFromState = (variationId: string) => {
    setVariations(prev => prev.filter(v => v.id !== variationId));
  };

  // Single responsibility: Handle variation selection
  const handleVariationSelect = (variation: WorkoutVariation) => {
    if (onVariationSelect) {
      onVariationSelect(variation);
    }
    showSuccessToast(`Selected variation: ${variation.name}`);
  };

  // Single responsibility: Error handling
  const handleVariationError = (message: string, error: any) => {
    console.error(message, error);
    toast({
      title: "Error",
      description: message,
      variant: "destructive"
    });
  };

  // Single responsibility: Success toast notifications
  const showSuccessToast = (message: string) => {
    toast({
      title: "Success",
      description: message
    });
  };

  // Single responsibility: Format difficulty badge
  const formatDifficultyBadge = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-500',
      intermediate: 'bg-yellow-500',
      advanced: 'bg-red-500'
    };
    
    return colors[difficulty as keyof typeof colors] || 'bg-gray-500';
  };

  // Single responsibility: Format creation date
  const formatCreationDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Single responsibility: Render loading state
  const renderLoadingState = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan mx-auto mb-4"></div>
      <p>Loading workout variations...</p>
    </div>
  );

  // Single responsibility: Render empty state
  const renderEmptyState = () => (
    <div className="text-center py-8">
      <Shuffle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-semibold mb-2">No variations yet</h3>
      <p className="text-gray-400 mb-4">Create your first workout variation</p>
      <Button onClick={createNewVariation} disabled={isLoading}>
        <Plus className="h-4 w-4 mr-2" />
        Create Variation
      </Button>
    </div>
  );

  // Single responsibility: Render variation card
  const renderVariationCard = (variation: WorkoutVariation) => (
    <Card key={variation.id} className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {variation.name}
              <Badge className={formatDifficultyBadge(variation.difficulty)}>
                {variation.difficulty}
              </Badge>
            </CardTitle>
            <p className="text-sm text-gray-400 mt-1">{variation.description}</p>
            <p className="text-xs text-gray-500 mt-1">
              Created: {formatCreationDate(variation.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVariationSelect(variation)}
            >
              Select
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteVariation(variation.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-300">
          <p>{variation.exercises.length} exercises</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Workout Variations</h2>
        <Button onClick={createNewVariation} disabled={isLoading}>
          <Shuffle className="h-4 w-4 mr-2" />
          Generate Variation
        </Button>
      </div>

      {isLoading && renderLoadingState()}
      
      {!isLoading && variations.length === 0 && renderEmptyState()}
      
      {!isLoading && variations.length > 0 && (
        <div className="grid gap-4">
          {variations.map(renderVariationCard)}
        </div>
      )}
    </div>
  );
};

export default WorkoutVariations;
