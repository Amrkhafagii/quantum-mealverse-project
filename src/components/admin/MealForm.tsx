
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from '@/components/ImageUpload';
import { MealType } from '@/types/meal';

interface MealFormProps {
  formData: MealType;
  editingMeal: MealType | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onCancel: () => void;
  onImageUpload: (file: File) => void;
}

const MealForm: React.FC<MealFormProps> = ({
  formData,
  editingMeal,
  onInputChange,
  onSave,
  onCancel,
  onImageUpload,
}) => {
  return (
    <Card className="p-6 holographic-card">
      <h2 className="text-2xl font-bold text-quantum-cyan mb-4">
        {editingMeal ? `Edit Meal: ${editingMeal.name}` : 'Create New Meal'}
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <Input
            name="name"
            value={formData.name}
            onChange={onInputChange}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm mb-1">Description</label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={onInputChange}
            className="w-full"
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Price ($)</label>
            <Input
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={onInputChange}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Calories</label>
            <Input
              name="calories"
              type="number"
              value={formData.calories}
              onChange={onInputChange}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Protein (g)</label>
            <Input
              name="protein"
              type="number"
              value={formData.protein}
              onChange={onInputChange}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Carbs (g)</label>
            <Input
              name="carbs"
              type="number"
              value={formData.carbs}
              onChange={onInputChange}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Fat (g)</label>
            <Input
              name="fat"
              type="number"
              value={formData.fat}
              onChange={onInputChange}
            />
          </div>
        </div>
        
        {editingMeal && (
          <div className="mt-4">
            <label className="block text-sm mb-2">Meal Image</label>
            <ImageUpload 
              onUpload={onImageUpload}
              currentImageUrl={editingMeal.image_url}
            />
          </div>
        )}
        
        {editingMeal ? (
          <div className="flex gap-4">
            <Button 
              className="flex-1 cyber-button" 
              onClick={onSave}
            >
              Save Changes
            </Button>
            <Button 
              className="cyber-button bg-red-700 hover:bg-red-800" 
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full cyber-button" 
            onClick={onSave}
          >
            Create Meal
          </Button>
        )}
      </div>
    </Card>
  );
};

export default MealForm;
