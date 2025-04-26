
import { supabase } from '@/integrations/supabase/client';

export const createTestMenuItems = async (restaurantId: string) => {
  // Check if menu items already exist for this restaurant
  const { data: existingItems, error: checkError } = await supabase
    .from('menu_items')
    .select('count')
    .eq('restaurant_id', restaurantId);
  
  if (checkError) {
    console.error('Error checking for existing menu items:', checkError);
    return;
  }
  
  const count = existingItems && existingItems[0]?.count ? parseInt(existingItems[0].count.toString()) : 0;
  console.log(`Restaurant ${restaurantId} has ${count} menu items`);
  
  if (count > 0) {
    console.log(`Restaurant ${restaurantId} already has menu items - skipping creation`);
    return;
  }
  
  console.log(`Creating test menu items for restaurant ${restaurantId}`);
  
  // Sample menu items
  const menuItems = [
    {
      name: 'Veggie Buddha Bowl',
      description: 'Fresh, healthy, and sustainable - Dish #3',
      price: 16.99,
      category: 'Featured',
      is_available: true,
      preparation_time: 15,
      restaurant_id: restaurantId,
      image_url: 'https://picsum.photos/seed/buddha1/300/200',
      nutritional_info: {
        calories: 450,
        protein: 15,
        carbs: 65,
        fat: 12
      }
    },
    {
      name: 'Rainbow Vegetable Curry',
      description: 'Fresh, healthy, and sustainable - Dish #6',
      price: 19.99,
      category: 'Featured',
      is_available: true,
      preparation_time: 20,
      restaurant_id: restaurantId,
      image_url: 'https://picsum.photos/seed/curry1/300/200',
      nutritional_info: {
        calories: 520,
        protein: 12,
        carbs: 70,
        fat: 18
      }
    },
    {
      name: 'Green Goddess Bowl',
      description: 'Fresh, healthy, and sustainable - Dish #1',
      price: 14.99,
      category: 'Mains',
      is_available: true,
      preparation_time: 12,
      restaurant_id: restaurantId,
      image_url: 'https://picsum.photos/seed/goddess1/300/200',
      nutritional_info: {
        calories: 380,
        protein: 18,
        carbs: 55,
        fat: 10
      }
    },
    {
      name: 'Quinoa Power Salad',
      description: 'Fresh, healthy, and sustainable - Dish #2',
      price: 15.99,
      category: 'Specialties',
      is_available: true,
      preparation_time: 8,
      restaurant_id: restaurantId,
      image_url: 'https://picsum.photos/seed/quinoa1/300/200',
      nutritional_info: {
        calories: 320,
        protein: 14,
        carbs: 45,
        fat: 8
      }
    },
    {
      name: 'Harvest Grain Bowl',
      description: 'Fresh, healthy, and sustainable - Dish #5',
      price: 18.99,
      category: 'Specialties',
      is_available: true,
      preparation_time: 15,
      restaurant_id: restaurantId,
      image_url: 'https://picsum.photos/seed/grain1/300/200',
      nutritional_info: {
        calories: 480,
        protein: 16,
        carbs: 75,
        fat: 14
      }
    }
  ];
  
  // Insert test menu items
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .insert(menuItems)
      .select();
    
    if (error) {
      console.error('Error creating test menu items:', error);
      return;
    }
    
    console.log(`Created ${data?.length} test menu items for restaurant ${restaurantId}`);
  } catch (e) {
    console.error('Exception when creating test menu items:', e);
  }
};
