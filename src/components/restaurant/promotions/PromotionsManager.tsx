
import React, { useState, useEffect } from 'react';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { promotionService } from '@/services/promotions/promotionService';
import { RestaurantPromotion, PromotionType } from '@/types/notifications';

// Remove local PromotionType definition -- now using the import only

const PromotionsManager: React.FC = () => {
  const { restaurant } = useRestaurantAuth();
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<RestaurantPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<RestaurantPromotion, 'id' | 'usage_count' | 'created_at' | 'updated_at'>>({
    restaurant_id: '',
    name: '',
    description: '',
    promotion_type: 'discount', // default from union
    discount_value: 0,
    minimum_order_amount: 0,
    maximum_discount_amount: 0,
    start_date: '',
    end_date: '',
    usage_limit: 0,
    applicable_items: [],
    promo_code: '',
    terms_conditions: '',
    is_active: true,
  });

  useEffect(() => {
    if (!restaurant?.id) return;
    setForm((f) => ({ ...f, restaurant_id: restaurant.id }));
    fetchPromotions();
    // eslint-disable-next-line
  }, [restaurant?.id]);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const data = await promotionService.getPromotionsByRestaurant(restaurant!.id);
      setPromotions(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch promotions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeChange = (val: PromotionType) => {
    setForm((prev) => ({ ...prev, promotion_type: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await promotionService.createPromotion(form);
      toast({
        title: 'Success',
        description: 'Promotion created successfully',
      });
      setShowForm(false);
      fetchPromotions();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create promotion',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CardTitle>Promotions</CardTitle>
              <Badge>{promotions.length}</Badge>
            </div>
          </CardContent>
        </Card>
        <Button onClick={() => setShowForm((v) => !v)} variant="default">
          <Plus className="mr-2 w-4 h-4" /> Add Promotion
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Promotion</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={form.name} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" value={form.description} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="promotion_type">Type</Label>
                <Select value={form.promotion_type} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount">Discount</SelectItem>
                    <SelectItem value="free_item">Free Item</SelectItem>
                    <SelectItem value="bogo">BOGO</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discount_value">Discount Value</Label>
                <Input id="discount_value" name="discount_value" type="number" value={form.discount_value} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="minimum_order_amount">Min Order Amount</Label>
                <Input id="minimum_order_amount" name="minimum_order_amount" type="number" value={form.minimum_order_amount} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="maximum_discount_amount">Max Discount Amount</Label>
                <Input id="maximum_discount_amount" name="maximum_discount_amount" type="number" value={form.maximum_discount_amount} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input id="start_date" name="start_date" type="date" value={form.start_date} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input id="end_date" name="end_date" type="date" value={form.end_date} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="usage_limit">Usage Limit</Label>
                <Input id="usage_limit" name="usage_limit" type="number" value={form.usage_limit} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="promo_code">Promo Code</Label>
                <Input id="promo_code" name="promo_code" value={form.promo_code} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="terms_conditions">Terms</Label>
                <Textarea id="terms_conditions" name="terms_conditions" value={form.terms_conditions} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="is_active">Active</Label>
                <Select value={form.is_active ? "active" : "inactive"} onValueChange={v => setForm(prev => ({ ...prev, is_active: v === "active" }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="w-full">
                  Create
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List promotions */}
      <div className="grid gap-4">
        {promotions.map((promotion) => (
          <Card key={promotion.id}>
            <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4">
              <div>
                <h4 className="text-lg font-semibold">{promotion.name}</h4>
                <p className="text-sm text-gray-500 mb-1">{promotion.description}</p>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="outline">{promotion.promotion_type}</Badge>
                  {promotion.is_active ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button size="icon" variant="ghost"><Edit className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost"><Trash2 className="w-4 h-4" /></Button>
                {promotion.is_active ? (
                  <ToggleRight className="w-5 h-5 text-green-400" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PromotionsManager;
