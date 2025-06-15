import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { calculateTDEE } from '@/lib/tdee-calculator';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { generateMealPlan } from '@/services/mealPlan/mealGenerationService';
import MealPlanDisplay from '@/components/fitness/MealPlanDisplay';
import { Button } from '@/components/ui/button';

interface TDEECalculatorProps {
  onGenerateMealPlan?: (result: any) => void;
}

const TDEECalculator: React.FC<TDEECalculatorProps> = ({ onGenerateMealPlan }) => {
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [activityLevel, setActivityLevel] = useState('sedentary');
  const [goal, setGoal] = useState('maintain');
  const [bodyFat, setBodyFat] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [mealPlan, setMealPlan] = useState(null);

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      // Validate inputs
      if (!age || !weight || !heightFeet || !heightInches) {
        toast({
          title: "Error",
          description: "Please fill in all fields.",
          variant: "destructive"
        });
        return;
      }

      const ageValue = parseInt(age);
      const weightValue = parseInt(weight);
      const heightFeetValue = parseInt(heightFeet);
      const heightInchesValue = parseInt(heightInches);

      if (ageValue <= 0 || weightValue <= 0 || heightFeetValue <= 0 || heightInchesValue < 0) {
        toast({
          title: "Error",
          description: "Please enter valid positive numbers.",
          variant: "destructive"
        });
        return;
      }

      const heightInInches = (heightFeetValue * 12) + heightInchesValue;

      // Perform calculation
      const calculationResult = calculateTDEE({
        gender,
        age: ageValue,
        weightKg: weightValue,
        heightCm: heightInInches,
        activityLevel,
        goal,
        bodyFatPercentage: bodyFat
      });

      setResult(calculationResult);

      // Generate meal plan
      try {
        const generatedMealPlan = generateMealPlan(calculationResult);
        setMealPlan(generatedMealPlan);
      } catch (error: any) {
        console.error("Meal plan generation error:", error);
        toast({
          title: "Error",
          description: `Failed to generate meal plan: ${error.message}`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error("TDEE calculation error:", error);
      toast({
        title: "Error",
        description: "Failed to calculate TDEE. Please check your inputs.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleGenerateMealPlan = () => {
    // You may want to validate and generate meal plan data here
    if (result && onGenerateMealPlan) {
      onGenerateMealPlan(result);
    }
  };

  return (
    <div>
      <Card className="max-w-lg mx-auto bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-quantum-cyan">TDEE Calculator</CardTitle>
          <CardDescription className="text-gray-400">
            Calculate your Total Daily Energy Expenditure (TDEE)
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="bg-quantum-black/50 text-white">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="bg-quantum-black/80 text-white">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                type="number"
                id="age"
                placeholder="Enter age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="bg-quantum-black/50 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                type="number"
                id="weight"
                placeholder="Enter weight in kg"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="bg-quantum-black/50 text-white"
              />
            </div>
            <div>
              <Label>Height</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Feet"
                  value={heightFeet}
                  onChange={(e) => setHeightFeet(e.target.value)}
                  className="bg-quantum-black/50 text-white"
                />
                <Input
                  type="number"
                  placeholder="Inches"
                  value={heightInches}
                  onChange={(e) => setHeightInches(e.target.value)}
                  className="bg-quantum-black/50 text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="activityLevel">Activity Level</Label>
            <Select value={activityLevel} onValueChange={setActivityLevel}>
              <SelectTrigger className="bg-quantum-black/50 text-white">
                <SelectValue placeholder="Select activity level" />
              </SelectTrigger>
              <SelectContent className="bg-quantum-black/80 text-white">
                <SelectItem value="sedentary">Sedentary</SelectItem>
                <SelectItem value="lightly-active">Lightly Active</SelectItem>
                <SelectItem value="moderately-active">Moderately Active</SelectItem>
                <SelectItem value="very-active">Very Active</SelectItem>
                <SelectItem value="extra-active">Extra Active</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="goal">Goal</Label>
            <Select value={goal} onValueChange={setGoal}>
              <SelectTrigger className="bg-quantum-black/50 text-white">
                <SelectValue placeholder="Select goal" />
              </SelectTrigger>
              <SelectContent className="bg-quantum-black/80 text-white">
                <SelectItem value="lose">Lose Weight</SelectItem>
                <SelectItem value="maintain">Maintain Weight</SelectItem>
                <SelectItem value="gain">Gain Weight</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="bodyFat">Body Fat (%) - Optional</Label>
            <Slider
              defaultValue={[0]}
              max={50}
              step={1}
              onValueChange={(value) => setBodyFat(value[0])}
              className="text-quantum-cyan"
            />
            <p className="text-sm text-gray-400 mt-1">
              Selected: {bodyFat !== null ? `${bodyFat}%` : 'Not specified'}
            </p>
          </div>

          <Button
            onClick={handleCalculate}
            className="bg-quantum-purple hover:bg-quantum-purple/90 text-white font-bold py-2 px-4 rounded"
            disabled={isCalculating}
          >
            {isCalculating ? (
              <>
                Calculating...
                <Progress className="mt-2" value={50} />
              </>
            ) : (
              "Calculate TDEE"
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="mt-6 max-w-lg mx-auto">
          <h2 className="text-xl font-bold mb-4 text-quantum-cyan">Results</h2>
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardContent className="space-y-2">
              <p className="text-gray-400">
                Your estimated TDEE is: <span className="font-bold text-quantum-cyan">{result.tdee} kcal</span>
              </p>
              <p className="text-gray-400">
                Basal Metabolic Rate (BMR): <span className="font-bold text-quantum-cyan">{result.bmr} kcal</span>
              </p>
              <p className="text-gray-400">
                Adjusted Calories for your goal: <span className="font-bold text-quantum-cyan">{result.adjustedCalories} kcal</span>
              </p>
              <p className="text-gray-400">
                Protein Intake: <span className="font-bold text-quantum-cyan">{result.proteinGrams} grams</span>
              </p>
              <p className="text-gray-400">
                Carbs Intake: <span className="font-bold text-quantum-cyan">{result.carbsGrams} grams</span>
              </p>
              <p className="text-gray-400">
                Fats Intake: <span className="font-bold text-quantum-cyan">{result.fatsGrams} grams</span>
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <button
        className="mt-4 px-6 py-2 rounded bg-quantum-cyan hover:bg-quantum-cyan/80 text-white text-lg font-bold transition"
        onClick={handleGenerateMealPlan}
        disabled={!result}
      >
        Generate Meal Plan
      </button>
    </div>
  );
};

export default TDEECalculator;
