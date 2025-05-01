
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserMeasurement } from '@/types/fitness';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import MeasurementForm from './MeasurementForm';

export interface MeasurementsHistoryProps {
  userId?: string;
  measurements?: UserMeasurement[];
  onMeasurementAdded?: () => Promise<void> | void;
}

const MeasurementsHistory: React.FC<MeasurementsHistoryProps> = ({ userId, measurements: propMeasurements, onMeasurementAdded }) => {
  const [measurements, setMeasurements] = useState<UserMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const loadMeasurements = async () => {
    if (!userId) {
      setMeasurements([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_measurements')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      setMeasurements(data || []);
    } catch (error: any) {
      console.error('Error loading measurements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load measurement history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If measurements are provided as prop, use them
    if (propMeasurements) {
      setMeasurements(propMeasurements);
      setLoading(false);
    } else {
      // Otherwise, load from the database
      loadMeasurements();
    }
  }, [userId, propMeasurements]);

  const handleRefresh = () => {
    loadMeasurements();
  };

  const handleMeasurementAdded = () => {
    setAddDialogOpen(false);
    if (onMeasurementAdded) {
      onMeasurementAdded();
    } else {
      loadMeasurements();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-quantum-cyan">Measurements History</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-quantum-purple hover:bg-quantum-purple/90">
                <Plus className="h-4 w-4 mr-2" /> Add Measurement
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-quantum-darkBlue border-quantum-cyan/30 text-white max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-quantum-cyan text-2xl">Add New Measurement</DialogTitle>
              </DialogHeader>
              <MeasurementForm userId={userId} onMeasurementAdded={handleMeasurementAdded} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-quantum-darkBlue/30 border border-quantum-cyan/20">
        <CardContent className="p-0 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-quantum-cyan"></div>
            </div>
          ) : measurements.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No measurement history found</p>
              <p className="text-gray-500 text-sm mt-2">
                Start tracking your progress by adding your first measurement
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Weight (kg)</TableHead>
                  <TableHead>Body Fat %</TableHead>
                  <TableHead>Chest (cm)</TableHead>
                  <TableHead>Waist (cm)</TableHead>
                  <TableHead>Hips (cm)</TableHead>
                  <TableHead>Arms (cm)</TableHead>
                  <TableHead>Legs (cm)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {measurements.map((measurement) => (
                  <TableRow key={measurement.id}>
                    <TableCell>{formatDate(measurement.date)}</TableCell>
                    <TableCell>{measurement.weight}</TableCell>
                    <TableCell>{measurement.body_fat || '-'}</TableCell>
                    <TableCell>{measurement.chest || '-'}</TableCell>
                    <TableCell>{measurement.waist || '-'}</TableCell>
                    <TableCell>{measurement.hips || '-'}</TableCell>
                    <TableCell>{measurement.arms || '-'}</TableCell>
                    <TableCell>{measurement.legs || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MeasurementsHistory;
