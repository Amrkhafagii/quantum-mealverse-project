
import React, { useState, useEffect } from 'react';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Search, Loader2, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { getMenuItems } from '@/services/restaurant/menuService';
import { MenuItem } from '@/types/menu'; // Import from menu.ts not restaurant.ts
import MenuItemCard from './MenuItemCard';
import AddMenuItemForm from './AddMenuItemForm';

export const MenuManagement = () => {
  const { restaurant } = useRestaurantAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (restaurant) {
      loadMenuItems();
    }
  }, [restaurant]);

  const loadMenuItems = async () => {
    if (!restaurant) return;
    
    try {
      setLoading(true);
      const items = await getMenuItems(restaurant.id);
      // Ensure all items have a description (required by MenuItem from menu.ts)
      const normalizedItems: MenuItem[] = items.map(item => ({
        ...item,
        description: item.description || '', // Ensure description is never undefined
        ingredients: item.ingredients || [],
        steps: item.steps || [],
        nutritional_info: item.nutritional_info || {}
      }));
      
      setMenuItems(normalizedItems);
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(items.map(item => item.category)));
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setIsAddingItem(true);
  };

  const handleAddItemCancel = () => {
    setIsAddingItem(false);
  };

  const handleItemAdded = () => {
    setIsAddingItem(false);
    loadMenuItems();
  };
  
  const handleItemUpdated = () => {
    loadMenuItems();
  };

  // Filter menu items based on search term and selected category
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (item.description?.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCategory = selectedCategory === null || item.category === selectedCategory;
    
    // For availability tab
    const matchesAvailability = 
      activeTab === 'all' || 
      (activeTab === 'available' && item.is_available) || 
      (activeTab === 'unavailable' && !item.is_available);
      
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-quantum-cyan">Menu Management</h1>
          <p className="text-gray-400">Manage your restaurant's menu items</p>
        </div>
        <Button onClick={handleAddItem} className="bg-quantum-cyan hover:bg-quantum-cyan/80">
          <PlusCircle className="mr-2 h-5 w-5" />
          Add Item
        </Button>
      </div>
      
      <Separator className="my-6" />

      {isAddingItem ? (
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader>
            <CardTitle>Add New Menu Item</CardTitle>
            <CardDescription>Enter the details for your new menu item</CardDescription>
          </CardHeader>
          <CardContent>
            <AddMenuItemForm 
              restaurantId={restaurant?.id || ''} 
              onCancel={handleAddItemCancel} 
              onSuccess={handleItemAdded}
              categories={categories}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search menu items..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="text-xs">
                <Filter className="mr-1 h-3 w-3" />
                Filter
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="available">Available</TabsTrigger>
              <TabsTrigger value="unavailable">Unavailable</TabsTrigger>
              
              {categories.length > 0 && categories.map(category => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  onClick={() => {
                    setSelectedCategory(prev => prev === category ? null : category);
                  }}
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map(item => (
                    <MenuItemCard 
                      key={item.id} 
                      item={item} 
                      onUpdate={handleItemUpdated}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-lg">No menu items found</p>
                  <p className="text-sm mt-2">
                    {searchTerm || selectedCategory ? 
                      "Try adjusting your search or filters" : 
                      "Add your first menu item to get started"}
                  </p>
                  <Button 
                    onClick={handleAddItem}
                    variant="outline" 
                    className="mt-4"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Your First Item
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default MenuManagement;
