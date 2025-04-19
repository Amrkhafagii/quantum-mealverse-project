
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from '@/contexts/CartContext';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

// Define form schema using zod
const formSchema = z.object({
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(11, { message: "Please enter a valid phone number" }),
  address: z.string().min(10, { message: "Address must be at least 10 characters" }),
  city: z.string().min(2, { message: "Please enter a valid city" }),
  notes: z.string().optional(),
  deliveryMethod: z.enum(["delivery", "pickup"]),
  paymentMethod: z.enum(["cash", "visa"]),
})

type CheckoutFormValues = z.infer<typeof formSchema>

// Define types for profiles
interface Profile {
  id: string;
  full_name?: string;
  phone?: string;
  address?: string;
  city?: string;
}

// Define types for orders
interface Order {
  id: string;
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

  // Initialize form
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      notes: "",
      deliveryMethod: "delivery",
      paymentMethod: "cash",
    },
  })

  // Check if user is logged in
  React.useEffect(() => {
    const checkLoginStatus = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        // User is logged in, get their profile data
        const { data: userData } = await supabase.auth.getUser();
        setLoggedInUser(userData.user);
        
        // Try to get profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.user?.id)
          .single();
          
        // Pre-fill form data if profile exists
        if (profileData) {
          form.reset({
            fullName: profileData.full_name || "",
            email: userData.user?.email || "",
            phone: profileData.phone || "",
            address: profileData.address || "",
            city: profileData.city || "",
            notes: "",
            deliveryMethod: "delivery",
            paymentMethod: "cash",
          });
        } else if (userData.user) {
          form.setValue('email', userData.user.email || "");
        }
      }
    };
    
    checkLoginStatus();
  }, []);

  const deliveryFee = form.watch("deliveryMethod") === "delivery" ? 50 : 0;
  const finalTotal = totalAmount + deliveryFee;

  async function onSubmit(data: CheckoutFormValues) {
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
      let userId = loggedInUser?.id;
      
      // If user is not logged in, create a new user account
      if (!userId) {
        // Only create account if payment method is visa (for future)
        if (data.paymentMethod === "visa") {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: Math.random().toString(36).slice(-10) // Generate random password
          });
          
          if (authError) throw authError;
          userId = authData.user?.id;
          
          // Create profile
          if (userId) {
            await supabase
              .from('profiles')
              .insert({
                id: userId,
                full_name: data.fullName,
                phone: data.phone,
                address: data.address,
                city: data.city,
              });
          }
        }
      }
      
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
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
        })
        .select();
        
      if (orderError) throw orderError;
      
      // Get the order ID
      const orderId = orderData[0].id;
      
      // Create order items
      const orderItems = items.map(item => ({
        order_id: orderId,
        meal_id: item.meal.id,
        quantity: item.quantity,
        price: item.meal.price,
        name: item.meal.name
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
        
      if (itemsError) throw itemsError;
      
      // Success
      toast({
        title: "Order placed successfully",
        description: `Your order #${orderId} has been placed successfully`,
      });
      
      // Clear cart and redirect to thank you page
      clearCart();
      navigate(`/thank-you?order=${orderId}`);
    } catch (error: any) {
      toast({
        title: "Error placing order",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Redirect to customer page if cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-quantum-black text-white relative">
        <ParticleBackground />
        <Navbar />
        
        <main className="relative z-10 pt-24 pb-12 container mx-auto px-4">
          <h1 className="text-4xl font-bold text-quantum-cyan mb-8 neon-text">Checkout</h1>
          
          <Card className="p-8 text-center holographic-card">
            <h2 className="text-2xl font-bold text-quantum-cyan mb-4">Your cart is empty</h2>
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
            <Card className="holographic-card p-6">
              <h2 className="text-xl font-bold text-quantum-cyan mb-4">Delivery Information</h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your delivery address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Any special instructions?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="deliveryMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Method</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select delivery method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="delivery">Home Delivery (+50 EGP)</SelectItem>
                              <SelectItem value="pickup">Pickup (Free)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash">Cash on Delivery</SelectItem>
                              <SelectItem value="visa" disabled>Credit Card (Coming Soon)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="cyber-button w-full py-6 text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "Place Order"}
                  </Button>
                </form>
              </Form>
            </Card>
          </div>
          
          <div>
            <Card className="holographic-card p-6 sticky top-24">
              <h2 className="text-xl font-bold text-quantum-cyan mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.meal.id} className="flex gap-2 border-b border-quantum-cyan/20 pb-2">
                    <div className="w-16 h-16">
                      <img 
                        src={item.meal.image_url || `https://picsum.photos/seed/${item.meal.id}/300/200`} 
                        alt={item.meal.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">{item.meal.name}</h3>
                        <span>{item.quantity} x {(item.meal.price * 50).toFixed(2)} EGP</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {item.meal.calories} kcal
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 border-t border-quantum-cyan/20 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{totalAmount.toFixed(2)} EGP</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee.toFixed(2)} EGP</span>
                </div>
                <div className="border-t border-quantum-cyan/20 pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-quantum-cyan">{finalTotal.toFixed(2)} EGP</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Checkout;
