import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { promotionService } from '@/services/promotions/promotionService';
import type { RestaurantPromotion } from '@/types/notifications';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { useToast } from '@/components/ui/use-toast';

type PromotionType = 'percentage_discount' | 'fixed_discount' | 'buy_one_get_one' | 'free_delivery' | 'combo_deal';

export const PromotionsManager: React.FC = () => {
  const { restaurant } = useRestaurantAuth();
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<RestaurantPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<RestaurantPromotion | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    promotion_type: PromotionType;
    discount_value: number;
    minimum_order_amount: number;
    maximum_discount_amount: number;
    start_date: string;
    end_date: string;
    usage_limit: string;
    promo_code: string;
    terms_conditions: string;
    is_active: boolean;
  }>({
    name: '',
    description: '',
    promotion_type: 'percentage_discount',
    discount_value: 0,
    minimum_order_amount: 0,
    maximum_discount_amount: 0,
    start_date: '',
    end_date: '',
    usage_limit: '',
    promo_code: '',
    terms_conditions: '',
    is_active: true
  });

  useEffect(() => {
    if (!restaurant?.id) return;
    loadPromotions();
  }, [restaurant?.id]);

  const loadPromotions = async () => {
    if (!restaurant?.id) return;
    
    try {
      const data = await promotionService.getAllPromotions(restaurant.id);
      setPromotions(data);
    } catch (error) {
      console.error('Error loading promotions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load promotions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant?.id) return;

    try {
      const promotionData = {
        ...formData,
        restaurant_id: restaurant.id,
        discount_value: formData.discount_value || undefined,
        maximum_discount_amount: formData.maximum_discount_amount || undefined,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : undefined,
        applicable_items: []
      };

      if (editingPromotion) {
        await promotionService.updatePromotion(editingPromotion.id, promotionData);
        toast({
          title: 'Success',
          description: 'Promotion updated successfully'
        });
      } else {
        await promotionService.createPromotion(promotionData);
        toast({
          title: 'Success',
          description: 'Promotion created successfully'
        });
      }

      resetForm();
      loadPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
      toast({
        title: 'Error',
        description: 'Failed to save promotion',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      promotion_type: 'percentage_discount',
      discount_value: 0,
      minimum_order_amount: 0,
      maximum_discount_amount: 0,
      start_date: '',
      end_date: '',
      usage_limit: '',
      promo_code: '',
      terms_conditions: '',
      is_active: true
    });
    setShowCreateForm(false);
    setEditingPromotion(null);
  };

  const handleEdit = (promotion: RestaurantPromotion) => {
    setFormData({
      name: promotion.name,
      description: promotion.description || '',
      promotion_type: promotion.promotion_type,
      discount_value: promotion.discount_value || 0,
      minimum_order_amount: promotion.minimum_order_amount,
      maximum_discount_amount: promotion.maximum_discount_amount || 0,
      start_date: promotion.start_date.split('T')[0],
      end_date: promotion.end_date.split('T')[0],
      usage_limit: promotion.usage_limit?.toString() || '',
      promo_code: promotion.promo_code || '',
      terms_conditions: promotion.terms_conditions || '',
      is_active: promotion.is_active
    });
    setEditingPromotion(promotion);
    setShowCreateForm(true);
  };

  const handleToggleStatus = async (promotionId: string, isActive: boolean) => {
    try {
      await promotionService.togglePromotionStatus(promotionId, !isActive);
      toast({
        title: 'Success',
        description: `Promotion ${!isActive ? 'activated' : 'deactivated'}`
      });
      loadPromotions();
    } catch (error) {
      console.error('Error toggling promotion status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update promotion status',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (promotionId: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;

    try {
      await promotionService.deletePromotion(promotionId);
      toast({
        title: 'Success',
        description: 'Promotion deleted successfully'
      });
      loadPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete promotion',
        variant: 'destructive'
      });
    }
  };

  const handlePromotionTypeChange = (value: string) => {
    setFormData({ ...formData, promotion_type: value as PromotionType });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Promotions Management</h2>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Promotion
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Promotion Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="promo_code">Promo Code</Label>
                  <Input
                    id="promo_code"
                    value={formData.promo_code}
                    onChange={(e) => setFormData({ ...formData, promo_code: e.target.value })}
                    placeholder="e.g., SAVE20"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="promotion_type">Promotion Type *</Label>
                  <Select 
                    value={formData.promotion_type} 
                    onValueChange={handlePromotionTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage_discount">Percentage Discount</SelectItem>
                      <SelectItem value="fixed_discount">Fixed Amount Discount</SelectItem>
                      <SelectItem value="free_delivery">Free Delivery</SelectItem>
                      <SelectItem value="buy_one_get_one">Buy One Get One</SelectItem>
                      <SelectItem value="combo_deal">Combo Deal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="discount_value">
                    {formData.promotion_type === 'percentage_discount' ? 'Discount %' : 'Discount Amount $'}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    step="0.01"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="minimum_order_amount">Minimum Order Amount $</Label>
                  <Input
                    id="minimum_order_amount"
                    type="number"
                    step="0.01"
                    value={formData.minimum_order_amount}
                    onChange={(e) => setFormData({ ...formData, minimum_order_amount: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="usage_limit">Usage Limit</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="terms_conditions">Terms & Conditions</Label>
                <Textarea
                  id="terms_conditions"
                  value={formData.terms_conditions}
                  onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPromotion ? 'Update' : 'Create'} Promotion
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Promotions List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Promotions</CardTitle>
        </CardHeader>
        <CardContent>
          {promotions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No promotions created yet</p>
              <p className="text-sm">Create your first promotion to attract customers</p>
            </div>
          ) : (
            <div className="space-y-4">
              {promotions.map((promotion) => (
                <div key={promotion.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-lg">{promotion.name}</h3>
                      {promotion.description && (
                        <p className="text-gray-600 text-sm">{promotion.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={promotion.is_active ? 'default' : 'secondary'}>
                        {promotion.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">
                        {promotion.promotion_type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">Discount:</span>
                      <p className="font-medium">
                        {promotion.promotion_type === 'percentage_discount' 
                          ? `${promotion.discount_value}%`
                          : formatCurrency(promotion.discount_value || 0)
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Min Order:</span>
                      <p className="font-medium">{formatCurrency(promotion.minimum_order_amount)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Usage:</span>
                      <p className="font-medium">
                        {promotion.usage_count} / {promotion.usage_limit || '∞'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Valid Until:</span>
                      <p className="font-medium">
                        {new Date(promotion.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {promotion.promo_code && (
                    <div className="mb-3">
                      <span className="text-gray-500 text-sm">Promo Code:</span>
                      <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-sm">
                        {promotion.promo_code}
                      </code>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(promotion.id, promotion.is_active)}
                    >
                      {promotion.is_active ? (
                        <ToggleRight className="h-4 w-4 mr-1" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 mr-1" />
                      )}
                      {promotion.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(promotion)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(promotion.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
