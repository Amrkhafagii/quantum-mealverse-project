import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { useMenuManagement } from '@/hooks/useMenuManagement';
import { MenuItemForm } from './MenuItemForm';
import { CategoryForm } from './CategoryForm';
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, MoreVertical, Pencil, Trash2, RefreshCcw, CircleDot, CircleDashed, Star } from 'lucide-react';
import { MenuItemReviews } from './MenuItemReviews';

export const MenuManagement: React.FC = () => {
  const { restaurant } = useRestaurantAuth();
  const [activeTab, setActiveTab] = useState('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | undefined>();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [selectedItemForReview, setSelectedItemForReview] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    menuItems,
    categories,
    selectedItem,
    selectedCategory,
    isLoading,
    fetchMenuItems,
    fetchCategories,
    handleSaveMenuItem,
    handleDeleteMenuItem,
    handleSaveCategory,
    handleDeleteCategory,
    createNewMenuItem,
    createNewCategory,
    editMenuItem,
    editCategory,
    setSelectedItem,
    setSelectedCategory
  } = useMenuManagement(restaurant?.id || '');

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

  const confirmDeleteItem = async () => {
    if (itemToDelete) {
      await handleDeleteMenuItem(itemToDelete);
      setItemToDelete(null);
    }
  };

  const confirmDeleteCategory = async () => {
    if (categoryToDelete) {
      await handleDeleteCategory(categoryToDelete);
      setCategoryToDelete(null);
    }
  };

  const handleItemDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedItem(null);
    }
  };

  const handleCategoryDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedCategory(null);
    }
  };

  const handleReviewDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedItemForReview(null);
    }
  };

  const handleCategoryFilterChange = (category?: string) => {
    setSelectedCategoryFilter(category);
    fetchMenuItems(category);
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
        <Button variant="outline" onClick={() => {
          fetchMenuItems(selectedCategoryFilter);
          fetchCategories();
        }} disabled={isLoading}>
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
          <Dialog onOpenChange={handleItemDialogClose}>
            <DialogTrigger asChild>
              <Button onClick={createNewMenuItem}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            {selectedItem && (
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{selectedItem.id ? 'Edit' : 'Add'} Menu Item</DialogTitle>
                </DialogHeader>
                <MenuItemForm
                  item={selectedItem}
                  categories={categories}
                  onSave={handleSaveMenuItem}
                  onCancel={() => setSelectedItem(null)}
                  isLoading={isLoading}
                />
              </DialogContent>
            )}
          </Dialog>

          <Dialog onOpenChange={handleCategoryDialogClose}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={createNewCategory}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            {selectedCategory && (
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedCategory.id ? 'Edit' : 'Add'} Category</DialogTitle>
                </DialogHeader>
                <CategoryForm
                  category={selectedCategory}
                  onSave={handleSaveCategory}
                  onCancel={() => setSelectedCategory(null)}
                  isLoading={isLoading}
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
              {isLoading ? (
                <div className="text-center py-8">Loading menu items...</div>
              ) : filteredMenuItems.length === 0 ? (
                <div className="text-center py-8">
                  <p>No menu items found.</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {searchQuery
                      ? "Try adjusting your search query."
                      : "Click 'Add Item' to create your first menu item."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMenuItems.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-center">
                            {item.is_available ? (
                              <CircleDot className="h-4 w-4 text-green-500 inline" />
                            ) : (
                              <CircleDashed className="h-4 w-4 text-gray-400 inline" />
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <Dialog onOpenChange={handleItemDialogClose}>
                                  <DialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => {
                                      e.preventDefault();
                                      editMenuItem(item);
                                    }}>
                                      <Pencil className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                  </DialogTrigger>
                                </Dialog>
                                
                                <Dialog onOpenChange={handleReviewDialogClose}>
                                  <DialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => {
                                      e.preventDefault();
                                      setSelectedItemForReview(item.id);
                                    }}>
                                      <Star className="h-4 w-4 mr-2" />
                                      Reviews
                                    </DropdownMenuItem>
                                  </DialogTrigger>
                                </Dialog>
                                
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onSelect={() => setItemToDelete(item.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
              {isLoading ? (
                <div className="text-center py-8">Loading categories...</div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-8">
                  <p>No categories found.</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {searchQuery
                      ? "Try adjusting your search query."
                      : "Click 'Add Category' to create your first category."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Display Order</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCategories.map(category => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>{category.description || '-'}</TableCell>
                          <TableCell>{category.order !== undefined ? category.order : '-'}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <Dialog onOpenChange={handleCategoryDialogClose}>
                                  <DialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => {
                                      e.preventDefault();
                                      editCategory(category);
                                    }}>
                                      <Pencil className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                  </DialogTrigger>
                                </Dialog>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onSelect={() => setCategoryToDelete(category.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
            <AlertDialogAction onClick={confirmDeleteItem} className="bg-red-600 hover:bg-red-700">
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
            <AlertDialogAction onClick={confirmDeleteCategory} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedItemForReview && (
        <Dialog open={!!selectedItemForReview} onOpenChange={handleReviewDialogClose}>
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
