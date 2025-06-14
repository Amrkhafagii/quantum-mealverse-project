import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { UserMeasurement } from '@/types/fitness/profile';
import { LineChart, Scale, Trash } from 'lucide-react';
import ProgressChart from '../stats/ProgressChart';

interface MeasurementsHistoryProps {
  userId?: string;
  measurements: UserMeasurement[];
  onDeleteMeasurement?: (id: string) => void;
}

const MeasurementsHistory: React.FC<MeasurementsHistoryProps> = ({
  userId,
  measurements,
  onDeleteMeasurement
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Prepare data for chart
  const weightChartData = measurements
    .filter(m => m.weight)
    .map(m => ({
      date: m.date,
      value: m.weight
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const bodyFatChartData = measurements
    .filter(m => m.body_fat !== undefined)
    .map(m => ({
      date: m.date,
      value: m.body_fat || 0
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-quantum-cyan">
            <Scale className="h-5 w-5 mr-2" />
            Measurement History
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant={viewMode === 'table' ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('table')}
              className="text-xs"
            >
              Table
            </Button>
            <Button 
              variant={viewMode === 'chart' ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('chart')}
              className="text-xs"
            >
              <LineChart className="h-4 w-4 mr-1" />
              Chart
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {measurements.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No measurement data yet. Add your first measurement to track your progress.
          </div>
        ) : viewMode === 'table' ? (
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Weight (kg)</TableHead>
                  <TableHead>Body Fat %</TableHead>
                  <TableHead>Waist (cm)</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {measurements
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((measurement) => (
                    <TableRow key={measurement.id}>
                      <TableCell>{formatDate(measurement.date)}</TableCell>
                      <TableCell>{measurement.weight}</TableCell>
                      <TableCell>{measurement.body_fat || '-'}</TableCell>
                      <TableCell>{measurement.waist || '-'}</TableCell>
                      <TableCell>
                        {onDeleteMeasurement && (
                          <Button variant="ghost" size="icon" onClick={() => onDeleteMeasurement(measurement.id)}>
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <div className="space-y-6">
            {weightChartData.length > 0 && (
              <ProgressChart
                title="Weight Progress"
                data={weightChartData}
                dataKey="value"
                unit="kg"
                color="#9b87f5"
                showSelect={false}
              />
            )}
            
            {bodyFatChartData.length > 0 && (
              <ProgressChart
                title="Body Fat % Progress"
                data={bodyFatChartData}
                dataKey="value"
                unit="%"
                color="#F97316"
                showSelect={false}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MeasurementsHistory;
