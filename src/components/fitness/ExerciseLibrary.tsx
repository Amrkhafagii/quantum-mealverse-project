import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Clock, 
  TrendingUp, 
  Star, 
  Play,
  Heart,
  Share,
  MoreVertical
} from 'lucide-react';
import { useResponsive } from '@/responsive/core';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Exercise {
  id: number;
  name: string;
  type: string;
  difficulty: string;
  duration: number;
  popularity: number;
  isFavorite: boolean;
}

const mockExercises: Exercise[] = [
  { id: 1, name: 'Push-ups', type: 'Strength', difficulty: 'Beginner', duration: 10, popularity: 85, isFavorite: true },
  { id: 2, name: 'Running', type: 'Cardio', difficulty: 'Intermediate', duration: 30, popularity: 92, isFavorite: false },
  { id: 3, name: 'Yoga', type: 'Flexibility', difficulty: 'Beginner', duration: 20, popularity: 78, isFavorite: false },
  { id: 4, name: 'Weight Lifting', type: 'Strength', difficulty: 'Advanced', duration: 45, popularity: 88, isFavorite: true },
  { id: 5, name: 'Swimming', type: 'Cardio', difficulty: 'Intermediate', duration: 40, popularity: 80, isFavorite: false },
];

const ExerciseLibrary: React.FC = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [searchTerm, setSearchTerm] = useState('');
  const [exercises, setExercises] = useState(mockExercises);
  
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Exercise Library</CardTitle>
          <CardDescription>Explore a variety of exercises to fit your fitness goals.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search for exercises..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredExercises.map(exercise => (
              <Card key={exercise.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="relative">
                  <img
                    src={`https://source.unsplash.com/250x150/?${exercise.type}`}
                    alt={exercise.name}
                    className="w-full h-32 object-cover"
                  />
                  <Badge className="absolute top-2 right-2">{exercise.difficulty}</Badge>
                </div>
                <CardContent className="p-4">
                  <CardTitle className="text-lg font-semibold">{exercise.name}</CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    Type: {exercise.type}
                    <br />
                    Duration: {exercise.duration} minutes
                  </CardDescription>
                  <div className="flex items-center space-x-2 mt-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{exercise.duration} min</span>
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span>{exercise.popularity}%</span>
                  </div>
                </CardContent>
                <div className="flex items-center justify-between p-4 border-t border-gray-200">
                  <Button variant="ghost" size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Share className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExerciseLibrary;
