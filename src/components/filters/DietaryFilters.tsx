
import React from 'react';
import { Check, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type DietaryTagType = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
};

export type DietaryFilterOption = {
  id: string;
  name: string;
  active: boolean;
};

interface DietaryFiltersProps {
  filters: DietaryFilterOption[];
  onFilterChange: (filters: DietaryFilterOption[]) => void;
  activeCount: number;
}

export const DIETARY_TAGS: DietaryTagType[] = [
  { id: 'vegetarian', name: 'Vegetarian', description: 'No meat, may contain dairy and eggs' },
  { id: 'vegan', name: 'Vegan', description: 'No animal products' },
  { id: 'gluten-free', name: 'Gluten-Free', description: 'No gluten-containing ingredients' },
  { id: 'dairy-free', name: 'Dairy-Free', description: 'No dairy products' },
  { id: 'keto', name: 'Keto', description: 'Low carb, high fat' },
  { id: 'paleo', name: 'Paleo', description: 'Based on foods presumed to be eaten by early humans' },
  { id: 'nut-free', name: 'Nut-Free', description: 'No nuts or nut derivatives' },
  { id: 'organic', name: 'Organic', description: 'Made with certified organic ingredients' },
  { id: 'low-calorie', name: 'Low-Calorie', description: 'Under 400 calories per serving' },
  { id: 'high-protein', name: 'High-Protein', description: 'Contains at least 20g of protein' },
];

const DietaryFilters: React.FC<DietaryFiltersProps> = ({ filters, onFilterChange, activeCount }) => {
  const toggleFilter = (id: string) => {
    const updatedFilters = filters.map(filter => 
      filter.id === id 
        ? { ...filter, active: !filter.active } 
        : filter
    );
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const resetFilters = filters.map(filter => ({ ...filter, active: false }));
    onFilterChange(resetFilters);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-quantum-darkBlue/30 border-quantum-cyan/30 hover:bg-quantum-darkBlue/50 hover:border-quantum-cyan/50 flex gap-2"
        >
          <Filter className="h-4 w-4" />
          Dietary Options
          {activeCount > 0 && (
            <Badge className="ml-1 bg-quantum-cyan text-quantum-black">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 bg-quantum-darkBlue/90 border-quantum-cyan/30 backdrop-blur-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-quantum-cyan">Dietary Preferences</h3>
            {activeCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters} 
                className="h-8 px-2 text-xs text-quantum-cyan hover:bg-quantum-cyan/10"
              >
                Clear All
              </Button>
            )}
          </div>
          
          <div className="grid gap-2">
            {filters.map(filter => (
              <Toggle
                key={filter.id}
                pressed={filter.active}
                onPressedChange={() => toggleFilter(filter.id)}
                className={`justify-start ${filter.active ? 'bg-quantum-cyan/20 border-quantum-cyan hover:bg-quantum-cyan/30' : ''}`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 mr-2 rounded flex items-center justify-center ${filter.active ? 'bg-quantum-cyan text-quantum-black' : 'border border-quantum-cyan/30'}`}>
                    {filter.active && <Check className="h-3 w-3" />}
                  </div>
                  <span>{filter.name}</span>
                </div>
              </Toggle>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DietaryFilters;
