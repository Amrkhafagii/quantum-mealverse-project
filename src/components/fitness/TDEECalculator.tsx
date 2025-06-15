
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMealPlan } from "@/hooks/useMealPlan";

// Copy TDEEResult here for strict typing if this file doesn't already have one
export interface TDEEResult {
  tdee: number;
  bmr: number;
  goal: string;
  adjustedCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
}

interface TDEECalculatorProps {
  // New prop: setActiveTab handler for NutritionPage
  setActiveTab: (tab: string) => void;
  calculateTDEE: (result: TDEEResult) => void;
}

const TDEECalculator: React.FC<TDEECalculatorProps> = ({ setActiveTab, calculateTDEE }) => {
  // These are dummy inputs for demo; replace with real fields if needed.
  const [tdee, setTdee] = useState(2200);
  const [bmr, setBmr] = useState(1700);
  const [goal, setGoal] = useState("Maintenance");
  const [proteinGrams, setProteinGrams] = useState(150);
  const [carbsGrams, setCarbsGrams] = useState(250);
  const [fatsGrams, setFatsGrams] = useState(70);

  const [calculated, setCalculated] = useState(false);

  const handleCalculate = () => {
    const tdeeResult: TDEEResult = {
      tdee,
      bmr,
      goal,
      adjustedCalories: tdee, // using tdee as adjustedCalories for now
      proteinGrams,
      carbsGrams,
      fatsGrams,
    };
    calculateTDEE(tdeeResult);
    setCalculated(true);
    setTimeout(() => {
      // Show meal plan dashboard tab after calculation
      setActiveTab("dashboard");
    }, 200); // slight delay to show feedback if needed
  };

  return (
    <Card className="bg-quantum-black/20 border-quantum-cyan/10 mb-4">
      <CardHeader>
        <CardTitle>TDEE Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={e => { e.preventDefault(); handleCalculate(); }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tdee">TDEE (kcal)</Label>
              <Input id="tdee" type="number" value={tdee} onChange={e => setTdee(Number(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="bmr">BMR (kcal)</Label>
              <Input id="bmr" type="number" value={bmr} onChange={e => setBmr(Number(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="goal">Goal</Label>
              <Input id="goal" type="text" value={goal} onChange={e => setGoal(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="protein">Protein (g)</Label>
              <Input id="protein" type="number" value={proteinGrams} onChange={e => setProteinGrams(Number(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input id="carbs" type="number" value={carbsGrams} onChange={e => setCarbsGrams(Number(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="fats">Fats (g)</Label>
              <Input id="fats" type="number" value={fatsGrams} onChange={e => setFatsGrams(Number(e.target.value))} />
            </div>
          </div>
          <Button className="mt-6 w-full bg-quantum-cyan hover:bg-quantum-cyan/90" type="submit">
            Calculate & Generate Meal Plan
          </Button>
        </form>
        {calculated && (
          <div className="mt-4 text-green-400 font-bold text-center animate-pulse">
            Generated! See your meal plan below.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TDEECalculator;
