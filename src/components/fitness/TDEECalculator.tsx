
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export interface TDEEResult {
  tdee: number;
  bmr: number;
  adjustedCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  goal: string;
}

const TDEECalculator = ({ onCalculationComplete }: { onCalculationComplete?: (result: TDEEResult) => void }) => {
  const { toast } = useToast();
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [bodyFat, setBodyFat] = useState<string>('');
  const [activityLevel, setActivityLevel] = useState<string>('1.2');
  const [goal, setGoal] = useState<'maintain' | 'cut' | 'bulk'>('maintain');
  const [result, setResult] = useState<TDEEResult | null>(null);

  const activityLevels = [
    { value: '1.2', label: 'Sedentary (office job, little to no exercise)' },
    { value: '1.375', label: 'Light Activity (light exercise 1-3 days/week)' },
    { value: '1.55', label: 'Moderate Activity (moderate exercise 3-5 days/week)' },
    { value: '1.725', label: 'Very Active (hard exercise 6-7 days/week)' },
    { value: '1.9', label: 'Extremely Active (physical job + training 2x/day)' },
  ];

  const convertToMetric = () => {
    // Convert imperial to metric if needed
    const weightKg = units === 'imperial' ? parseFloat(weight) * 0.453592 : parseFloat(weight);
    const heightCm = units === 'imperial' ? parseFloat(height) * 2.54 : parseFloat(height);
    return { weightKg, heightCm };
  };

  const calculateTDEE = () => {
    if (!age || !weight || !height || !activityLevel) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const { weightKg, heightCm } = convertToMetric();
    const ageNum = parseFloat(age);
    const activityMultiplier = parseFloat(activityLevel);

    // Martin Berkhan's LeanGains formula
    let bmr;
    if (gender === 'female') {
      bmr = 370 + (9.8 * weightKg) + (1.8 * heightCm) - (4.7 * ageNum);
    } else {
      bmr = 88.4 + (13.4 * weightKg) + (4.8 * heightCm) - (5.68 * ageNum);
    }

    // Calculate TDEE based on activity level
    const tdee = bmr * activityMultiplier;

    // Adjust calories based on goal
    let adjustedCalories = tdee;
    if (goal === 'bulk') {
      adjustedCalories = tdee * 1.1; // +10% for bulking
    } else if (goal === 'cut') {
      adjustedCalories = tdee * 0.8; // -20% for cutting
    }

    // Calculate macros (30/35/35 split)
    const proteinCalories = adjustedCalories * 0.3;
    const carbsCalories = adjustedCalories * 0.35;
    const fatsCalories = adjustedCalories * 0.35;

    // Convert to grams
    const proteinGrams = Math.round(proteinCalories / 4); // 4 calories per gram of protein
    const carbsGrams = Math.round(carbsCalories / 4); // 4 calories per gram of carbs
    const fatsGrams = Math.round(fatsCalories / 9); // 9 calories per gram of fat

    const resultData: TDEEResult = {
      tdee: Math.round(tdee),
      bmr: Math.round(bmr),
      adjustedCalories: Math.round(adjustedCalories),
      proteinGrams,
      carbsGrams,
      fatsGrams,
      goal
    };

    setResult(resultData);
    
    if (onCalculationComplete) {
      onCalculationComplete(resultData);
    }

    toast({
      title: "Calculation Complete",
      description: "Your personalized TDEE and macros have been calculated.",
    });
  };

  const waterIntake = () => {
    const { weightKg } = convertToMetric();
    return Math.round(weightKg * 35); // 35ml per kg
  };

  return (
    <Card className="holographic-card">
      <CardHeader>
        <CardTitle className="text-quantum-cyan">TDEE & Macro Calculator</CardTitle>
        <CardDescription>
          Calculate your daily energy requirements and optimal macronutrient distribution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calculator">
          <TabsList className="mb-4">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="results" disabled={!result}>Results</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-4">
            <div className="mb-4">
              <TabsList className="mb-2 w-full">
                <TabsTrigger 
                  value="metric" 
                  className="w-1/2" 
                  onClick={() => setUnits('metric')}
                  data-state={units === 'metric' ? 'active' : ''}
                >
                  Metric
                </TabsTrigger>
                <TabsTrigger 
                  value="imperial" 
                  className="w-1/2" 
                  onClick={() => setUnits('imperial')}
                  data-state={units === 'imperial' ? 'active' : ''}
                >
                  Imperial
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={gender}
                  onValueChange={(value: 'male' | 'female') => setGender(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age (years)</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">
                  Weight ({units === 'metric' ? 'kg' : 'lbs'})
                </Label>
                <Input
                  id="weight"
                  type="number"
                  min="40"
                  max={units === 'metric' ? '200' : '440'}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">
                  Height ({units === 'metric' ? 'cm' : 'in'})
                </Label>
                <Input
                  id="height"
                  type="number"
                  min={units === 'metric' ? '140' : '55'}
                  max={units === 'metric' ? '220' : '87'}
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bodyFat">Body Fat % (optional)</Label>
              <Input
                id="bodyFat"
                type="number"
                min="3"
                max="50"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                placeholder="Enter if known"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activityLevel">Activity Level</Label>
              <Select 
                value={activityLevel} 
                onValueChange={(value) => setActivityLevel(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  {activityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Goal</Label>
              <Select 
                value={goal} 
                onValueChange={(value: 'maintain' | 'cut' | 'bulk') => setGoal(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintain">Maintain Weight</SelectItem>
                  <SelectItem value="cut">Cut (Lose Weight)</SelectItem>
                  <SelectItem value="bulk">Bulk (Gain Weight)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={calculateTDEE} 
              className="w-full bg-quantum-cyan hover:bg-quantum-cyan/90"
            >
              Calculate
            </Button>
          </TabsContent>

          <TabsContent value="results">
            {result && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-quantum-darkBlue/30 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">BMR</div>
                    <div className="text-2xl font-bold text-quantum-cyan">{result.bmr} kcal</div>
                  </div>
                  <div className="bg-quantum-darkBlue/30 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">TDEE</div>
                    <div className="text-2xl font-bold text-quantum-cyan">{result.tdee} kcal</div>
                  </div>
                </div>

                <div className="bg-quantum-darkBlue/30 p-4 rounded-lg">
                  <div className="text-sm text-gray-400">
                    {result.goal === 'maintain' ? 'Maintenance Calories' : 
                     result.goal === 'cut' ? 'Cutting Calories (-20%)' : 
                     'Bulking Calories (+10%)'}
                  </div>
                  <div className="text-3xl font-bold text-quantum-purple">
                    {result.adjustedCalories} kcal
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Recommended Macros (30/35/35)</h3>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-900/30 p-3 rounded-lg text-center">
                      <div className="text-blue-400 font-medium">Protein</div>
                      <div className="text-xl font-bold">{result.proteinGrams}g</div>
                      <div className="text-sm text-gray-400">{Math.round(result.proteinGrams * 4)} kcal</div>
                    </div>
                    
                    <div className="bg-green-900/30 p-3 rounded-lg text-center">
                      <div className="text-green-400 font-medium">Carbs</div>
                      <div className="text-xl font-bold">{result.carbsGrams}g</div>
                      <div className="text-sm text-gray-400">{Math.round(result.carbsGrams * 4)} kcal</div>
                    </div>
                    
                    <div className="bg-yellow-900/30 p-3 rounded-lg text-center">
                      <div className="text-yellow-400 font-medium">Fats</div>
                      <div className="text-xl font-bold">{result.fatsGrams}g</div>
                      <div className="text-sm text-gray-400">{Math.round(result.fatsGrams * 9)} kcal</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-900/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base font-medium text-blue-400">
                        Daily Water Intake
                      </div>
                      <div className="text-2xl font-bold">{waterIntake()} ml</div>
                    </div>
                    <div className="text-3xl">💧</div>
                  </div>
                </div>

                <div>
                  <Button 
                    className="w-full bg-quantum-purple hover:bg-quantum-purple/90"
                    onClick={() => document.getElementById('meal-plan-section')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Generate Meal Plan
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TDEECalculator;
