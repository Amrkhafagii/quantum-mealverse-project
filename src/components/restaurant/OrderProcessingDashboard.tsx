
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, CheckCircle, XCircle, AlertTriangle, ChefHat } from 'lucide-react';
import { ComplexMealOrderService, IngredientAvailabilityCheck, PreparationInstruction, OrderComplexityAnalysis } from '@/services/orderProcessing/complexMealOrderService';

interface OrderProcessingDashboardProps {
  orderId: string;
  restaurantId: string;
  mealIds: string[];
  onOrderProcessed?: (canFulfill: boolean) => void;
}

export const OrderProcessingDashboard: React.FC<OrderProcessingDashboardProps> = ({
  orderId,
  restaurantId,
  mealIds,
  onOrderProcessed
}) => {
  const [loading, setLoading] = useState(false);
  const [availabilityChecks, setAvailabilityChecks] = useState<IngredientAvailabilityCheck[]>([]);
  const [cookingInstructions, setCookingInstructions] = useState<PreparationInstruction[]>([]);
  const [complexityAnalysis, setComplexityAnalysis] = useState<OrderComplexityAnalysis | null>(null);
  const [canFulfill, setCanFulfill] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processOrder = async () => {
    if (!orderId || !restaurantId || mealIds.length === 0) {
      setError('Missing required order information');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await ComplexMealOrderService.processComplexMealOrder(
        orderId,
        restaurantId,
        mealIds
      );

      setAvailabilityChecks(result.availabilityChecks);
      setCookingInstructions(result.cookingInstructions);
      setComplexityAnalysis(result.complexityAnalysis);
      setCanFulfill(result.canFulfill);

      onOrderProcessed?.(result.canFulfill);
    } catch (err) {
      console.error('Error processing order:', err);
      setError('Failed to process order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId && restaurantId && mealIds.length > 0) {
      processOrder();
    }
  }, [orderId, restaurantId, mealIds]);

  const getComplexityBadgeColor = (level: string) => {
    switch (level) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInstructionTypeIcon = (type: string) => {
    switch (type) {
      case 'cooking': return <ChefHat className="h-4 w-4" />;
      case 'dietary': return <AlertTriangle className="h-4 w-4" />;
      case 'special': return <XCircle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Processing complex meal order...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={processOrder} className="mt-4">
            Retry Processing
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Order Processing Status
            {canFulfill !== null && (
              canFulfill ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {canFulfill !== null && (
            <Alert variant={canFulfill ? "default" : "destructive"}>
              <AlertDescription>
                {canFulfill 
                  ? "All ingredients are available. Order can be fulfilled."
                  : "Some ingredients are unavailable. Order requires attention."
                }
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Complexity Analysis */}
      {complexityAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Order Complexity Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{complexityAnalysis.simple_meals}</div>
                <div className="text-sm text-gray-600">Simple Meals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{complexityAnalysis.moderate_meals}</div>
                <div className="text-sm text-gray-600">Moderate Meals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{complexityAnalysis.complex_meals}</div>
                <div className="text-sm text-gray-600">Complex Meals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{complexityAnalysis.total_preparation_time}min</div>
                <div className="text-sm text-gray-600">Est. Time</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-purple-100 text-purple-800">
                Complexity Score: {complexityAnalysis.complexity_score}
              </Badge>
              {complexityAnalysis.requires_chef_attention && (
                <Badge variant="destructive">
                  Requires Chef Attention
                </Badge>
              )}
            </div>

            {complexityAnalysis.estimated_completion_time && (
              <div className="text-sm text-gray-600">
                Estimated completion: {new Date(complexityAnalysis.estimated_completion_time).toLocaleTimeString()}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ingredient Availability */}
      <Card>
        <CardHeader>
          <CardTitle>Ingredient Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availabilityChecks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{check.ingredient_name}</div>
                  <div className="text-sm text-gray-600">
                    Required: {check.required_quantity} | Available: {check.available_quantity}
                  </div>
                  {check.notes && (
                    <div className="text-sm text-red-600 mt-1">{check.notes}</div>
                  )}
                </div>
                <Badge variant={check.is_sufficient ? "default" : "destructive"}>
                  {check.is_sufficient ? "Available" : "Insufficient"}
                </Badge>
              </div>
            ))}
            {availabilityChecks.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No ingredient checks available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cooking Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Preparation Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cookingInstructions
              .sort((a, b) => b.priority_level - a.priority_level)
              .map((instruction, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getInstructionTypeIcon(instruction.instruction_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getComplexityBadgeColor(instruction.instruction_type)}>
                        {instruction.instruction_type}
                      </Badge>
                      <Badge variant="outline">
                        Priority {instruction.priority_level}
                      </Badge>
                      {instruction.estimated_time_minutes && (
                        <Badge variant="outline">
                          {instruction.estimated_time_minutes}min
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm mb-1">{instruction.instruction_text}</div>
                    {instruction.chef_notes && (
                      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        Chef Notes: {instruction.chef_notes}
                      </div>
                    )}
                    {instruction.equipment_needed.length > 0 && (
                      <div className="text-xs text-gray-600 mt-1">
                        Equipment: {instruction.equipment_needed.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            {cookingInstructions.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No cooking instructions generated
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
