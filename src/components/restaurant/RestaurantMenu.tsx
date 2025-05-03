
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getMenuItems } from '@/services/restaurant/menuService';
import { Button } from '@/components/ui/button';
import { CustomerMealCard } from '@/components/CustomerMealCard';
import { Skeleton } from '@/components/ui/skeleton';
import { MealType } from '@/types/meal';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface RestaurantData {
  restaurant_id: string;
  restaurant_name: string;
  restaurant_address: string;
  restaurant_email: string | null;
  distance_km: number;
}

const RestaurantMenu = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'menu';
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [menuItems, setMenuItems] = useState<MealType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(null);
  
  useEffect(() => {
    // Try to get restaurant data from session storage
    const storedRestaurant = sessionStorage.getItem('selectedRestaurant');
    if (storedRestaurant) {
      try {
        const parsedData = JSON.parse(storedRestaurant);
        setRestaurantData(parsedData);
      } catch (error) {
        console.error('Error parsing stored restaurant data:', error);
      }
    }
  }, []);
  
  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const items = await getMenuItems(id, undefined, true);
        
        // Transform to MealType format
        const transformedItems = items?.map(item => {
          let nutritionalInfo = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          };
          
          try {
            if (item.nutritional_info && 
                typeof item.nutritional_info === 'object' && 
                !Array.isArray(item.nutritional_info)) {
              nutritionalInfo = {
                calories: Number(item.nutritional_info.calories) || 0,
                protein: Number(item.nutritional_info.protein) || 0,
                carbs: Number(item.nutritional_info.carbs) || 0,
                fat: Number(item.nutritional_info.fat) || 0
              };
            }
          } catch (e) {
            console.error("Error parsing nutritional info:", e);
          }

          // Generate mock dietary tags for demonstration
          const mockDietaryTags = [];
          if (item.id.charCodeAt(0) % 2 === 0) mockDietaryTags.push('vegetarian');
          if (item.id.charCodeAt(1) % 3 === 0) mockDietaryTags.push('gluten-free');
          if (item.id.charCodeAt(2) % 4 === 0) mockDietaryTags.push('dairy-free');

          return {
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: item.price,
            calories: nutritionalInfo.calories,
            protein: nutritionalInfo.protein,
            carbs: nutritionalInfo.carbs,
            fat: nutritionalInfo.fat,
            image_url: item.image_url || `https://picsum.photos/seed/${item.id}/300/200`,
            is_active: item.is_available,
            restaurant_id: item.restaurant_id,
            created_at: item.created_at,
            updated_at: item.updated_at,
            dietary_tags: mockDietaryTags
          } as MealType;
        }) || [];
        
        setMenuItems(transformedItems);
      } catch (error) {
        console.error('Error fetching menu items:', error);
        toast({
          title: "Error",
          description: "Failed to load menu items",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMenuItems();
  }, [id, toast]);
  
  const backToCustomerView = () => {
    navigate('/customer');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={backToCustomerView}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to restaurant list
        </Button>
        
        {restaurantData && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-quantum-cyan">{restaurantData.restaurant_name}</h1>
            <div className="flex items-center text-gray-400 mt-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{restaurantData.restaurant_address}</span>
              <span className="ml-2 text-sm">({restaurantData.distance_km.toFixed(2)} km away)</span>
            </div>
          </div>
        )}
        
        {activeTab === 'menu' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-quantum-purple">Menu</h2>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-quantum-darkBlue/30 rounded-lg overflow-hidden">
                    <Skeleton className="h-48 bg-quantum-darkBlue/50" />
                    <div className="p-4">
                      <Skeleton className="h-6 w-3/4 bg-quantum-darkBlue/70 mb-3" />
                      <Skeleton className="h-4 w-1/2 bg-quantum-darkBlue/70 mb-2" />
                      <Skeleton className="h-4 w-5/6 bg-quantum-darkBlue/70" />
                    </div>
                  </div>
                ))}
              </div>
            ) : menuItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {menuItems.map((meal) => (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CustomerMealCard meal={meal} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl mb-2">No menu items available</p>
                <p className="text-gray-400">This restaurant hasn't added any items to their menu yet.</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RestaurantMenu;
