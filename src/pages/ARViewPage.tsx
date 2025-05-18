
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useARPreview } from '@/hooks/useARPreview';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plane } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

// Update to define the MealType interface to match the meal data structure
interface MealType {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  preparation_time: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  is_available: boolean;
  is_active: boolean;
  category: string;
  restaurant_id: string;
  ingredients: string[];
  steps: string[];
  created_at: string;
  updated_at: string;
  nutritional_info: any;
}

const ARViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSupported, startARSession, loadModel, placeModel, isLoading, error, isActive } = useARPreview();
  const [meal, setMeal] = useState<MealType | null>(null);
  
  useEffect(() => {
    // This would typically fetch the meal data from an API
    // For now we'll use dummy data
    const dummyMeal = {
      id: id || '1',
      name: 'Quantum Burger',
      description: 'A delicious burger with quantum properties',
      price: 9.99,
      image_url: '/burger.jpg',
      preparation_time: 15,
      calories: 650,
      protein: 35,
      carbs: 45,
      fat: 25,
      is_available: true,
      is_active: true,
      category: 'Burgers',
      restaurant_id: 'rest123',
      ingredients: ['Quantum beef', 'Lettuce', 'Tomato', 'Special sauce'],
      steps: ['Prepare ingredients', 'Cook the patty', 'Assemble the burger'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      nutritional_info: { sodium: '500mg', cholesterol: '80mg' }
    };
    
    setMeal(dummyMeal as MealType);
  }, [id]);
  
  const handleStartAR = async () => {
    if (!isSupported) {
      toast({
        title: "AR Not Supported",
        description: "Your device doesn't support AR experiences.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const success = await startARSession({ planeDetection: true });
      if (success && meal) {
        // In a real app, this would be the URL to a 3D model of the meal
        const modelUrl = `https://example.com/models/${meal.id}.glb`;
        await loadModel({ modelUrl, scale: 1.0 });
        
        toast({
          title: "AR Session Started",
          description: "Tap on a surface to place the meal.",
        });
      }
    } catch (err) {
      console.error("Failed to start AR session:", err);
      toast({
        title: "AR Failed",
        description: "Failed to start AR session. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handlePlaceModel = async () => {
    try {
      await placeModel();
    } catch (err) {
      console.error("Failed to place model:", err);
      toast({
        title: "Placement Failed",
        description: "Failed to place the meal in AR. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* AR view will take the full screen */}
      <div className="flex-1 relative">
        {/* This div would be replaced by the native AR view */}
        <div className="absolute inset-0 flex items-center justify-center">
          {!isActive && (
            <div className="text-white text-center p-8">
              <h2 className="text-2xl font-bold mb-4">
                {meal ? `View ${meal.name} in AR` : 'Loading...'}
              </h2>
              <p className="mb-4">Experience the meal in augmented reality!</p>
              <Button 
                onClick={handleStartAR} 
                disabled={!isSupported || isLoading || !meal}
                size="lg"
              >
                Start AR Experience
              </Button>
              {error && (
                <p className="text-red-500 mt-4">{error}</p>
              )}
            </div>
          )}
          
          {isActive && (
            <div className="absolute bottom-10 left-0 right-0 flex justify-center">
              <Button onClick={handlePlaceModel} size="lg" className="bg-white/20 backdrop-blur-sm">
                <Plane className="mr-2 h-5 w-5" />
                Place on Surface
              </Button>
            </div>
          )}
        </div>
        
        {/* Back button */}
        <Button
          variant="ghost"
          className="absolute top-4 left-4 text-white bg-black/30 backdrop-blur-sm z-10"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
      </div>
    </div>
  );
};

export default ARViewPage;
