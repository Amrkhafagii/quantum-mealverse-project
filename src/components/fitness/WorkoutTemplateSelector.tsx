
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Target, TrendingUp } from 'lucide-react';
import { WorkoutTemplate } from '@/types/fitness/exercises';
import { supabase } from '@/integrations/supabase/client';

interface WorkoutTemplateSelectorProps {
  onSelectTemplate: (template: WorkoutTemplate) => void;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export const WorkoutTemplateSelector: React.FC<WorkoutTemplateSelectorProps> = ({
  onSelectTemplate,
  userLevel = 'beginner'
}) => {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationScore = (template: WorkoutTemplate) => {
    if (template.difficulty === userLevel) return 100;
    if (userLevel === 'beginner' && template.difficulty === 'intermediate') return 70;
    if (userLevel === 'intermediate' && template.difficulty === 'beginner') return 60;
    if (userLevel === 'intermediate' && template.difficulty === 'advanced') return 70;
    return 40;
  };

  const filteredTemplates = templates.filter(template => 
    selectedDifficulty === 'all' || template.difficulty === selectedDifficulty
  );

  const recommendedTemplates = filteredTemplates
    .sort((a, b) => getRecommendationScore(b) - getRecommendationScore(a));

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold text-quantum-cyan">Choose a Workout Template</h2>
        <p className="text-gray-600">
          Select a pre-designed workout plan to get started quickly
        </p>

        {/* Difficulty Filter */}
        <div className="flex gap-2">
          {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
            <Button
              key={level}
              variant={selectedDifficulty === level ? 'default' : 'outline'}
              onClick={() => setSelectedDifficulty(level)}
              className="capitalize"
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendedTemplates.map((template) => {
          const recommendationScore = getRecommendationScore(template);
          const isRecommended = recommendationScore >= 70;
          
          return (
            <Card key={template.id} className={`holographic-card hover:shadow-lg transition-all ${
              isRecommended ? 'ring-2 ring-quantum-cyan' : ''
            }`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg text-quantum-cyan">
                    {template.name}
                  </CardTitle>
                  {isRecommended && (
                    <Badge className="bg-quantum-cyan text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Recommended
                    </Badge>
                  )}
                </div>
                <Badge className={getDifficultyColor(template.difficulty)}>
                  {template.difficulty}
                </Badge>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{template.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Duration:</span>
                    </div>
                    <span className="font-medium">{template.duration_weeks} weeks</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Frequency:</span>
                    </div>
                    <span className="font-medium">{template.frequency}x/week</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Goal:</span>
                    </div>
                    <span className="font-medium capitalize">{template.goal.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Workout Days:</p>
                  <div className="space-y-1">
                    {Array.isArray(template.workout_days) && template.workout_days.slice(0, 2).map((day: any, index: number) => (
                      <div key={index} className="text-xs text-gray-600">
                        • {day.day_name} ({day.exercises?.length || 0} exercises)
                      </div>
                    ))}
                    {Array.isArray(template.workout_days) && template.workout_days.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{template.workout_days.length - 2} more days
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => onSelectTemplate(template)}
                  className="w-full cyber-button"
                >
                  Use This Template
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {recommendedTemplates.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No templates found for the selected difficulty.</p>
        </div>
      )}
    </div>
  );
};
