
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Edit, Trash2, Info } from 'lucide-react';
import { MenuItem } from '@/types/menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { saveMenuItem, deleteMenuItem } from '@/services/restaurant/menuService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import EditMenuItemForm from './EditMenuItemForm';

interface MenuItemCardProps {
  item: MenuItem;
  onUpdate: () => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAvailabilityChange = async () => {
    try {
      setIsUpdating(true);
      const updatedItem: MenuItem = { 
        ...item, 
        is_available: !item.is_available 
      };
      
      await saveMenuItem(updatedItem);
      
      toast({
        title: `Item ${updatedItem.is_available ? 'enabled' : 'disabled'}`,
        description: `${updatedItem.name} is now ${updatedItem.is_available ? 'available' : 'unavailable'} on the menu.`,
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error updating item availability:', error);
      toast({
        title: 'Update failed',
        description: 'Could not update item availability.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setIsDialogOpen(false);
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    setIsDialogOpen(false);
    onUpdate();
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMenuItem(item.id, item.restaurant_id);
      toast({
        title: 'Item deleted',
        description: `${item.name} has been removed from your menu.`,
      });
      onUpdate();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        title: 'Delete failed',
        description: 'Could not delete the menu item.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <>
      <Card className={`overflow-hidden transition-all duration-300 ${
        item.is_available 
          ? "bg-quantum-darkBlue/30 border-quantum-cyan/20" 
          : "bg-quantum-darkBlue/10 border-gray-700/20 opacity-75"
      }`}>
        <div className="relative h-48 overflow-hidden bg-gray-800">
          {item.image_url ? (
            <img 
              src={item.image_url} 
              alt={item.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-quantum-darkBlue to-quantum-black">
              <span className="text-gray-500">No image</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-8 w-8 bg-black/50 backdrop-blur-sm border-white/10"
              onClick={() => setIsDialogOpen(true)}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold truncate">{item.name}</h3>
              <p className="text-sm text-gray-400 line-clamp-2 h-10">
                {item.description || "No description available"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="font-bold text-lg">
              {formatPrice(item.price)}
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-400 mr-1">
                {item.is_available ? "Available" : "Unavailable"}
              </span>
              <Switch 
                checked={item.is_available} 
                onCheckedChange={handleAvailabilityChange}
                disabled={isUpdating}
              />
            </div>
          </div>
          
          <div className="text-xs text-gray-500 mt-2">
            <span className="bg-gray-800/50 px-2 py-0.5 rounded">
              {item.category}
            </span>
            {item.preparation_time && (
              <span className="ml-2 text-gray-400">
                {item.preparation_time} mins
              </span>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-2 flex items-center justify-between bg-quantum-black/30">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-quantum-cyan hover:text-quantum-cyan/80 hover:bg-quantum-darkBlue/50"
            onClick={handleEditClick}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-red-500 hover:text-red-400 hover:bg-red-900/20"
            onClick={handleDeleteClick}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </CardFooter>
      </Card>
      
      {/* Detail/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          {isEditing ? (
            <>
              <DialogHeader>
                <DialogTitle>Edit Menu Item</DialogTitle>
                <DialogDescription>
                  Make changes to your menu item
                </DialogDescription>
              </DialogHeader>
              <EditMenuItemForm 
                item={item} 
                onCancel={handleEditCancel} 
                onSuccess={handleEditSuccess} 
              />
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{item.name}</DialogTitle>
                <DialogDescription>
                  Menu item details
                </DialogDescription>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-md overflow-hidden h-60 bg-gray-800">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-500">No image available</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Description</h3>
                    <p className="mt-1">{item.description || "No description available"}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Price</h3>
                      <p className="mt-1 font-bold">{formatPrice(item.price)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Category</h3>
                      <p className="mt-1">{item.category}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Preparation Time</h3>
                      <p className="mt-1">{item.preparation_time} minutes</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Status</h3>
                      <p className={`mt-1 ${item.is_available ? 'text-green-500' : 'text-red-500'}`}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </p>
                    </div>
                  </div>
                  
                  {item.ingredients && item.ingredients.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Ingredients</h3>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.ingredients.map((ingredient, index) => (
                          <span 
                            key={index}
                            className="bg-quantum-darkBlue px-2 py-1 rounded-full text-xs"
                          >
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {item.nutritional_info && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Nutritional Info</h3>
                      <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
                        {item.nutritional_info.calories && (
                          <div>Calories: {item.nutritional_info.calories}</div>
                        )}
                        {item.nutritional_info.protein && (
                          <div>Protein: {item.nutritional_info.protein}g</div>
                        )}
                        {item.nutritional_info.carbs && (
                          <div>Carbs: {item.nutritional_info.carbs}g</div>
                        )}
                        {item.nutritional_info.fat && (
                          <div>Fat: {item.nutritional_info.fat}g</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={handleEditClick}>
                  Edit Item
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the menu item
              "{item.name}" from your restaurant's menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MenuItemCard;
