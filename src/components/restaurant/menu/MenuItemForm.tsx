
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MenuItem, MenuCategory } from '@/types/menu';

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
  const [formData, setFormData] = useState<MenuItem>(item);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{item.id ? 'Edit' : 'Add'} Menu Item</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handlePriceChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preparation_time">Prep Time (min)</Label>
              <Input
                id="preparation_time"
                name="preparation_time"
                type="number"
                min="1"
                value={formData.preparation_time}
                onChange={handlePrepTimeChange}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
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
          
          <div className="pt-4">
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
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              name="image_url"
              value={formData.image_url || ''}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
            />
            {formData.image_url && (
              <div className="mt-2">
                <img 
                  src={formData.image_url} 
                  alt={formData.name} 
                  className="w-40 h-40 object-cover rounded-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : (item.id ? 'Update' : 'Create')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
