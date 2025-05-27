
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { restaurantService, type Restaurant } from '@/services/restaurantService';

interface BasicInfoStepProps {
  restaurant: Restaurant;
  onComplete: (data: Record<string, any>) => void;
}

const CUISINE_TYPES = [
  'American', 'Italian', 'Chinese', 'Mexican', 'Indian', 'Thai', 'Japanese',
  'Mediterranean', 'French', 'Greek', 'Korean', 'Vietnamese', 'Middle Eastern',
  'African', 'Caribbean', 'Fusion', 'Fast Food', 'Healthy', 'Vegetarian', 'Vegan'
];

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ restaurant, onComplete }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: restaurant.name || '',
    email: restaurant.email || '',
    phone: restaurant.phone || '',
    address: restaurant.address || '',
    city: restaurant.city || '',
    postal_code: restaurant.postal_code || '',
    country: restaurant.country || '',
    description: restaurant.description || '',
    cuisine_type: restaurant.cuisine_type || '',
    delivery_radius: restaurant.delivery_radius || 10,
    minimum_order_amount: restaurant.minimum_order_amount || 0,
    delivery_fee: restaurant.delivery_fee || 0,
    estimated_delivery_time: restaurant.estimated_delivery_time || 45
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      
      await restaurantService.updateRestaurant(restaurant.id, {
        ...formData,
        updated_at: new Date().toISOString()
      });
      
      onComplete(formData);
    } catch (error) {
      console.error('Error updating restaurant:', error);
      toast({
        title: 'Error',
        description: 'Failed to update restaurant information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Restaurant Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="cuisine_type">Cuisine Type *</Label>
          <Select value={formData.cuisine_type} onValueChange={(value) => handleInputChange('cuisine_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select cuisine type" />
            </SelectTrigger>
            <SelectContent>
              {CUISINE_TYPES.map(cuisine => (
                <SelectItem key={cuisine} value={cuisine.toLowerCase()}>
                  {cuisine}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            required
          />
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="postal_code">Postal Code</Label>
          <Input
            id="postal_code"
            value={formData.postal_code}
            onChange={(e) => handleInputChange('postal_code', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="delivery_radius">Delivery Radius (km)</Label>
          <Input
            id="delivery_radius"
            type="number"
            value={formData.delivery_radius}
            onChange={(e) => handleInputChange('delivery_radius', Number(e.target.value))}
          />
        </div>
        
        <div>
          <Label htmlFor="minimum_order_amount">Minimum Order Amount</Label>
          <Input
            id="minimum_order_amount"
            type="number"
            step="0.01"
            value={formData.minimum_order_amount}
            onChange={(e) => handleInputChange('minimum_order_amount', Number(e.target.value))}
          />
        </div>
        
        <div>
          <Label htmlFor="delivery_fee">Delivery Fee</Label>
          <Input
            id="delivery_fee"
            type="number"
            step="0.01"
            value={formData.delivery_fee}
            onChange={(e) => handleInputChange('delivery_fee', Number(e.target.value))}
          />
        </div>
        
        <div>
          <Label htmlFor="estimated_delivery_time">Estimated Delivery Time (minutes)</Label>
          <Input
            id="estimated_delivery_time"
            type="number"
            value={formData.estimated_delivery_time}
            onChange={(e) => handleInputChange('estimated_delivery_time', Number(e.target.value))}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe your restaurant, specialties, etc."
          rows={3}
        />
      </div>
      
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Saving...' : 'Save & Continue'}
      </Button>
    </form>
  );
};
