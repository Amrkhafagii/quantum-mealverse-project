
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNutritionCart } from '@/contexts/NutritionCartContext';
import { useCart } from '@/contexts/CartContext';
import { CartConversionService } from '@/services/cart/cartConversionService';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, ArrowRight, ShoppingCart } from 'lucide-react';

interface CartConversionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CartConversionModal: React.FC<CartConversionModalProps> = ({ open, onOpenChange }) => {
  const { items: nutritionItems } = useNutritionCart();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isConverting, setIsConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState<any>(null);

  const handleConversion = async () => {
    if (nutritionItems.length === 0) {
      toast({
        title: "No items to convert",
        description: "Your nutrition plan is empty",
        variant: "destructive"
      });
      return;
    }

    setIsConverting(true);
    try {
      const result = await CartConversionService.convertNutritionToRestaurant(nutritionItems);
      setConversionResult(result);
      
      if (result.converted.length > 0) {
        toast({
          title: "Conversion successful!",
          description: `${result.converted.length} items can be ordered from restaurants`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        title: "Conversion failed",
        description: "Unable to convert nutrition items to restaurant orders",
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleAddToRestaurantCart = async () => {
    if (!conversionResult?.converted) return;

    let addedCount = 0;
    for (const item of conversionResult.converted) {
      const success = await addToCart(item);
      if (success) addedCount++;
    }

    toast({
      title: "Items added to cart",
      description: `${addedCount} items added to your restaurant cart`,
      variant: "default"
    });

    onOpenChange(false);
  };

  const handleCreateMapping = async (nutritionItem: any, menuItem: any) => {
    try {
      await CartConversionService.createMapping(
        nutritionItem.name,
        menuItem.id,
        0.8, // similarity score
        0.9  // nutritional accuracy
      );
      
      toast({
        title: "Mapping created",
        description: `"${nutritionItem.name}" is now mapped to "${menuItem.name}"`,
        variant: "default"
      });
      
      // Refresh conversion
      handleConversion();
    } catch (error) {
      toast({
        title: "Error creating mapping",
        description: "Unable to create the mapping",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-quantum-cyan">Convert Nutrition Plan to Restaurant Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!conversionResult ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">
                Convert your nutrition plan items to restaurant menu items that you can order.
              </p>
              <Button 
                onClick={handleConversion}
                disabled={isConverting || nutritionItems.length === 0}
                className="bg-quantum-purple hover:bg-quantum-purple/90"
              >
                {isConverting ? "Converting..." : "Convert Nutrition Plan"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Successfully Converted Items */}
              {conversionResult.converted.length > 0 && (
                <Card className="bg-quantum-darkBlue/30 border-green-500/20">
                  <CardHeader className="flex flex-row items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-green-500">Available for Order ({conversionResult.converted.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {conversionResult.converted.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                          <div>
                            <h4 className="font-semibold text-white">{item.name}</h4>
                            <p className="text-sm text-gray-400">
                              ${item.price} • {item.calories} cal • Qty: {item.quantity}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-green-500" />
                        </div>
                      ))}
                      <Button 
                        onClick={handleAddToRestaurantCart}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add All to Restaurant Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Items with Suggestions */}
              {conversionResult.suggestions.length > 0 && (
                <Card className="bg-quantum-darkBlue/30 border-yellow-500/20">
                  <CardHeader className="flex flex-row items-center gap-2">
                    <ArrowRight className="h-5 w-5 text-yellow-500" />
                    <CardTitle className="text-yellow-500">Suggested Alternatives ({conversionResult.suggestions.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {conversionResult.suggestions.map((suggestion: any, index: number) => (
                        <div key={index} className="p-4 bg-yellow-500/10 rounded-lg">
                          <div className="mb-3">
                            <h4 className="font-semibold text-white">{suggestion.nutritionItem.name}</h4>
                            <p className="text-sm text-gray-400">
                              {suggestion.nutritionItem.calories} cal • {suggestion.nutritionItem.protein}g protein
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-yellow-500">Similar menu items:</p>
                            {suggestion.menuItems.slice(0, 3).map((menuItem: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-quantum-darkBlue/50 rounded">
                                <div>
                                  <span className="text-white">{menuItem.name}</span>
                                  <span className="text-gray-400 ml-2">${menuItem.price}</span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCreateMapping(suggestion.nutritionItem, menuItem)}
                                  className="border-quantum-cyan/30 text-quantum-cyan hover:bg-quantum-cyan/10"
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
                <Card className="bg-quantum-darkBlue/30 border-red-500/20">
                  <CardHeader className="flex flex-row items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <CardTitle className="text-red-500">Not Available ({conversionResult.notFound.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {conversionResult.notFound.map((item: any, index: number) => (
                        <div key={index} className="p-3 bg-red-500/10 rounded-lg">
                          <h4 className="font-semibold text-white">{item.name}</h4>
                          <p className="text-sm text-gray-400">
                            No similar menu items found in nearby restaurants
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3">
                <Button 
                  onClick={() => setConversionResult(null)}
                  variant="outline"
                  className="border-quantum-cyan/30 text-quantum-cyan hover:bg-quantum-cyan/10"
                >
                  Try Again
                </Button>
                <Button 
                  onClick={() => onOpenChange(false)}
                  variant="outline"
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
