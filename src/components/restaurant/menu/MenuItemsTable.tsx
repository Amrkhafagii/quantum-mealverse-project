
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MenuItem } from '@/types/menu';
import { MoreVertical, Pencil, Star, Trash2, CircleDot, CircleDashed } from 'lucide-react';

interface MenuItemsTableProps {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onReviewsClick: (id: string) => void;
}

export const MenuItemsTable: React.FC<MenuItemsTableProps> = ({
  items,
  onEdit,
  onDelete,
  onReviewsClick
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p>No menu items found.</p>
        <p className="text-sm text-gray-500 mt-1">
          Click 'Add Item' to create your first menu item.
        </p>
      </div>
    );
  }

  return (
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
          {items.map(item => (
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
                    <DropdownMenuItem onSelect={(e) => {
                      e.preventDefault();
                      onEdit(item);
                    }}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onSelect={(e) => {
                      e.preventDefault();
                      onReviewsClick(item.id);
                    }}>
                      <Star className="h-4 w-4 mr-2" />
                      Reviews
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      className="text-red-600"
                      onSelect={() => onDelete(item.id)}
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
  );
};
