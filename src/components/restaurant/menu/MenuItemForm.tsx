
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MenuItem, MenuCategory } from '@/types/menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MenuItemImageUpload } from './MenuItemImageUpload';
import { X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define validation schema
const menuItemSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  description: z.string().optional(),
  price: z.coerce.number().positive({ message: 'Price must be positive' }),
  category: z.string().min(1, { message: 'Category is required' }),
  is_available: z.boolean().default(true),
  preparation_time: z.coerce.number().int().positive({ message: 'Preparation time must be positive' }),
  image_url: z.string().optional(),
  nutritional_info: z.object({
    calories: z.coerce.number().nonnegative({ message: 'Calories must be 0 or higher' }),
    protein: z.coerce.number().nonnegative({ message: 'Protein must be 0 or higher' }),
    carbs: z.coerce.number().nonnegative({ message: 'Carbs must be 0 or higher' }),
    fat: z.coerce.number().nonnegative({ message: 'Fat must be 0 or higher' }),
  }),
  ingredients: z.array(z.string()).optional(),
  steps: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof menuItemSchema>;

interface MenuItemFormProps {
  item: MenuItem;
  categories: MenuCategory[];
  onSave: (item: MenuItem) => Promise<void>;
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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [ingredients, setIngredients] = useState<string[]>(item.ingredients || []);
  const [newIngredient, setNewIngredient] = useState('');
  const [steps, setSteps] = useState<string[]>(item.steps || []);
  const [newStep, setNewStep] = useState('');
  
  // Initialize form with existing data
  const form = useForm<FormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: item.name || '',
      description: item.description || '',
      price: item.price || 0,
      category: item.category || (categories.length > 0 ? categories[0].name : ''),
      is_available: item.is_available ?? true,
      preparation_time: item.preparation_time || 15,
      image_url: item.image_url || '',
      nutritional_info: {
        calories: item.nutritional_info?.calories || 0,
        protein: item.nutritional_info?.protein || 0,
        carbs: item.nutritional_info?.carbs || 0,
        fat: item.nutritional_info?.fat || 0,
      },
      ingredients: item.ingredients || [],
      steps: item.steps || [],
    },
  });

  // Update form when item changes
  useEffect(() => {
    form.reset({
      name: item.name || '',
      description: item.description || '',
      price: item.price || 0,
      category: item.category || (categories.length > 0 ? categories[0].name : ''),
      is_available: item.is_available ?? true,
      preparation_time: item.preparation_time || 15,
      image_url: item.image_url || '',
      nutritional_info: {
        calories: item.nutritional_info?.calories || 0,
        protein: item.nutritional_info?.protein || 0,
        carbs: item.nutritional_info?.carbs || 0,
        fat: item.nutritional_info?.fat || 0,
      },
      ingredients: item.ingredients || [],
      steps: item.steps || [],
    });
    setIngredients(item.ingredients || []);
    setSteps(item.steps || []);
  }, [item, categories, form]);

  const onSubmit = async (data: FormValues) => {
    // Prepare item data
    const updatedItem: MenuItem = {
      ...item,
      ...data,
      ingredients,
      steps,
    };
    
    // Call onSave with updated data
    await onSave(updatedItem);
  };

  const handleImageUploaded = (url: string) => {
    form.setValue('image_url', url);
    toast({
      title: "Image uploaded successfully",
      description: "Your image has been uploaded and will be saved when you submit the form",
    });
  };
  
  // Handle ingredient management
  const addIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };
  
  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };
  
  // Handle cooking step management
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Basic Details</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="steps">Cooking Steps</TabsTrigger>
        </TabsList>
      
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                        disabled={categories.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      {categories.length === 0 && (
                        <FormDescription>
                          Please add a category first
                        </FormDescription>
                      )}
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="preparation_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preparation Time (minutes) *</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="is_available"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Available</FormLabel>
                      <FormDescription>
                        Make this item available for customers to order
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div>
                <Label>Menu Item Image</Label>
                <div className="mt-2">
                  <MenuItemImageUpload 
                    currentImageUrl={form.getValues('image_url')} 
                    onImageUploaded={handleImageUploaded}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="nutrition" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nutritional_info.calories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories *</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="nutritional_info.protein"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein (g) *</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nutritional_info.carbs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carbohydrates (g) *</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="nutritional_info.fat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fat (g) *</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="ingredients" className="space-y-6">
              <div className="space-y-4">
                <Label>Ingredients</Label>
                <ul className="space-y-2">
                  {ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <span>{ingredient}</span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeIngredient(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
                
                <div className="flex items-center space-x-2">
                  <Input
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    placeholder="Add an ingredient"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addIngredient();
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={addIngredient}
                    disabled={!newIngredient.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="steps" className="space-y-6">
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
            </TabsContent>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" loading={isLoading}>
                Save
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
};
