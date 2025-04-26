
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
  
  if (existingItems && existingItems.length > 0) {
    console.log(`Restaurant ${restaurantId} already has menu items`);
    return;
  }
  
  // Sample menu items
  const menuItems = [
    {
      name: 'Classic Burger',
      description: 'Juicy beef patty with lettuce, tomato, and cheese',
      price: 12.99,
      category: 'Main',
      is_available: true,
      preparation_time: 15,
      restaurant_id: restaurantId,
      image_url: 'https://picsum.photos/seed/burger1/300/200',
      nutritional_info: {
        calories: 650,
        protein: 35,
        carbs: 40,
        fat: 30
      }
    },
    {
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with Caesar dressing and croutons',
      price: 9.99,
      category: 'Starter',
      is_available: true,
      preparation_time: 10,
      restaurant_id: restaurantId,
      image_url: 'https://picsum.photos/seed/salad1/300/200',
      nutritional_info: {
        calories: 320,
        protein: 12,
        carbs: 15,
        fat: 24
      }
    },
    {
      name: 'Chocolate Brownie',
      description: 'Rich chocolate brownie with vanilla ice cream',
      price: 7.99,
      category: 'Dessert',
      is_available: true,
      preparation_time: 5,
      restaurant_id: restaurantId,
      image_url: 'https://picsum.photos/seed/brownie1/300/200',
      nutritional_info: {
        calories: 450,
        protein: 5,
        carbs: 60,
        fat: 20
      }
    }
  ];
  
  // Insert test menu items
  const { data, error } = await supabase
    .from('menu_items')
    .insert(menuItems)
    .select();
  
  if (error) {
    console.error('Error creating test menu items:', error);
    return;
  }
  
  console.log(`Created ${data?.length} test menu items for restaurant ${restaurantId}`);
};
