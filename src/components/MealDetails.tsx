
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useCart } from '@/contexts/CartContext';
import { MealType } from '@/types/meal';

interface MealDetailsProps {
  meal: MealType | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MealDetails: React.FC<MealDetailsProps> = ({ meal, isOpen, onClose }) => {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = React.useState(1);

  React.useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen]);

  if (!meal) return null;

  const handleAddToCart = () => {
    addToCart(meal, quantity);
    toast({
      title: "Added to cart",
      description: `${quantity} × ${meal.name} has been added to your cart.`,
      duration: 2000,
    });
    onClose();
  };

  const incrementQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, 10));
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-quantum-black text-white border border-quantum-cyan">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-quantum-cyan neon-text">{meal.name}</DialogTitle>
          <DialogDescription className="text-gray-300">
            Delicious and nutritious meal
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {meal.image_url ? (
              <div className="aspect-video overflow-hidden rounded-lg">
                <img 
                  src={meal.image_url} 
                  alt={meal.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-300">{meal.description}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Price:</span>
                <span className="text-xl font-bold text-quantum-cyan">{(meal.price * 50).toFixed(2)} EGP</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Calories:</span>
                <span>{meal.calories} kcal</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-sm text-center">
              <div className="p-2 rounded-md bg-quantum-black/50 border border-quantum-cyan/20">
                <p className="text-quantum-cyan">Protein</p>
                <p>{meal.protein}g</p>
              </div>
              <div className="p-2 rounded-md bg-quantum-black/50 border border-quantum-cyan/20">
                <p className="text-quantum-cyan">Carbs</p>
                <p>{meal.carbs}g</p>
              </div>
              <div className="p-2 rounded-md bg-quantum-black/50 border border-quantum-cyan/20">
                <p className="text-quantum-cyan">Fat</p>
                <p>{meal.fat}g</p>
              </div>
            </div>
            
            <div className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 bg-quantum-black/50 p-2 rounded-lg border border-quantum-cyan/20">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-quantum-cyan" 
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-6 text-center">{quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-quantum-cyan" 
                    onClick={incrementQuantity}
                    disabled={quantity >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-lg font-bold text-quantum-cyan">
                  Total: {((meal.price * quantity) * 50).toFixed(2)} EGP
                </div>
              </div>
              
              <Button 
                onClick={handleAddToCart}
                className="cyber-button w-full flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
