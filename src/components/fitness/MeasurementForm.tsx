import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { UserMeasurement } from '@/types/fitness';
import { supabase } from '@/integrations/supabase/client';

interface MeasurementFormProps {
  userId?: string;
  onMeasurementAdded: () => void;
}

const MeasurementForm: React.FC<MeasurementFormProps> = ({ userId, onMeasurementAdded }) => {
  const [weight, setWeight] = useState<number | ''>('');
  const [bodyFat, setBodyFat] = useState<number | ''>('');
  const [chest, setChest] = useState<number | ''>('');
  const [waist, setWaist] = useState<number | ''>('');
  const [hips, setHips] = useState<number | ''>('');
  const [arms, setArms] = useState<number | ''>('');
  const [legs, setLegs] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to add measurements',
        variant: 'destructive',
      });
      return;
    }

    if (weight === '') {
      toast({
        title: 'Weight is required',
        description: 'Please enter your weight to continue',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      // Create a properly typed measurement object
      const measurement = {
        user_id: userId,
        weight: Number(weight),
        body_fat: bodyFat !== '' ? Number(bodyFat) : null,
        chest: chest !== '' ? Number(chest) : null,
        waist: waist !== '' ? Number(waist) : null,
        hips: hips !== '' ? Number(hips) : null,
        arms: arms !== '' ? Number(arms) : null,
        legs: legs !== '' ? Number(legs) : null,
        notes: notes || null,
      };

      const { error } = await supabase.from('user_measurements').insert(measurement);

      if (error) throw error;

      toast({
        title: 'Measurement added',
        description: 'Your measurements have been saved successfully',
      });

      // Reset form
      setWeight('');
      setBodyFat('');
      setChest('');
      setWaist('');
      setHips('');
      setLegs('');
      setNotes('');

      // Notify parent component
      onMeasurementAdded();
    } catch (error: any) {
      console.error('Error adding measurement:', error);
      toast({
        title: 'Error adding measurement',
        description: error.message || 'Failed to save your measurements',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="bg-quantum-darkBlue/30 border border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="text-quantum-cyan">Add New Measurements</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-white">Weight (kg) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                placeholder="70.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
                required
                className="bg-quantum-black/50 border-quantum-cyan/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bodyFat" className="text-white">Body Fat %</Label>
              <Input
                id="bodyFat"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="15.0"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value ? Number(e.target.value) : '')}
                className="bg-quantum-black/50 border-quantum-cyan/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chest" className="text-white">Chest (cm)</Label>
              <Input
                id="chest"
                type="number"
                step="0.1"
                min="0"
                placeholder="95.0"
                value={chest}
                onChange={(e) => setChest(e.target.value ? Number(e.target.value) : '')}
                className="bg-quantum-black/50 border-quantum-cyan/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waist" className="text-white">Waist (cm)</Label>
              <Input
                id="waist"
                type="number"
                step="0.1"
                min="0"
                placeholder="80.0"
                value={waist}
                onChange={(e) => setWaist(e.target.value ? Number(e.target.value) : '')}
                className="bg-quantum-black/50 border-quantum-cyan/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hips" className="text-white">Hips (cm)</Label>
              <Input
                id="hips"
                type="number"
                step="0.1"
                min="0"
                placeholder="90.0"
                value={hips}
                onChange={(e) => setHips(e.target.value ? Number(e.target.value) : '')}
                className="bg-quantum-black/50 border-quantum-cyan/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="arms" className="text-white">Arms (cm)</Label>
              <Input
                id="arms"
                type="number"
                step="0.1"
                min="0"
                placeholder="35.0"
                value={arms}
                onChange={(e) => setArms(e.target.value ? Number(e.target.value) : '')}
                className="bg-quantum-black/50 border-quantum-cyan/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legs" className="text-white">Legs (cm)</Label>
              <Input
                id="legs"
                type="number"
                step="0.1"
                min="0"
                placeholder="55.0"
                value={legs}
                onChange={(e) => setLegs(e.target.value ? Number(e.target.value) : '')}
                className="bg-quantum-black/50 border-quantum-cyan/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-white">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about your measurements"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-quantum-black/50 border-quantum-cyan/20 min-h-[100px]"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-quantum-purple hover:bg-quantum-purple/90"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Measurements'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MeasurementForm;
