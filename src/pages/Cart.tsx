
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from '@/contexts/CartContext';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCheckout = () => {
    toast({
      title: "Checkout",
      description: "Checkout functionality will be implemented soon!",
    });
    // In a real application, navigate to checkout page
    // navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-24 pb-12 container mx-auto px-4">
        <h1 className="text-4xl font-bold text-quantum-cyan mb-8 neon-text">Your Cart</h1>
        
        {items.length === 0 ? (
          <Card className="p-8 text-center holographic-card">
            <h2 className="text-2xl font-bold text-quantum-cyan mb-4">Your cart is empty</h2>
            <p className="text-gray-300 mb-6">Discover our delicious quantum meals and add them to your cart!</p>
            <Link to="/customer">
              <Button className="cyber-button">
                Browse Meals
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="holographic-card p-4">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.meal.id} className="flex flex-col sm:flex-row gap-4 p-4 border-b border-quantum-cyan/20">
                      <div className="w-full sm:w-24 h-24">
                        <img 
                          src={item.meal.image_url} 
                          alt={item.meal.name}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-quantum-cyan">{item.meal.name}</h3>
                        <p className="text-sm text-gray-300 line-clamp-1">{item.meal.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-galaxy-purple">{(item.meal.price * 50).toFixed(2)} EGP</span>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8 rounded-full" 
                              onClick={() => updateQuantity(item.meal.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8 rounded-full" 
                              onClick={() => updateQuantity(item.meal.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => removeFromCart(item.meal.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between">
                  <Button 
                    variant="outline" 
                    className="text-red-500 border-red-500 hover:bg-red-500/10"
                    onClick={() => {
                      if (confirm('Are you sure you want to clear your cart?')) {
                        clearCart();
                      }
                    }}
                  >
                    Clear Cart
                  </Button>
                  <Link to="/customer">
                    <Button variant="outline">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
            
            <div>
              <Card className="holographic-card p-6">
                <h2 className="text-xl font-bold text-quantum-cyan mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{totalAmount.toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>25.00 EGP</span>
                  </div>
                  <div className="border-t border-quantum-cyan/20 pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-quantum-cyan">{(totalAmount + 25).toFixed(2)} EGP</span>
                    </div>
                  </div>
                </div>
                <Button 
                  className="cyber-button w-full flex gap-2 items-center justify-center"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Card>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Cart;
