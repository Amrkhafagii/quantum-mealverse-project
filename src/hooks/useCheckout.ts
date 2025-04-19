import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { DeliveryFormValues } from '@/components/checkout/DeliveryForm';
import { Order } from '@/types/order';

export const useCheckout = () => {
  const { items, totalAmount, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [hasDeliveryInfo, setHasDeliveryInfo] = useState(false);
  const [defaultValues, setDefaultValues] = useState<Partial<DeliveryFormValues>>({});
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setLoggedInUser(session.user);
        
        const { data: deliveryInfo } = await supabase
          .from('delivery_info')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (deliveryInfo) {
          setHasDeliveryInfo(true);
          setDefaultValues({
            ...deliveryInfo,
            email: session.user.email || "",
            fullName: deliveryInfo.full_name,
          });
        } else if (session.user.email) {
          setDefaultValues({
            email: session.user.email
          });
        }
      } else {
        setShowLoginPrompt(true);
      }
    };
    
    checkLoginStatus();
  }, []);

  const handleAuthSubmit = async (data: { email: string; password: string }) => {
    try {
      if (!loggedInUser) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password
        });
        
        if (signInError) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password
          });
          
          if (signUpError) throw signUpError;
          
          toast({
            title: "Account created",
            description: "Please check your email to verify your account.",
          });
        } else {
          setLoggedInUser(signInData.user);
          setShowLoginPrompt(false);
          
          if (signInData.user) {
            const { data: deliveryInfo } = await supabase
              .from('delivery_info')
              .select('*')
              .eq('user_id', signInData.user.id)
              .maybeSingle();
              
            if (deliveryInfo) {
              setHasDeliveryInfo(true);
              setDefaultValues({
                ...deliveryInfo,
                email: signInData.user.email || "",
                fullName: deliveryInfo.full_name,
              });
            }
          }
          
          toast({
            title: "Login successful",
            description: "You've been logged in successfully.",
          });
        }
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

    if (data.deliveryMethod === 'delivery' && (data.latitude === 0 || data.longitude === 0)) {
      toast({
        title: "Location Required",
        description: "Please set your location for delivery",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (!loggedInUser?.id) {
        throw new Error("You must be logged in to place an order");
      }

      if (data.fullName && data.phone && data.address) {
        const deliveryInfoData = {
          user_id: loggedInUser.id,
          full_name: data.fullName,
          phone: data.phone,
          address: data.address,
          city: data.city
        };

        if (hasDeliveryInfo) {
          await supabase
            .from('delivery_info')
            .update(deliveryInfoData)
            .eq('user_id', loggedInUser.id);
        } else {
          await supabase
            .from('delivery_info')
            .insert(deliveryInfoData);
        }
      }

      const deliveryFee = data.deliveryMethod === "delivery" ? 50 : 0;
      const finalTotal = totalAmount + deliveryFee;
      
      const orderData: Omit<Order, 'id'> = {
        user_id: loggedInUser.id,
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
      
      if (data.latitude && data.longitude) {
        await supabase
          .from('user_locations')
          .insert({
            user_id: loggedInUser.id,
            latitude: data.latitude,
            longitude: data.longitude,
            source: 'checkout'
          });
      }
      
      toast({
        title: "Order placed successfully",
        description: `Your order #${insertedOrder.id} has been placed successfully`,
      });
      
      clearCart();
      navigate(`/thank-you?order=${insertedOrder.id}`);
    } catch (error: any) {
      console.error("Order submission error:", error);
      toast({
        title: "Error placing order",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    items,
    isSubmitting,
    loggedInUser,
    hasDeliveryInfo,
    defaultValues,
    showLoginPrompt,
    handleAuthSubmit,
    handleSubmit
  };
};
