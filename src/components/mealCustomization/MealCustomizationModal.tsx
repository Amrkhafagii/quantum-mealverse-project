
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Meal } from '@/types/meal';
import { useMealCustomization } from '@/hooks/useMealCustomization';
import { QuantitySelector } from './QuantitySelector';
import { PortionSizeSelector } from './PortionSizeSelector';
import { DietaryPreferencesSelector } from './DietaryPreferencesSelector';
import { IngredientSubstitutionSelector } from './IngredientSubstitutionSelector';
import { CustomizationOptionsSelector } from './CustomizationOptionsSelector';
import { SpecialInstructionsInput } from './SpecialInstructionsInput';
import { CustomizationSummary } from './CustomizationSummary';
import { X } from 'lucide-react';

interface MealCustomizationModalProps {
  meal: Meal;
  userId: string;
  mealPlanId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (customizedMeal: any) => void;
}

export const MealCustomizationModal: React.FC<MealCustomizationModalProps> = ({
  meal,
  userId,
  mealPlanId,
  isOpen,
  onClose,
  onSave
}) => {
  const customization = useMealCustomization(meal.id, userId);

  const handleSave = async () => {
    const savedCustomization = await customization.saveCustomization(mealPlanId);
    if (savedCustomization) {
      onSave({
        meal,
        customization: savedCustomization,
        summary: customization.customizationSummary
      });
      onClose();
    }
  };

  const handleClose = () => {
    customization.resetCustomization();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Customize {meal.name}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="basics" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basics">Basics</TabsTrigger>
                <TabsTrigger value="dietary">Dietary</TabsTrigger>
                <TabsTrigger value="substitutions">Substitutions</TabsTrigger>
                <TabsTrigger value="extras">Extras</TabsTrigger>
              </TabsList>

              <TabsContent value="basics" className="space-y-6">
                <QuantitySelector
                  value={customization.servingsCount}
                  onChange={customization.setServingsCount}
                  max={10}
                />
                
                <PortionSizeSelector
                  value={customization.portionMultiplier}
                  onChange={customization.setPortionMultiplier}
                />
              </TabsContent>

              <TabsContent value="dietary" className="space-y-6">
                <DietaryPreferencesSelector
                  availablePreferences={customization.dietaryPreferences}
                  selectedPreferences={customization.selectedDietaryPreferences}
                  onTogglePreference={customization.toggleDietaryPreference}
                />
              </TabsContent>

              <TabsContent value="substitutions" className="space-y-6">
                <IngredientSubstitutionSelector
                  availableSubstitutions={customization.ingredientSubstitutions}
                  selectedSubstitutions={customization.selectedSubstitutions}
                  onAddSubstitution={customization.addSubstitution}
                  onRemoveSubstitution={customization.removeSubstitution}
                />
              </TabsContent>

              <TabsContent value="extras" className="space-y-6">
                <CustomizationOptionsSelector
                  availableOptions={customization.customizationOptions}
                  selectedOptions={customization.selectedOptions}
                  onAddOption={customization.addOption}
                  onRemoveOption={customization.removeOption}
                />
                
                <SpecialInstructionsInput
                  value={customization.specialInstructions}
                  onChange={customization.setSpecialInstructions}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <CustomizationSummary
              meal={meal}
              customizations={[...customization.selectedSubstitutions.map(sub => ({
                name: `${sub.original_ingredient} → ${sub.substitute_ingredient}`,
                priceImpact: sub.price_adjustment,
                timeImpact: 0
              })), ...customization.selectedOptions.map(opt => ({
                name: opt.option_name,
                priceImpact: opt.price_adjustment,
                timeImpact: 0
              }))]}
              onConfirm={handleSave}
              onCancel={handleClose}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={customization.loading}
          >
            {customization.loading ? 'Saving...' : 'Save Customization'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
