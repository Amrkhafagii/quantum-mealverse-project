
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { Card } from "@/components/ui/card";
import { useCart } from '@/contexts/CartContext';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { CheckoutAuthForm } from '@/components/CheckoutAuthForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { DeliveryForm, DeliveryFormValues } from '@/components/checkout/DeliveryForm';
import { Button } from '@/components/ui/button';

interface Order {
  id?: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  city: string;
  notes?: string;
  delivery_method: string;
  payment_method: string;
  delivery_fee: number;
  subtotal: number;
  total: number;
  status: string;
}

const Checkout = () => {
  const { items, totalAmount, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [hasDeliveryInfo, setHasDeliveryInfo] = useState(false);
  const [defaultValues, setDefaultValues] = useState<Partial<DeliveryFormValues>>({});

  useEffect(() => {
    const checkLoginStatus = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        const { data: userData } = await supabase.auth.getUser();
        setLoggedInUser(userData.user);
        
        const { data: deliveryInfo } = await supabase
          .from('delivery_info')
          .select('*')
          .eq('user_id', userData.user?.id)
          .single();
          
        if (deliveryInfo) {
          setHasDeliveryInfo(true);
          setDefaultValues({
            ...deliveryInfo,
            email: userData.user?.email || "",
          });
        } else if (userData.user?.email) {
          setDefaultValues({
            email: userData.user.email
          });
        }
      }
    };
    
    checkLoginStatus();
  }, []);

  const handleAuthSubmit = async (data: { email: string; password: string }) => {
    try {
      if (!loggedInUser) {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password
        });
        if (error) throw error;
        toast({
          title: "Account created",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (data: DeliveryFormValues) => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add some items to your cart before checkout",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const deliveryFee = data.deliveryMethod === "delivery" ? 50 : 0;
      const finalTotal = totalAmount + deliveryFee;
      
      const orderData: Order = {
        user_id: loggedInUser?.id,
        customer_name: data.fullName,
        customer_email: data.email,
        customer_phone: data.phone,
        delivery_address: data.address,
        city: data.city,
        notes: data.notes,
        delivery_method: data.deliveryMethod,
        payment_method: data.paymentMethod,
        delivery_fee: deliveryFee,
        subtotal: totalAmount,
        total: finalTotal,
        status: "pending"
      };
      
      const { data: insertedOrder, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();
        
      if (orderError) throw orderError;
      
      const orderItems = items.map(item => ({
        order_id: insertedOrder.id,
        meal_id: item.meal.id,
        quantity: item.quantity,
        price: item.meal.price,
        name: item.meal.name
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
        
      if (itemsError) throw itemsError;
      
      toast({
        title: "Order placed successfully",
        description: `Your order #${insertedOrder.id} has been placed successfully`,
      });
      
      clearCart();
      navigate(`/thank-you?order=${insertedOrder.id}`);
    } catch (error: any) {
      toast({
        title: "Error placing order",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-quantum-black text-white relative">
        <ParticleBackground />
        <Navbar />
        
        <main className="relative z-10 pt-24 pb-12 container mx-auto px-4">
          <h1 className="text-4xl font-bold text-quantum-cyan mb-8 neon-text">Checkout</h1>
          
          <Card className="p-8 text-center holographic-card">
            <h2 className="text-2xl font-bold text-quantum-cyan mb-6">Your cart is empty</h2>
            <p className="text-gray-300 mb-6">Please add some meals to your cart before checkout.</p>
            <Button className="cyber-button" onClick={() => navigate('/customer')}>
              Browse Meals
            </Button>
          </Card>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-24 pb-12 container mx-auto px-4">
        <h1 className="text-4xl font-bold text-quantum-cyan mb-8 neon-text">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CheckoutAuthForm 
              onSubmit={handleAuthSubmit}
              email={loggedInUser?.email}
              showPassword={!loggedInUser && !hasDeliveryInfo}
            />
            
            <DeliveryForm
              onSubmit={handleSubmit}
              defaultValues={defaultValues}
              isSubmitting={isSubmitting}
            />
          </div>
          
          <div>
            <OrderSummary />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Checkout;
