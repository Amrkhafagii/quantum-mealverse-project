
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MenuItem, MenuCategory } from '@/types/menu';
import { MenuItemImageUpload } from './MenuItemImageUpload';
import { PlusCircle, Minus, GripVertical } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MenuItemFormProps {
  item: MenuItem;
  categories: MenuCategory[];
  onSave: (item: MenuItem) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const MenuItemForm: React.FC<MenuItemFormProps> = ({
  item,
  categories,
  onSave,
  onCancel,
  isLoading
}) => {
  const [formData, setFormData] = useState<MenuItem>({
    ...item,
    ingredients: item.ingredients || [],
    steps: item.steps || []
  });
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setFormData(prev => ({ ...prev, price: isNaN(value) ? 0 : value }));
  };

  const handlePrepTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setFormData(prev => ({ ...prev, preparation_time: isNaN(value) ? 15 : value }));
  };

  const handleAvailabilityChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_available: checked }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleNutritionalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    setFormData(prev => ({
      ...prev,
      nutritional_info: {
        ...(prev.nutritional_info || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        }),
        [name.replace('nutritional_', '')]: isNaN(numValue) ? 0 : numValue
      }
    }));
  };

  // Handle ingredients
  const handleAddIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), ""]
    }));
  };

  const handleIngredientChange = (index: number, value: string) => {
    const updatedIngredients = [...(formData.ingredients || [])];
    updatedIngredients[index] = value;
    setFormData(prev => ({
      ...prev,
      ingredients: updatedIngredients
    }));
  };

  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = [...(formData.ingredients || [])];
    updatedIngredients.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      ingredients: updatedIngredients
    }));
  };

  // Handle cooking steps
  const handleAddStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...(prev.steps || []), ""]
    }));
  };

  const handleStepChange = (index: number, value: string) => {
    const updatedSteps = [...(formData.steps || [])];
    updatedSteps[index] = value;
    setFormData(prev => ({
      ...prev,
      steps: updatedSteps
    }));
  };

  const handleRemoveStep = (index: number) => {
    const updatedSteps = [...(formData.steps || [])];
    updatedSteps.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      steps: updatedSteps
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.name || !formData.price || !formData.category) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    onSave(formData);
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, image_url: imageUrl }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{item.id ? 'Edit' : 'Add'} Menu Item</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="steps">Cooking Steps</TabsTrigger>
            </TabsList>
          </div>
          
          <CardContent className="space-y-4 pt-6">
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="focus:ring-quantum-cyan"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="focus:ring-quantum-cyan"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handlePriceChange}
                    required
                    className="focus:ring-quantum-cyan"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="preparation_time">Prep Time (min) *</Label>
                  <Input
                    id="preparation_time"
                    name="preparation_time"
                    type="number"
                    min="1"
                    value={formData.preparation_time}
                    onChange={handlePrepTimeChange}
                    required
                    className="focus:ring-quantum-cyan"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="focus:ring-quantum-cyan">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="is_available" 
                  checked={formData.is_available}
                  onCheckedChange={handleAvailabilityChange}
                />
                <Label htmlFor="is_available">Available for ordering</Label>
              </div>
              
              <div className="space-y-2">
                <Label>Item Image</Label>
                <MenuItemImageUpload
                  currentImageUrl={formData.image_url}
                  onImageUploaded={handleImageUploaded}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="nutrition" className="space-y-4">
              <h3 className="text-lg font-medium mb-2">Nutritional Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nutritional_calories">Calories</Label>
                  <Input
                    id="nutritional_calories"
                    name="nutritional_calories"
                    type="number"
                    min="0"
                    value={formData.nutritional_info?.calories || 0}
                    onChange={handleNutritionalChange}
                    className="focus:ring-quantum-cyan"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nutritional_protein">Protein (g)</Label>
                  <Input
                    id="nutritional_protein"
                    name="nutritional_protein"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.nutritional_info?.protein || 0}
                    onChange={handleNutritionalChange}
                    className="focus:ring-quantum-cyan"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nutritional_carbs">Carbs (g)</Label>
                  <Input
                    id="nutritional_carbs"
                    name="nutritional_carbs"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.nutritional_info?.carbs || 0}
                    onChange={handleNutritionalChange}
                    className="focus:ring-quantum-cyan"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nutritional_fat">Fat (g)</Label>
                  <Input
                    id="nutritional_fat"
                    name="nutritional_fat"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.nutritional_info?.fat || 0}
                    onChange={handleNutritionalChange}
                    className="focus:ring-quantum-cyan"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nutritional_fiber">Fiber (g)</Label>
                  <Input
                    id="nutritional_fiber"
                    name="nutritional_fiber"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.nutritional_info?.fiber || 0}
                    onChange={handleNutritionalChange}
                    className="focus:ring-quantum-cyan"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nutritional_sugar">Sugar (g)</Label>
                  <Input
                    id="nutritional_sugar"
                    name="nutritional_sugar"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.nutritional_info?.sugar || 0}
                    onChange={handleNutritionalChange}
                    className="focus:ring-quantum-cyan"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nutritional_sodium">Sodium (mg)</Label>
                  <Input
                    id="nutritional_sodium"
                    name="nutritional_sodium"
                    type="number"
                    min="0"
                    value={formData.nutritional_info?.sodium || 0}
                    onChange={handleNutritionalChange}
                    className="focus:ring-quantum-cyan"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="ingredients" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Ingredients</h3>
                <Button 
                  type="button" 
                  onClick={handleAddIngredient} 
                  size="sm" 
                  variant="outline"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Ingredient
                </Button>
              </div>
              
              {(formData.ingredients || []).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No ingredients added yet. Click "Add Ingredient" to start.
                </div>
              ) : (
                <div className="space-y-2">
                  {(formData.ingredients || []).map((ingredient, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex items-center p-2">
                        <GripVertical className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <Input
                          value={ingredient}
                          onChange={(e) => handleIngredientChange(index, e.target.value)}
                          placeholder={`Ingredient ${index + 1}`}
                          className="focus:ring-quantum-cyan"
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveIngredient(index)}
                        className="text-red-500"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="steps" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Cooking Steps</h3>
                <Button 
                  type="button" 
                  onClick={handleAddStep} 
                  size="sm" 
                  variant="outline"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>
              
              {(formData.steps || []).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No cooking steps added yet. Click "Add Step" to start.
                </div>
              ) : (
                <div className="space-y-3">
                  {(formData.steps || []).map((step, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex items-start pt-3">
                        <div className="bg-quantum-cyan/20 rounded-full w-6 h-6 flex items-center justify-center text-sm">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <Textarea
                          value={step}
                          onChange={(e) => handleStepChange(index, e.target.value)}
                          placeholder={`Step ${index + 1}`}
                          className="focus:ring-quantum-cyan"
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveStep(index)}
                        className="text-red-500 mt-2"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          
          <div className="flex gap-2">
            {activeTab !== "basic" && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  const tabs = ["basic", "nutrition", "ingredients", "steps"];
                  const currentIndex = tabs.indexOf(activeTab);
                  setActiveTab(tabs[currentIndex - 1]);
                }}
                disabled={isLoading || activeTab === "basic"}
              >
                Previous
              </Button>
            )}
            
            {activeTab !== "steps" ? (
              <Button 
                type="button" 
                onClick={() => {
                  const tabs = ["basic", "nutrition", "ingredients", "steps"];
                  const currentIndex = tabs.indexOf(activeTab);
                  setActiveTab(tabs[currentIndex + 1]);
                }}
                disabled={isLoading}
              >
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : (item.id ? 'Update' : 'Create')}
              </Button>
            )}
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};
