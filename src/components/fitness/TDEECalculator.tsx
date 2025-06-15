// Add a simple TDEE calculation function at the top of the file
function calculateTDEE(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female',
  activityLevel: number
) {
  // Harris-Benedict Equation as a fallback
  let bmr = gender === 'male'
    ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);

  const tdee = bmr * activityLevel;
  return { bmr, tdee };
}

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CheckCheck, User2 } from 'lucide-react';
import { TDEEResult } from '@/services/mealPlan/types';

interface TDEECalculatorProps {
  onGenerateMealPlan: (result: TDEEResult) => void;
}

const TDEECalculator: React.FC<TDEECalculatorProps> = ({ onGenerateMealPlan }) => {
  const [weight, setWeight] = useState<number>(70); // Weight in kg
  const [height, setHeight] = useState<number>(175); // Height in cm
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState<number>(1.55); // Moderate activity
  const [goal, setGoal] = useState<'cut' | 'maintain' | 'bulk'>('maintain');
  const { toast } = useToast();

  // Activity level descriptions
  const activityLevels = {
    1.2: 'Sedentary (little to no exercise)',
    1.375: 'Lightly Active (light exercise/sports 1-3 days/week)',
    1.55: 'Moderately Active (moderate exercise/sports 3-5 days/week)',
    1.725: 'Very Active (hard exercise/sports 6-7 days a week)',
    1.9: 'Extremely Active (very hard exercise/sports & physical job or 2x training)'
  };

  useEffect(() => {
    // Store default values in session storage on mount
    sessionStorage.setItem('weight', weight.toString());
    sessionStorage.setItem('height', height.toString());
    sessionStorage.setItem('age', age.toString());
    sessionStorage.setItem('gender', gender);
    sessionStorage.setItem('activityLevel', activityLevel.toString());
    sessionStorage.setItem('goal', goal);
  }, []);

  const handleCalculate = () => {
    // Simple TDEE calculation (you can use a more accurate formula)
    const { bmr, tdee } = calculateTDEE(weight, height, age, gender, activityLevel);

    // Adjust calories based on goal
    let adjustedCalories = tdee;
    let proteinGrams = weight * 2; // 2g of protein per kg of body weight
    let fatGrams = weight * 0.8; // 0.8g of fat per kg of body weight
    let carbsGrams = 0;

    switch (goal) {
      case 'cut':
        adjustedCalories = tdee * 0.85; // 15% deficit
        carbsGrams = (adjustedCalories - (proteinGrams * 4) - (fatGrams * 9)) / 4;
        break;
      case 'bulk':
        adjustedCalories = tdee * 1.10; // 10% surplus
        carbsGrams = (adjustedCalories - (proteinGrams * 4) - (fatGrams * 9)) / 4;
        break;
      default:
        adjustedCalories = tdee;
        carbsGrams = (adjustedCalories - (proteinGrams * 4) - (fatGrams * 9)) / 4;
        break;
    }

    // Ensure carbs are not negative
    carbsGrams = Math.max(0, carbsGrams);

    const result: TDEEResult = {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      adjustedCalories: Math.round(adjustedCalories),
      proteinGrams: Math.round(proteinGrams),
      carbsGrams: Math.round(carbsGrams),
      fatsGrams: Math.round(fatGrams),
      goal: goal
    };

    // Store calculation result in session storage
    sessionStorage.setItem('currentTDEE', JSON.stringify(result));

    // Pass the result to the parent component
    onGenerateMealPlan(result);

    toast({
      title: "Calculation complete!",
      description: "Your TDEE and macronutrient targets have been calculated.",
    })
  };

  return (
    <Card className="w-full bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="text-quantum-cyan flex items-center gap-2">
          <User2 className="h-5 w-5" />
          TDEE Calculator
        </CardTitle>
        <CardDescription className="text-gray-400">
          Calculate your Total Daily Energy Expenditure (TDEE) to estimate your daily calorie needs.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            type="number"
            id="weight"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            type="number"
            id="height"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="age">Age</Label>
          <Input
            type="number"
            id="age"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="gender">Gender</Label>
          <Select value={gender} onValueChange={value => setGender(value as 'male' | 'female')}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="activityLevel">Activity Level</Label>
          <Slider
            id="activityLevel"
            defaultValue={[activityLevel]}
            max={1.9}
            min={1.2}
            step={0.025}
            onValueChange={(value) => setActivityLevel(value[0])}
          />
          <p className="text-sm text-gray-500">{activityLevels[activityLevel as keyof typeof activityLevels]}</p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="goal">Goal</Label>
          <Select value={goal} onValueChange={value => setGoal(value as 'cut' | 'maintain' | 'bulk')}>
            <SelectTrigger id="goal">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cut">Cut (lose weight)</SelectItem>
              <SelectItem value="maintain">Maintain</SelectItem>
              <SelectItem value="bulk">Bulk (gain weight)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleCalculate} className="bg-quantum-purple hover:bg-quantum-purple/90">
          Calculate & Generate Meal Plan
          <CheckCheck className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default TDEECalculator;
