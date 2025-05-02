
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WorkoutLayout: React.FC = () => {
  return (
    <div className="py-8 space-y-8">
      <h1 className="text-3xl font-bold text-quantum-cyan">Workout Manager</h1>
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle>Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your workout management interface is coming soon!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutLayout;
