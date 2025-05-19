import React, { useState, useEffect, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { CustomerMealCard } from '@/components/CustomerMealCard';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { MealType } from '@/types/meal';
import { useNearestRestaurant } from '@/hooks/useNearestRestaurant';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, Filter, SlidersHorizontal, Search } from 'lucide-react';
import { getMenuItems } from '@/services/restaurant/menuService';
import { createTestMenuItems } from '@/utils/createTestMenuItems';
import DietaryFilters, { DietaryFilterOption, DIETARY_TAGS } from '@/components/filters/DietaryFilters';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorBoundary from '@/components/ErrorBoundary';
import MapViewToggle from '@/components/location/MapViewToggle';
import LocationStatusIndicator from '@/components/location/LocationStatusIndicator';
import LocationStateManager from '@/components/location/LocationStateManager';

// Lazy load the map component
const RestaurantMapView = React.lazy(() => 
  import('@/components/location/RestaurantMapView')
);

type SortOption = 'price-asc' | 'price-desc' | 'rating-desc' | 'calories-asc';

const Customer = () => {
  const { location, permissionStatus, requestPermission } = useLocationPermission();
  const [isMapView, setIsMapView] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('rating-desc');
  const [dietaryFilters, setDietaryFilters] = useState<DietaryFilterOption[]>(
    DIETARY_TAGS.map(tag => ({ id: tag.id, name: tag.name, active: false }))
  );
  const [manualLocationInput, setManualLocationInput] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const activeFiltersCount = dietaryFilters.filter(f => f.active).length;

  // Use our enhanced nearest restaurant hook
  const { 
    nearbyRestaurants, 
    loading: loadingRestaurants,
    findNearestRestaurants 
  } = useNearestRestaurant();
  
  // Check if user was redirected from restaurant menu and navigate back there if needed
  useEffect(() => {
    const restaurantData = sessionStorage.getItem('selectedRestaurant');
    const shouldAutoNavigate = localStorage.getItem('autoNavigateToMenu') === 'true';
    
    if (restaurantData && shouldAutoNavigate) {
      try {
        const parsedData = JSON.parse(restaurantData);
        // Clear the flag to prevent loops
        localStorage.setItem('autoNavigateToMenu', 'false');
      } catch (error) {
        console.error('Error parsing stored restaurant data:', error);
      }
    }
  }, []);

  React.useEffect(() => {
    const checkForMenuItems = async () => {
      try {
        if (nearbyRestaurants.length === 0) {
          console.log('No nearby restaurants found yet');
          return;
        }
        
        console.log('Checking menu items for restaurants:', nearbyRestaurants);
        
        const restaurantIds = nearbyRestaurants.map(r => r.restaurant_id);
        
        for (const restaurantId of restaurantIds) {
          const { data, error } = await supabase
            .from('menu_items')
            .select('count')
            .eq('restaurant_id', restaurantId);
          
          if (error) {
            console.error(`Error checking menu items for restaurant ${restaurantId}:`, error);
            continue;
          }
          
          const count = data && data[0]?.count ? parseInt(data[0].count as unknown as string) : 0;
          console.log(`Restaurant ${restaurantId} has ${count} menu items`);
          
          if (count === 0) {
            console.log(`Creating test menu items for restaurant ${restaurantId}`);
            await createTestMenuItems(restaurantId);
          }
        }
      } catch (err) {
        console.error('Unexpected error checking menu items:', err);
      }
    };
    
    if (nearbyRestaurants.length > 0) {
      checkForMenuItems();
    }
  }, [nearbyRestaurants]);

  const { data: menuItems, isLoading: loadingMenuItems, error } = useQuery({
    queryKey: ['menuItems', nearbyRestaurants, searchTerm, sortBy, dietaryFilters],
    queryFn: async () => {
      if (!nearbyRestaurants.length) return [];
      
      console.log('Finding menu items for restaurants:', nearbyRestaurants);
      
      const restaurantIds = nearbyRestaurants.map(restaurant => restaurant.restaurant_id);
      console.log('Restaurant IDs:', restaurantIds);
      
      const items = await getMenuItems(restaurantIds as unknown as string, undefined, true);
      console.log('Menu items fetched using service:', items?.length, items);
      
      // Transform menu items to MealType
      let transformedItems = items?.map(item => {
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

        // Generate mock dietary tags for demonstration (would come from database in real app)
        const mockDietaryTags = [];
        if (item.id.charCodeAt(0) % 2 === 0) mockDietaryTags.push('vegetarian');
        if (item.id.charCodeAt(1) % 3 === 0) mockDietaryTags.push('gluten-free');
        if (item.id.charCodeAt(2) % 4 === 0) mockDietaryTags.push('dairy-free');
        if (item.id.charCodeAt(3) % 5 === 0) mockDietaryTags.push('vegan');
        if (item.id.charCodeAt(4) % 6 === 0) mockDietaryTags.push('keto');
        if (item.id.charCodeAt(5) % 7 === 0) mockDietaryTags.push('high-protein');

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
      
      // Apply search filter
      if (searchTerm.trim()) {
        const search = searchTerm.toLowerCase();
        transformedItems = transformedItems.filter(item =>
          item.name.toLowerCase().includes(search) || 
          (item.description && item.description.toLowerCase().includes(search))
        );
      }

      // Apply dietary filters
      const activeFilters = dietaryFilters.filter(f => f.active).map(f => f.id);
      if (activeFilters.length > 0) {
        transformedItems = transformedItems.filter(item =>
          item.dietary_tags && 
          activeFilters.every(filter => item.dietary_tags!.includes(filter))
        );
      }
      
      // Apply sorting
      switch (sortBy) {
        case 'price-asc':
          transformedItems.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          transformedItems.sort((a, b) => b.price - a.price);
          break;
        case 'calories-asc':
          transformedItems.sort((a, b) => a.calories - b.calories);
          break;
        case 'rating-desc':
        default:
          // For proper rating we'd fetch ratings for these items
          // For now, use a random sort to simulate
          transformedItems.sort(() => Math.random() - 0.5);
          break;
      }

      return transformedItems;
    },
    enabled: nearbyRestaurants.length > 0
  });

  const handleFilterChange = (newFilters: DietaryFilterOption[]) => {
    setDietaryFilters(newFilters);
  };
  
  const handleLocationUpdate = (loc: { latitude: number; longitude: number }) => {
    // This will be called by LocationStateManager when location is updated
    // We can use this to refresh restaurants or perform other actions
    if (loc) {
      findNearestRestaurants();
      // Set the flag to auto-navigate to menu when location is first acquired
      localStorage.setItem('autoNavigateToMenu', 'true');
    }
  };
  
  const toggleMapView = () => {
    setIsMapView(prev => !prev);
    // Show appropriate toast message
    if (!isMapView) {
      toast("Switching to map view", { 
        icon: "🗺️"
      });
    } else {
      toast("Switching to list view", { 
        icon: "📋"
      });
    }
  };

  // Generate appropriate loading UI for LocationStateManager
  const loadingUI = (
    <div className="space-y-6">
      <div className="mb-8">
        <Skeleton className="h-10 w-64 bg-quantum-darkBlue/70 mb-4" />
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-40 bg-quantum-darkBlue/70" />
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-quantum-darkBlue/30 rounded-lg overflow-hidden">
            <Skeleton className="h-48 bg-quantum-darkBlue/50" />
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 bg-quantum-darkBlue/70 mb-3" />
              <Skeleton className="h-4 w-1/2 bg-quantum-darkBlue/70 mb-2" />
              <Skeleton className="h-4 w-5/6 bg-quantum-darkBlue/70" />
              <div className="flex justify-between mt-4">
                <Skeleton className="h-8 w-16 bg-quantum-darkBlue/70" />
                <Skeleton className="h-8 w-24 bg-quantum-darkBlue/70" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <motion.h1 
              className="text-4xl font-bold text-quantum-cyan neon-text"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Quantum Meals
            </motion.h1>
            
            {permissionStatus === 'granted' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  <LocationStatusIndicator showTooltip={true} />
                  <MapViewToggle isMapView={isMapView} onToggle={toggleMapView} />
                </div>
              </motion.div>
            )}
          </div>
          
          <ErrorBoundary>
            <LocationStateManager 
              onLocationUpdate={handleLocationUpdate}
              loadingContent={loadingUI}
              showLoadingState
              autoNavigateToMenu={true}
              forcePrompt={false} // Explicitly set to false to prevent re-showing the prompt
            >
              {/* Content once location is acquired */}
              <div>
                {/* Restaurant summary section */}
                {nearbyRestaurants.length > 0 && (
                  <motion.div 
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h2 className="text-2xl font-semibold mb-4 text-quantum-purple">
                      {nearbyRestaurants.length} {nearbyRestaurants.length === 1 ? 'Restaurant' : 'Restaurants'} Found Nearby
                    </h2>
                    <div className="flex flex-wrap gap-4">
                      {nearbyRestaurants.map((restaurant, index) => (
                        <motion.div 
                          key={restaurant.restaurant_id} 
                          className="bg-quantum-darkBlue/70 rounded-lg p-3 inline-flex items-center"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ scale: 1.05, backgroundColor: 'rgba(108, 92, 231, 0.2)' }}
                        >
                          <span className="text-quantum-cyan mr-2">{restaurant.restaurant_name}</span>
                          <span className="text-xs text-gray-400">{restaurant.distance_km.toFixed(2)} km away</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Search, filter and sort controls */}
                <motion.div 
                  className="flex flex-col md:flex-row gap-4 mb-6 items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div className={`relative flex-1 transition-all duration-300 ${isSearchFocused ? 'ring-2 ring-quantum-cyan/40 rounded-lg' : ''}`}>
                    <Input 
                      type="text"
                      placeholder="Search meals..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-quantum-darkBlue/30 border-quantum-cyan/30 focus:border-quantum-cyan/60 pr-10"
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                    />
                    <div className="absolute right-3 top-2.5 text-gray-400">
                      <Search className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="flex gap-4 w-full md:w-auto">
                    <DietaryFilters 
                      filters={dietaryFilters} 
                      onFilterChange={handleFilterChange} 
                      activeCount={activeFiltersCount} 
                    />

                    <Select
                      value={sortBy}
                      onValueChange={(value) => setSortBy(value as SortOption)}
                    >
                      <SelectTrigger className="bg-quantum-darkBlue/30 border-quantum-cyan/30 w-[180px]">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent className="bg-quantum-darkBlue border-quantum-cyan/30">
                        <SelectItem value="rating-desc">Top Rated</SelectItem>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                        <SelectItem value="calories-asc">Lowest Calories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
                
                {/* Toggle between map and list views */}
                <AnimatePresence mode="wait">
                  {isMapView ? (
                    <motion.div
                      key="map-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="min-h-[500px] rounded-lg overflow-hidden mb-8"
                    >
                      <ErrorBoundary fallback={
                        <div className="flex flex-col items-center justify-center min-h-[400px] bg-quantum-darkBlue/30 rounded-lg p-6">
                          <p className="text-lg mb-4">Map view could not be loaded</p>
                          <Button onClick={toggleMapView}>Switch to List View</Button>
                        </div>
                      }>
                        <Suspense fallback={
                          <div className="flex flex-col items-center justify-center min-h-[400px] bg-quantum-darkBlue/30 rounded-lg">
                            <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan mb-4" />
                            <p>Loading map view...</p>
                          </div>
                        }>
                          <RestaurantMapView 
                            restaurants={nearbyRestaurants}
                          />
                        </Suspense>
                      </ErrorBoundary>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="list-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {menuItems?.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-xl mb-4">No menu items available from nearby restaurants</p>
                          <p className="text-gray-400 mb-6">Try updating your location or check back later</p>
                          <Button
                            onClick={() => requestPermission()}
                            className="bg-quantum-cyan hover:bg-quantum-cyan/90"
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            Update Location
                          </Button>
                        </div>
                      ) : (
                        <>
                          {activeFiltersCount > 0 && (
                            <p className="mb-4 text-sm text-gray-400">
                              {`Showing ${menuItems?.length} meals matching your dietary preferences`}
                            </p>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {menuItems?.map((item: MealType, index) => (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                              >
                                <CustomerMealCard meal={item} />
                              </motion.div>
                            ))}
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </LocationStateManager>
          </ErrorBoundary>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Customer;
