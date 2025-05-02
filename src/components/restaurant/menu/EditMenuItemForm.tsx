import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, Loader2, X } from 'lucide-react';
import { saveMenuItem } from '@/services/restaurant/menuService';
import { toast } from '@/hooks/use-toast';
import { MenuItem } from '@/types/menu'; // Use MenuItem from menu.ts

// Define the form schema
const menuItemSchema = z.object({
  name: z.string().min(2, { message: 'Item name must be at least 2 characters' }),
  description: z.string().optional(),
  price: z.preprocess(
    (val) => Number(val),
    z.number().min(0, { message: 'Price must be a positive number' })
  ),
  category: z.string().min(1, { message: 'Category is required' }),
  image_url: z.string().optional(),
  preparation_time: z.preprocess(
    (val) => Number(val),
    z.number().int().min(1, { message: 'Preparation time must be at least 1 minute' })
  ),
  is_available: z.boolean(),
  ingredients: z.string().optional(),
  nutritional_info: z.object({
    calories: z.preprocess((val) => val ? Number(val) : undefined, z.number().optional()),
    protein: z.preprocess((val) => val ? Number(val) : undefined, z.number().optional()),
    carbs: z.preprocess((val) => val ? Number(val) : undefined, z.number().optional()),
    fat: z.preprocess((val) => val ? Number(val) : undefined, z.number().optional()),
  }).optional(),
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

interface EditMenuItemFormProps {
  item: MenuItem;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditMenuItemForm: React.FC<EditMenuItemFormProps> = ({ item, onCancel, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert ingredients array to comma-separated string for the form
  const ingredientsString = item.ingredients ? item.ingredients.join(', ') : '';

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      image_url: item.image_url || '',
      preparation_time: item.preparation_time,
      is_available: item.is_available,
      ingredients: ingredientsString,
      nutritional_info: {
        calories: item.nutritional_info?.calories,
        protein: item.nutritional_info?.protein,
        carbs: item.nutritional_info?.carbs,
        fat: item.nutritional_info?.fat,
      },
    },
  });

  const onSubmit = async (data: MenuItemFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Process ingredients from comma-separated string to array
      const ingredientsArray = data.ingredients
        ? data.ingredients.split(',').map(item => item.trim()).filter(item => item.length > 0)
        : [];
      
      // Create the updated menu item object
      const updatedItem: MenuItem = {
        ...item,
        name: data.name,
        description: data.description || '',
        price: data.price,
        category: data.category,
        image_url: data.image_url || '',
        preparation_time: data.preparation_time,
        is_available: data.is_available,
        ingredients: ingredientsArray,
        nutritional_info: data.nutritional_info || {},
      };
      
      await saveMenuItem(updatedItem);
      
      toast({
        title: 'Menu item updated',
        description: `${updatedItem.name} has been updated successfully.`,
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast({
        title: 'Error updating menu item',
        description: 'There was a problem updating your menu item. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Menu Item Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Classic Burger"
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your menu item..."
              rows={3}
              {...register('description')}
            />
          </div>
          
          <div>
            <Label htmlFor="price">Price *</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5">$</span>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="pl-7"
                {...register('price')}
              />
            </div>
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="category">Category *</Label>
            <Input
              id="category"
              placeholder="e.g., Main Course"
              {...register('category')}
              className={errors.category ? 'border-red-500' : ''}
            />
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              placeholder="https://example.com/image.jpg"
              {...register('image_url')}
            />
          </div>
          
          <div>
            <Label htmlFor="preparation_time">Preparation Time (minutes) *</Label>
            <Input
              id="preparation_time"
              type="number"
              min="1"
              {...register('preparation_time')}
            />
            {errors.preparation_time && (
              <p className="text-red-500 text-sm mt-1">{errors.preparation_time.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="ingredients">Ingredients (comma separated)</Label>
            <Textarea
              id="ingredients"
              placeholder="e.g., Beef patty, lettuce, tomato, cheese"
              rows={2}
              {...register('ingredients')}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Controller
              name="is_available"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="is_available">Available on menu</Label>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-md font-medium mb-2">Nutritional Information (Optional)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="calories">Calories</Label>
            <Input
              id="calories"
              type="number"
              min="0"
              placeholder="0"
              {...register('nutritional_info.calories')}
            />
          </div>
          <div>
            <Label htmlFor="protein">Protein (g)</Label>
            <Input
              id="protein"
              type="number"
              min="0"
              step="0.1"
              placeholder="0"
              {...register('nutritional_info.protein')}
            />
          </div>
          <div>
            <Label htmlFor="carbs">Carbs (g)</Label>
            <Input
              id="carbs"
              type="number"
              min="0"
              step="0.1"
              placeholder="0"
              {...register('nutritional_info.carbs')}
            />
          </div>
          <div>
            <Label htmlFor="fat">Fat (g)</Label>
            <Input
              id="fat"
              type="number"
              min="0"
              step="0.1"
              placeholder="0"
              {...register('nutritional_info.fat')}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          <X className="mr-2 h-4 w-4" /> Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" /> Update Item
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default EditMenuItemForm;
