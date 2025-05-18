
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, RotateCcw } from 'lucide-react';
import MealViewer from '@/components/MealViewer';
import { MealType } from '@/types/meal';

const ARViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cameraActive, setCameraActive] = useState(false);
  
  const { data: meal, isLoading } = useQuery({
    queryKey: ['mealARView', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data as MealType;
    }
  });
  
  useEffect(() => {
    // Request device orientation permissions (for AR-like experience)
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission();
    }
    
    // Request camera permission if supported
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => {
          // Permission granted but we won't actually use the camera here
          // This is just for demonstration purposes
        })
        .catch(err => {
          console.log("Camera permission denied or error: ", err);
        });
    }
  }, []);
  
  const toggleCamera = () => {
    setCameraActive(!cameraActive);
  };
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-quantum-black text-white flex flex-col items-center justify-center">
        <div className="animate-pulse text-2xl text-quantum-cyan">Loading AR Experience...</div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-quantum-black text-white">
      {/* Camera background (simulated) */}
      {cameraActive && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50" 
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1517984055078-f8a66d4a3925?auto=format&fit=crop&q=80&w=1000')`,
            filter: 'blur(1px)'
          }}
        />
      )}
      
      {/* AR content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Top bar */}
        <div className="bg-quantum-darkBlue/70 p-4 flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="text-white"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="text-quantum-cyan font-semibold">
            AR View: {meal?.name || 'Meal'}
          </div>
          <Button 
            variant="ghost" 
            onClick={toggleCamera} 
            className={`text-white ${cameraActive ? 'bg-quantum-purple/50' : ''}`}
          >
            <Camera className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <MealViewer 
              className="w-full h-96" 
              selectedMealId={typeof id === 'string' ? parseInt(id) : id} 
            />
          </div>
        </div>
        
        {/* Bottom controls */}
        <div className="bg-quantum-darkBlue/70 p-4 flex justify-center">
          <div className="space-x-4">
            <Button className="bg-quantum-purple hover:bg-quantum-darkPurple">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Position
            </Button>
            <Button variant="outline">
              Take Photo
            </Button>
          </div>
        </div>
      </div>
      
      {/* AR instructions overlay */}
      {cameraActive && (
        <div className="absolute bottom-24 left-0 right-0 text-center text-white text-sm bg-quantum-darkBlue/70 py-2">
          Move your phone to scan surfaces. Tap to place the meal.
        </div>
      )}
    </div>
  );
};

export default ARViewPage;
