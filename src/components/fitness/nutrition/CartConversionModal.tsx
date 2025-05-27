
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check, X } from 'lucide-react';
import { useNutritionCart } from '@/contexts/NutritionCartContext';
import { useCart } from '@/contexts/CartContext';
import { CartConversionService } from '@/services/cart/cartConversionService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface CartConversionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CartConversionModal: React.FC<CartConversionModalProps> = ({ open, onOpenChange }) => {
  const [isConverting, setIsConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState<any>(null);
  const { items: nutritionItems } = useNutritionCart();
  const { addToCart, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleConvert = async () => {
    try {
      setIsConverting(true);
      const result = await CartConversionService.convertNutritionToRestaurant(nutritionItems);
      setConversionResult(result);
    } catch (error) {
      console.error('Error converting cart:', error);
      toast({
        title: "Conversion failed",
        description: "Unable to convert nutrition plan to restaurant order.",
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleAddToRestaurantCart = async () => {
    try {
      // Clear existing restaurant cart
      clearCart();
      
      // Add converted items to restaurant cart
      for (const item of conversionResult.converted) {
        await addToCart(item);
      }
      
      toast({
        title: "Items added to cart!",
        description: `${conversionResult.converted.length} items added to your restaurant cart.`,
        variant: "default"
      });
      
      // Close modal and navigate to cart
      onOpenChange(false);
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error adding items",
        description: "Some items could not be added to your cart.",
        variant: "destructive"
      });
    }
  };

  const handleCreateMapping = async (nutritionItem: any, menuItem: any) => {
    try {
      await CartConversionService.createMapping(
        nutritionItem.name,
        menuItem.id,
        menuItem.similarity_score,
        0.8 // Default nutritional accuracy
      );
      
      toast({
        title: "Mapping created",
        description: `${nutritionItem.name} is now mapped to ${menuItem.name}`,
        variant: "default"
      });
      
      // Refresh conversion
      await handleConvert();
    } catch (error) {
      console.error('Error creating mapping:', error);
      toast({
        title: "Mapping failed",
        description: "Unable to create item mapping.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-quantum-darkBlue border-quantum-cyan/20">
        <DialogHeader>
          <DialogTitle className="text-quantum-cyan">Convert Nutrition Plan to Restaurant Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!conversionResult ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">
                Convert your nutrition plan items to available restaurant menu items for ordering.
              </p>
              <Button 
                onClick={handleConvert}
                disabled={isConverting}
                className="bg-quantum-purple hover:bg-quantum-purple/90"
              >
                {isConverting ? 'Converting...' : 'Start Conversion'}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Successfully Converted Items */}
              {conversionResult.converted.length > 0 && (
                <Card className="bg-quantum-black/30 border-green-500/20">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                      <Check className="h-5 w-5" />
                      Ready to Order ({conversionResult.converted.length} items)
                    </h3>
                    <div className="space-y-3">
                      {conversionResult.converted.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-green-500/20 rounded">
                          <div>
                            <p className="font-medium text-white">{item.name}</p>
                            <p className="text-sm text-gray-400">${item.price} • {item.calories} cal</p>
                          </div>
                          <Badge className="bg-green-500/20 text-green-400">
                            Available
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <Button 
                      onClick={handleAddToRestaurantCart}
                      className="w-full mt-4 bg-green-600 hover:bg-green-700"
                    >
                      Add All to Restaurant Cart
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Items with Suggestions */}
              {conversionResult.suggestions.length > 0 && (
                <Card className="bg-quantum-black/30 border-yellow-500/20">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-yellow-400 mb-4">
                      Suggested Alternatives ({conversionResult.suggestions.length} items)
                    </h3>
                    <div className="space-y-4">
                      {conversionResult.suggestions.map((suggestion: any, index: number) => (
                        <div key={index} className="border border-yellow-500/20 rounded p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="font-medium text-white">{suggestion.nutritionItem.name}</span>
                            <ArrowRight className="h-4 w-4 text-yellow-400" />
                            <span className="text-yellow-400">Find Alternative</span>
                          </div>
                          <div className="space-y-2">
                            {suggestion.menuItems.map((menuItem: any, menuIndex: number) => (
                              <div key={menuIndex} className="flex items-center justify-between p-2 border border-gray-600 rounded">
                                <div>
                                  <p className="font-medium text-white">{menuItem.name}</p>
                                  <p className="text-sm text-gray-400">
                                    ${menuItem.price} • {menuItem.calories} cal • 
                                    {Math.round(menuItem.similarity_score * 100)}% match
                                  </p>
                                </div>
                                <Button 
                                  size="sm"
                                  onClick={() => handleCreateMapping(suggestion.nutritionItem, menuItem)}
                                  className="bg-quantum-purple hover:bg-quantum-purple/90"
                                >
                                  Use This
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Items Not Found */}
              {conversionResult.notFound.length > 0 && (
                <Card className="bg-quantum-black/30 border-red-500/20">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                      <X className="h-5 w-5" />
                      Not Available ({conversionResult.notFound.length} items)
                    </h3>
                    <div className="space-y-2">
                      {conversionResult.notFound.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-red-500/20 rounded">
                          <div>
                            <p className="font-medium text-white">{item.name}</p>
                            <p className="text-sm text-gray-400">{item.calories} cal • {item.meal_type}</p>
                          </div>
                          <Badge variant="destructive">
                            Not Available
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setConversionResult(null)}
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CartConversionModal;
