
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserMeasurement } from '@/types/fitness';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDistanceToNow } from 'date-fns';

interface MeasurementsHistoryProps {
  measurements: UserMeasurement[];
  onMeasurementAdded: () => void;
}

const MeasurementsHistory = ({ measurements, onMeasurementAdded }: MeasurementsHistoryProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [arms, setArms] = useState('');
  const [legs, setLegs] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddMeasurement = async () => {
    if (!weight) {
      toast({
        title: "Weight Required",
        description: "Please enter your current weight to add a measurement.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      const newMeasurement = {
        user_id: user?.id,
        date: new Date().toISOString(),
        weight: parseFloat(weight),
        body_fat: bodyFat ? parseFloat(bodyFat) : null,
        chest: chest ? parseFloat(chest) : null,
        waist: waist ? parseFloat(waist) : null,
        hips: hips ? parseFloat(hips) : null,
        arms: arms ? parseFloat(arms) : null,
        legs: legs ? parseFloat(legs) : null,
        notes: notes || null
      };

      // Use the insertable type with 'as any' to bypass TypeScript check until we regenerate types
      const { error } = await supabase
        .from('user_measurements' as any)
        .insert([newMeasurement]);

      if (error) throw error;

      toast({
        title: "Measurement Added",
        description: "Your new measurement has been recorded successfully."
      });
      
      // Reset form
      setWeight('');
      setBodyFat('');
      setChest('');
      setWaist('');
      setHips('');
      setLegs('');
      setNotes('');
      
      // Refresh data
      if (onMeasurementAdded) onMeasurementAdded();
      
    } catch (error) {
      console.error('Error adding measurement:', error);
      toast({
        title: "Error",
        description: "Failed to add measurement. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Format data for charts
  const chartData = [...measurements]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(m => ({
      date: new Date(m.date).toLocaleDateString(),
      weight: m.weight,
      bodyFat: m.body_fat,
      chest: m.chest,
      waist: m.waist,
      hips: m.hips
    }));

  return (
    <div className="space-y-6">
      <Card className="holographic-card">
        <CardHeader>
          <CardTitle>Add New Measurement</CardTitle>
          <CardDescription>
            Track your progress by regularly updating your measurements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg) *</Label>
              <Input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Required"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bodyFat">Body Fat %</Label>
              <Input
                id="bodyFat"
                type="number"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                placeholder="Optional"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="chest">Chest (cm)</Label>
              <Input
                id="chest"
                type="number"
                value={chest}
                onChange={(e) => setChest(e.target.value)}
                placeholder="Optional"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="waist">Waist (cm)</Label>
              <Input
                id="waist"
                type="number"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                placeholder="Optional"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hips">Hips (cm)</Label>
              <Input
                id="hips"
                type="number"
                value={hips}
                onChange={(e) => setHips(e.target.value)}
                placeholder="Optional"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="arms">Arms (cm)</Label>
              <Input
                id="arms"
                type="number"
                value={arms}
                onChange={(e) => setArms(e.target.value)}
                placeholder="Optional"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="legs">Legs (cm)</Label>
              <Input
                id="legs"
                type="number"
                value={legs}
                onChange={(e) => setLegs(e.target.value)}
                placeholder="Optional"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional: add any relevant information"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleAddMeasurement} 
            disabled={submitting || !weight}
            className="w-full bg-quantum-cyan hover:bg-quantum-cyan/90"
          >
            {submitting ? 'Adding...' : 'Add Measurement'}
          </Button>
        </CardFooter>
      </Card>

      {chartData.length > 0 && (
        <Card className="holographic-card">
          <CardHeader>
            <CardTitle>Weight Progress</CardTitle>
            <CardDescription>
              Track your weight changes over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#111', 
                      border: '1px solid #333',
                      color: '#fff' 
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#00ffff" 
                    activeDot={{ r: 8 }} 
                    name="Weight (kg)"
                  />
                  {chartData.some(d => d.bodyFat) && (
                    <Line 
                      type="monotone" 
                      dataKey="bodyFat" 
                      stroke="#ff00ff" 
                      name="Body Fat %"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {measurements.length > 0 && (
        <Card className="holographic-card overflow-hidden">
          <CardHeader>
            <CardTitle>Measurement History</CardTitle>
            <CardDescription>
              Your recorded measurements over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-right">Weight</th>
                    <th className="px-4 py-2 text-right">Body Fat</th>
                    <th className="px-4 py-2 text-right">Chest</th>
                    <th className="px-4 py-2 text-right">Waist</th>
                    <th className="px-4 py-2 text-right">Hips</th>
                    <th className="px-4 py-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.map((m) => (
                    <tr key={m.id} className="border-b border-gray-800 hover:bg-gray-900/30">
                      <td className="px-4 py-2">
                        <div>{new Date(m.date).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">{formatDistanceToNow(new Date(m.date), { addSuffix: true })}</div>
                      </td>
                      <td className="px-4 py-2 text-right">{m.weight} kg</td>
                      <td className="px-4 py-2 text-right">{m.body_fat ? `${m.body_fat}%` : '-'}</td>
                      <td className="px-4 py-2 text-right">{m.chest ? `${m.chest} cm` : '-'}</td>
                      <td className="px-4 py-2 text-right">{m.waist ? `${m.waist} cm` : '-'}</td>
                      <td className="px-4 py-2 text-right">{m.hips ? `${m.hips} cm` : '-'}</td>
                      <td className="px-4 py-2">{m.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {measurements.length === 0 && (
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="pt-6 text-center">
            <p>No measurement history found. Add your first measurement to start tracking your progress.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MeasurementsHistory;
