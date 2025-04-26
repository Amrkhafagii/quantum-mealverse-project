
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';

interface NutritionalInfoTabProps {
  form: UseFormReturn<any>;
}

export const NutritionalInfoTab: React.FC<NutritionalInfoTabProps> = ({ form }) => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};
