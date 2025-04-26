
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MenuItemImageUpload } from '../MenuItemImageUpload';
import { Label } from '@/components/ui/label';
import { UseFormReturn } from 'react-hook-form';
import { MenuCategory } from '@/types/menu';

interface BasicDetailsTabProps {
  form: UseFormReturn<any>;
  categories: MenuCategory[];
  onImageUploaded: (url: string) => void;
}

export const BasicDetailsTab: React.FC<BasicDetailsTabProps> = ({
  form,
  categories,
  onImageUploaded
}) => {
  return (
    <div className="space-y-4">
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
            onImageUploaded={onImageUploaded}
          />
        </div>
      </div>
    </div>
  );
};
