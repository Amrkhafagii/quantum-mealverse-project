import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Accept onCalculate as a prop
export interface TDEECalculatorProps {
  onCalculate?: (result: TDEEResult) => void;
  isLoading?: boolean;
  error?: string | null;
}

export interface TDEEResult {
  tdee: number;
  bmr: number;
  goal: string;
  adjustedCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
}

const TDEECalculator: React.FC<TDEECalculatorProps> = ({ onCalculate, isLoading, error }) => {
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [activityLevel, setActivityLevel] = useState("sedentary");
  const [goal, setGoal] = useState("maintain");

  const handleChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
  };

  const calculateBMR = () => {
    const weightKg = Number(weightLbs) * 0.453592;
    const heightCm = (Number(heightFeet) * 30.48) + (Number(heightInches) * 2.54);
    const ageNum = Number(age);

    if (isNaN(weightKg) || isNaN(heightCm) || isNaN(ageNum)) {
      return 0;
    }

    let bmr: number;
    if (gender === "male") {
      bmr = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * ageNum);
    } else {
      bmr = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * ageNum);
    }

    return bmr;
  };

  const calculateTDEE = (bmr: number) => {
    let activityFactor: number;
    switch (activityLevel) {
      case "sedentary":
        activityFactor = 1.2;
        break;
      case "lightly-active":
        activityFactor = 1.375;
        break;
      case "moderately-active":
        activityFactor = 1.55;
        break;
      case "very-active":
        activityFactor = 1.725;
        break;
      case "extra-active":
        activityFactor = 1.9;
        break;
      default:
        activityFactor = 1.2;
        break;
    }

    return bmr * activityFactor;
  };

  const adjustForGoal = (tdee: number) => {
    let calorieAdjustment: number;
    switch (goal) {
      case "lose":
        calorieAdjustment = -500;
        break;
      case "gain":
        calorieAdjustment = 500;
        break;
      default:
        calorieAdjustment = 0;
        break;
    }

    return tdee + calorieAdjustment;
  };

  const calculateMacros = (adjustedCalories: number) => {
    let proteinPercentage: number;
    let fatPercentage: number;

    switch (goal) {
      case "lose":
        proteinPercentage = 0.4;
        fatPercentage = 0.3;
        break;
      case "gain":
        proteinPercentage = 0.3;
        fatPercentage = 0.35;
        break;
      default:
        proteinPercentage = 0.3;
        fatPercentage = 0.3;
        break;
    }

    const proteinGrams = (adjustedCalories * proteinPercentage) / 4;
    const fatsGrams = (adjustedCalories * fatPercentage) / 9;
    const carbsGrams = (adjustedCalories * (1 - proteinPercentage - fatPercentage)) / 4;

    return { proteinGrams, carbsGrams, fatsGrams };
  };

  // Update form submit to use onCalculate
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bmr = calculateBMR();
    const tdee = calculateTDEE(bmr);
    const adjustedCalories = adjustForGoal(tdee);
    const { proteinGrams, carbsGrams, fatsGrams } = calculateMacros(adjustedCalories);
    const result: TDEEResult = {
      tdee,
      bmr,
      goal,
      adjustedCalories,
      proteinGrams,
      carbsGrams,
      fatsGrams,
    };
    if (onCalculate) {
      onCalculate(result);
    }
    // No need for local state result here; moved to parent
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="text-quantum-cyan">Calculate Your Macros</CardTitle>
          <CardDescription>
            Enter your details to get a personalized nutrition plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="bg-quantum-black/50 border-quantum-cyan/20">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="bg-quantum-darkBlue border-quantum-cyan/20">
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
                value={age}
                onChange={handleChange(setAge)}
                className="bg-quantum-black/50 border-quantum-cyan/20"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="heightFeet">Height (feet)</Label>
              <Input
                type="number"
                id="heightFeet"
                value={heightFeet}
                onChange={handleChange(setHeightFeet)}
                className="bg-quantum-black/50 border-quantum-cyan/20"
              />
            </div>
            <div>
              <Label htmlFor="heightInches">Height (inches)</Label>
              <Input
                type="number"
                id="heightInches"
                value={heightInches}
                onChange={handleChange(setHeightInches)}
                className="bg-quantum-black/50 border-quantum-cyan/20"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="weightLbs">Weight (lbs)</Label>
            <Input
              type="number"
              id="weightLbs"
              value={weightLbs}
              onChange={handleChange(setWeightLbs)}
              className="bg-quantum-black/50 border-quantum-cyan/20"
            />
          </div>
          <div>
            <Label htmlFor="activityLevel">Activity Level</Label>
            <Select value={activityLevel} onValueChange={setActivityLevel}>
              <SelectTrigger className="bg-quantum-black/50 border-quantum-cyan/20">
                <SelectValue placeholder="Select activity level" />
              </SelectTrigger>
              <SelectContent className="bg-quantum-darkBlue border-quantum-cyan/20">
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
              <SelectTrigger className="bg-quantum-black/50 border-quantum-cyan/20">
                <SelectValue placeholder="Select goal" />
              </SelectTrigger>
              <SelectContent className="bg-quantum-darkBlue border-quantum-cyan/20">
                <SelectItem value="lose">Lose Weight</SelectItem>
                <SelectItem value="maintain">Maintain Weight</SelectItem>
                <SelectItem value="gain">Gain Weight</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      <button
        type="submit"
        className="mt-6 w-full bg-quantum-cyan text-white rounded-lg py-3 font-semibold transition hover:bg-quantum-cyan/80"
        disabled={isLoading}
      >
        {isLoading ? "Calculating..." : "Calculate"}
      </button>
    </form>
  );
};

export default TDEECalculator;
