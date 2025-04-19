
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MealType } from '@/types/meal';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface MealListProps {
  meals: MealType[];
  onEdit: (meal: MealType) => void;
  onDelete: (id: string) => void;
}

const ITEMS_PER_PAGE = 4;

const MealList: React.FC<MealListProps> = ({ meals, onEdit, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredMeals = meals.filter(meal =>
    meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meal.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMeals.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMeals = filteredMeals.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <Card className="p-6 holographic-card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-quantum-cyan">Meals</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search meals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {paginatedMeals.length === 0 ? (
          <p className="text-center text-galaxy-purple">
            {searchQuery ? 'No meals found matching your search.' : 'No meals found. Create your first meal!'}
          </p>
        ) : (
          paginatedMeals.map(meal => (
            <Card key={meal.id} className="p-4 border border-quantum-cyan/30">
              <div className="flex gap-4">
                {meal.image_url && (
                  <img 
                    src={meal.image_url} 
                    alt={meal.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold text-quantum-cyan">{meal.name}</h3>
                      <p className="text-sm text-gray-300 line-clamp-2">{meal.description}</p>
                      <p className="text-galaxy-purple">${meal.price.toFixed(2)} | {meal.calories} kcal</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        variant="outline" 
                        onClick={() => onEdit(meal)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm"
                        variant="destructive" 
                        onClick={() => onDelete(meal.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </Card>
  );
};

export default MealList;
