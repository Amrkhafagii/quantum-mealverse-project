
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { MenuItemForm } from './MenuItemForm';
import { CategoryForm } from './CategoryForm';
import { MenuItemReviews } from './MenuItemReviews';
import { MenuItemsTable } from './MenuItemsTable';
import { CategoriesTable } from './CategoriesTable';
import { useMenuItems } from '@/hooks/menu/useMenuItems';
import { useCategories } from '@/hooks/menu/useCategories';
import { PlusCircle, RefreshCcw } from 'lucide-react';
import { MenuItem, MenuCategory } from '@/types/menu';

const INITIAL_MENU_ITEM: MenuItem = {
  id: '',
  restaurant_id: '',
  name: '',
  description: '',
  price: 0,
  category: '',
  is_available: true,
  preparation_time: 15,
  nutritional_info: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  },
  ingredients: [],
  steps: []
};

const INITIAL_CATEGORY: MenuCategory = {
  id: '',
  name: '',
  restaurant_id: '',
};

export const MenuManagement: React.FC = () => {
  const { restaurant } = useRestaurantAuth();
  const [activeTab, setActiveTab] = useState('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | undefined>();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [selectedItemForReview, setSelectedItemForReview] = useState<string | null>(null);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);

  const {
    menuItems,
    selectedItem,
    isLoading: isLoadingItems,
    fetchMenuItems,
    handleSaveMenuItem,
    handleDeleteMenuItem,
    editMenuItem,
    setSelectedItem
  } = useMenuItems(restaurant?.id || '');

  const {
    categories,
    selectedCategory,
    isLoading: isLoadingCategories,
    fetchCategories,
    handleSaveCategory,
    handleDeleteCategory,
    setSelectedCategory
  } = useCategories(restaurant?.id || '');

  useEffect(() => {
    if (restaurant?.id) {
      fetchMenuItems(selectedCategoryFilter);
      fetchCategories();
    }
  }, [restaurant?.id]);

  const filteredMenuItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (selectedCategoryFilter ? item.category === selectedCategoryFilter : true)
  );

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategoryFilterChange = (category?: string) => {
    setSelectedCategoryFilter(category);
    fetchMenuItems(category);
  };

  const handleAddItemClick = () => {
    setSelectedItem(INITIAL_MENU_ITEM);
    setIsAddItemDialogOpen(true);
  };

  const handleAddCategoryClick = () => {
    setSelectedCategory(INITIAL_CATEGORY);
    setIsAddCategoryDialogOpen(true);
  };

  const handleEditItemClick = (item: MenuItem) => {
    editMenuItem(item);
    setIsAddItemDialogOpen(true);
  };

  const handleEditCategoryClick = (category: MenuCategory) => {
    setSelectedCategory(category);
    setIsAddCategoryDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsAddItemDialogOpen(false);
    setIsAddCategoryDialogOpen(false);
    setSelectedItem(null);
    setSelectedCategory(null);
  };

  if (!restaurant) {
    return (
      <div className="p-4 text-center">
        Please log in as a restaurant to manage your menu.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <Button 
          variant="outline" 
          onClick={() => {
            fetchMenuItems(selectedCategoryFilter);
            fetchCategories();
          }} 
          disabled={isLoadingItems || isLoadingCategories}
          className="z-10"
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="max-w-sm w-full">
          <Input
            placeholder="Search menu items or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddItemClick} className="z-10">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            {selectedItem && isAddItemDialogOpen && (
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{selectedItem.id ? 'Edit' : 'Add'} Menu Item</DialogTitle>
                </DialogHeader>
                <MenuItemForm
                  item={selectedItem}
                  categories={categories}
                  onSave={handleSaveMenuItem}
                  onCancel={handleDialogClose}
                  isLoading={isLoadingItems}
                />
              </DialogContent>
            )}
          </Dialog>

          <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={handleAddCategoryClick} className="z-10">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            {selectedCategory && isAddCategoryDialogOpen && (
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedCategory.id ? 'Edit' : 'Add'} Category</DialogTitle>
                </DialogHeader>
                <CategoryForm
                  category={selectedCategory}
                  onSave={handleSaveCategory}
                  onCancel={handleDialogClose}
                  isLoading={isLoadingCategories}
                />
              </DialogContent>
            )}
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="items">Menu Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Menu Items</CardTitle>
              <CardDescription>Manage your restaurant's menu items</CardDescription>

              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    size="sm"
                    variant={!selectedCategoryFilter ? "secondary" : "outline"}
                    className="text-xs"
                    onClick={() => handleCategoryFilterChange(undefined)}
                  >
                    All
                  </Button>
                  {categories.map(category => (
                    <Button
                      key={category.id}
                      size="sm"
                      variant={selectedCategoryFilter === category.name ? "secondary" : "outline"}
                      className="text-xs"
                      onClick={() => handleCategoryFilterChange(category.name)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isLoadingItems ? (
                <div className="text-center py-8">Loading menu items...</div>
              ) : (
                <MenuItemsTable
                  items={filteredMenuItems}
                  onEdit={handleEditItemClick}
                  onDelete={setItemToDelete}
                  onReviewsClick={setSelectedItemForReview}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Menu Categories</CardTitle>
              <CardDescription>Manage your menu categories</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCategories ? (
                <div className="text-center py-8">Loading categories...</div>
              ) : (
                <CategoriesTable
                  categories={filteredCategories}
                  onEdit={handleEditCategoryClick}
                  onDelete={setCategoryToDelete}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the menu item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (itemToDelete) {
                handleDeleteMenuItem(itemToDelete);
                setItemToDelete(null);
              }
            }} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category. Any menu items associated with this category will need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (categoryToDelete) {
                handleDeleteCategory(categoryToDelete);
                setCategoryToDelete(null);
              }
            }} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedItemForReview && (
        <Dialog open={!!selectedItemForReview} onOpenChange={(open) => !open && setSelectedItemForReview(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Customer Reviews</DialogTitle>
            </DialogHeader>
            <MenuItemReviews 
              mealId={selectedItemForReview} 
              restaurantId={restaurant.id}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
