
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from '@/components/ImageUpload';
import { MealType } from '@/types/meal';
import { Plus, Minus, UtensilsCrossed, ScrollText } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface MealFormProps {
  formData: MealType;
  editingMeal: MealType | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onCancel: () => void;
  onImageUpload: (file: File) => void;
  onFormDataChange: (updatedData: Partial<MealType>) => void;
}

interface IngredientFormProps {
  ingredients: string[];
  onChange: (ingredients: string[]) => void;
}

interface StepsFormProps {
  steps: string[];
  onChange: (steps: string[]) => void;
}

const IngredientForm: React.FC<IngredientFormProps> = ({ ingredients, onChange }) => {
  const [newIngredient, setNewIngredient] = useState('');

  const addIngredient = () => {
    if (newIngredient.trim()) {
      const updated = [...ingredients, newIngredient.trim()];
      onChange(updated);
      setNewIngredient('');
    }
  };

  const removeIngredient = (index: number) => {
    const updated = [...ingredients];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          value={newIngredient}
          onChange={(e) => setNewIngredient(e.target.value)}
          placeholder="Add new ingredient"
          className="flex-1"
        />
        <Button 
          type="button" 
          size="sm" 
          onClick={addIngredient}
          variant="outline"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ul className="space-y-2">
        {ingredients.map((ingredient, index) => (
          <li key={index} className="flex items-center justify-between p-2 bg-quantum-darkBlue/50 rounded">
            <span>{ingredient}</span>
            <Button 
              type="button" 
              size="sm" 
              variant="ghost" 
              onClick={() => removeIngredient(index)}
              className="text-red-500 hover:text-red-700"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const StepsForm: React.FC<StepsFormProps> = ({ steps, onChange }) => {
  const [newStep, setNewStep] = useState('');

  const addStep = () => {
    if (newStep.trim()) {
      const updated = [...steps, newStep.trim()];
      onChange(updated);
      setNewStep('');
    }
  };

  const removeStep = (index: number) => {
    const updated = [...steps];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Textarea
          value={newStep}
          onChange={(e) => setNewStep(e.target.value)}
          placeholder="Add new cooking step"
          rows={3}
        />
        <Button 
          type="button" 
          onClick={addStep}
          variant="outline"
          className="self-end"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Step
        </Button>
      </div>

      <ol className="space-y-4">
        {steps.map((step, index) => (
          <li key={index} className="flex items-start gap-2 p-3 bg-quantum-darkBlue/50 rounded">
            <span className="font-bold min-w-[24px] bg-quantum-cyan/20 h-6 w-6 rounded-full flex items-center justify-center">
              {index + 1}
            </span>
            <div className="flex-1">
              <p>{step}</p>
            </div>
            <Button 
              type="button" 
              size="sm" 
              variant="ghost" 
              onClick={() => removeStep(index)}
              className="text-red-500 hover:text-red-700 mt-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ol>
    </div>
  );
};

const MealForm: React.FC<MealFormProps> = ({
  formData,
  editingMeal,
  onInputChange,
  onSave,
  onCancel,
  onImageUpload,
  onFormDataChange
}) => {
  const [ingredientsOpen, setIngredientsOpen] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(false);

  const handleIngredientsChange = (ingredients: string[]) => {
    onFormDataChange({ ingredients });
  };

  const handleStepsChange = (steps: string[]) => {
    onFormDataChange({ steps });
  };

  const generateAIContent = async () => {
    // Use form data name and description to generate ingredients and steps
    if (!formData.name) {
      alert("Please enter a meal name first to generate content");
      return;
    }

    const mealName = formData.name;
    const mealDescription = formData.description || '';

    // Generate ingredients based on meal name and description
    let generatedIngredients: string[] = [];
    if (mealName.includes("Protein Bowl") || mealName.includes("Bowl")) {
      generatedIngredients = [
        "1 cup quinoa, cooked",
        "8 oz grilled chicken breast, sliced",
        "1 cup mixed vegetables (broccoli, bell peppers, carrots)",
        "1/2 avocado, sliced",
        "2 tbsp olive oil",
        "1 tbsp lemon juice",
        "Salt and pepper to taste",
        "1 tbsp mixed herbs"
      ];
    } else if (mealName.includes("Salad")) {
      generatedIngredients = [
        "4 cups mixed greens",
        "1/4 cup cherry tomatoes, halved",
        "1/4 cup cucumber, diced",
        "1/2 avocado, sliced",
        "2 tbsp pumpkin seeds",
        "1 tbsp chia seeds",
        "2 tbsp citrus dressing",
        "1/4 cup crumbled feta cheese (optional)"
      ];
    } else if (mealName.includes("Pasta")) {
      generatedIngredients = [
        "8 oz whole grain pasta",
        "4 oz lean ground turkey",
        "1/2 cup organic marinara sauce",
        "1 small onion, diced",
        "2 garlic cloves, minced",
        "1 tbsp olive oil",
        "1 tsp dried oregano",
        "1 tsp dried basil",
        "Salt and pepper to taste",
        "2 tbsp grated parmesan cheese"
      ];
    } else {
      // Default ingredients for other meal types
      generatedIngredients = [
        "8 oz protein source (chicken, fish, or tofu)",
        "1 cup complex carbohydrates (quinoa, brown rice, or sweet potato)",
        "2 cups mixed vegetables",
        "2 tbsp healthy fat (olive oil, avocado, or nuts)",
        "Mixed herbs and spices",
        "Salt and pepper to taste"
      ];
    }

    // Generate cooking steps
    let generatedSteps: string[] = [];
    if (mealName.includes("Protein Bowl")) {
      generatedSteps = [
        "Cook quinoa according to package instructions and let cool.",
        "Season chicken breast with salt, pepper, and herbs, then grill until fully cooked (165°F internal temperature).",
        "Steam mixed vegetables until tender but still crisp.",
        "In a bowl, combine cooled quinoa, sliced grilled chicken, and steamed vegetables.",
        "Add sliced avocado on top.",
        "Whisk together olive oil and lemon juice for a simple dressing, then drizzle over the bowl.",
        "Season with additional salt and pepper if desired, and serve immediately."
      ];
    } else if (mealName.includes("Salad")) {
      generatedSteps = [
        "Wash and dry all vegetables thoroughly.",
        "In a large bowl, add the mixed greens as a base.",
        "Top with cherry tomatoes, cucumber, and avocado.",
        "Sprinkle pumpkin seeds and chia seeds over the salad.",
        "If using, add the crumbled feta cheese.",
        "Just before serving, drizzle with the citrus dressing.",
        "Gently toss all ingredients together and serve immediately."
      ];
    } else if (mealName.includes("Pasta")) {
      generatedSteps = [
        "Bring a large pot of salted water to a boil and cook pasta according to package directions until al dente.",
        "While pasta is cooking, heat olive oil in a large skillet over medium heat.",
        "Add diced onion and cook until translucent, about 3-4 minutes.",
        "Add minced garlic and cook for another 30 seconds until fragrant.",
        "Add ground turkey to the skillet and cook until browned and no longer pink, breaking it up with a wooden spoon.",
        "Stir in marinara sauce, dried oregano, and dried basil. Simmer for 5-7 minutes.",
        "Drain pasta and add it to the sauce, tossing to coat evenly.",
        "Serve hot, topped with grated parmesan cheese."
      ];
    } else {
      // Default cooking steps
      generatedSteps = [
        "Prepare all ingredients by washing, chopping, and measuring as needed.",
        "Cook the protein source using your preferred method until it reaches a safe internal temperature.",
        "In a separate pot or pan, cook the complex carbohydrates according to package instructions.",
        "Steam or sauté the vegetables until tender but still vibrant.",
        "Combine all components on a plate or in a bowl, with protein, carbs, and vegetables in separate sections.",
        "Drizzle with healthy fat and season with herbs, spices, salt, and pepper.",
        "Let rest for 2-3 minutes before serving for flavors to meld together."
      ];
    }

    // Update form data with generated content
    onFormDataChange({
      ingredients: generatedIngredients,
      steps: generatedSteps
    });

    // Open both sections to show the generated content
    setIngredientsOpen(true);
    setStepsOpen(true);
  };

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

        <Button
          type="button"
          onClick={generateAIContent}
          className="w-full bg-purple-700 hover:bg-purple-800 text-white"
        >
          Generate Ingredients & Steps with AI
        </Button>
        
        {/* Ingredients Section */}
        <Collapsible 
          open={ingredientsOpen} 
          onOpenChange={setIngredientsOpen}
          className="border border-quantum-cyan/20 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UtensilsCrossed className="mr-2 h-5 w-5 text-quantum-cyan" />
              <h3 className="text-lg font-medium">Ingredients</h3>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {ingredientsOpen ? "Hide" : "Edit"}
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent className="mt-4">
            <IngredientForm 
              ingredients={formData.ingredients || []} 
              onChange={handleIngredientsChange} 
            />
          </CollapsibleContent>
        </Collapsible>
        
        {/* Cooking Steps Section */}
        <Collapsible 
          open={stepsOpen} 
          onOpenChange={setStepsOpen}
          className="border border-quantum-cyan/20 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ScrollText className="mr-2 h-5 w-5 text-quantum-cyan" />
              <h3 className="text-lg font-medium">Cooking Steps</h3>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {stepsOpen ? "Hide" : "Edit"}
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent className="mt-4">
            <StepsForm 
              steps={formData.steps || []} 
              onChange={handleStepsChange} 
            />
          </CollapsibleContent>
        </Collapsible>
        
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
