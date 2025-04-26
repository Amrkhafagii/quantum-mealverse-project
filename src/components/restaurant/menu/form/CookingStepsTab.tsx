
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';

interface CookingStepsTabProps {
  steps: string[];
  setSteps: (steps: string[]) => void;
}

export const CookingStepsTab: React.FC<CookingStepsTabProps> = ({
  steps,
  setSteps
}) => {
  const [newStep, setNewStep] = useState('');

  const addStep = () => {
    if (newStep.trim()) {
      setSteps([...steps, newStep.trim()]);
      setNewStep('');
    }
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Cooking Steps</Label>
        <ol className="space-y-2">
          {steps.map((step, index) => (
            <li key={index} className="flex items-center justify-between p-2 border rounded-md">
              <div className="flex items-start">
                <span className="font-medium mr-2">{index + 1}.</span>
                <span>{step}</span>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => removeStep(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ol>
        
        <div className="flex items-center space-x-2">
          <Textarea
            value={newStep}
            onChange={(e) => setNewStep(e.target.value)}
            placeholder="Add a cooking step"
          />
          <Button 
            type="button" 
            onClick={addStep}
            disabled={!newStep.trim()}
            className="mt-5"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};
