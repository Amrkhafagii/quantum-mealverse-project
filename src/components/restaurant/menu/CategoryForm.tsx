
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MenuCategory } from '@/types/menu';

interface CategoryFormProps {
  category: MenuCategory;
  onSave: (category: MenuCategory) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSave,
  onCancel,
  isLoading
}) => {
  const [formData, setFormData] = useState<MenuCategory>(category);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setFormData(prev => ({ ...prev, order: isNaN(value) ? undefined : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{category.id ? 'Edit' : 'Add'} Category</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
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
              value={formData.description || ''}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              name="order"
              type="number"
              min="0"
              value={formData.order || ''}
              onChange={handleOrderChange}
              placeholder="Optional - for sorting categories"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : (category.id ? 'Update' : 'Create')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
