import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserMeasurement } from '@/types/fitness/profile';
import ProgressChart from './ProgressChart';
import { format, subMonths } from 'date-fns';

interface ProgressAnalyticsProps {
  userId?: string;
  measurements?: UserMeasurement[];
}

const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ userId, measurements = [] }) => {
  const [timeframe, setTimeframe] = useState<'1m' | '3m' | '6m' | '1y' | 'all'>('3m');
  const [filteredMeasurements, setFilteredMeasurements] = useState<UserMeasurement[]>([]);
  
  useEffect(() => {
    if (measurements.length === 0) return;
    
    const now = new Date();
    let cutoffDate: Date;
    
    switch (timeframe) {
      case '1m':
        cutoffDate = subMonths(now, 1);
        break;
      case '3m':
        cutoffDate = subMonths(now, 3);
        break;
      case '6m':
        cutoffDate = subMonths(now, 6);
        break;
      case '1y':
        cutoffDate = subMonths(now, 12);
        break;
      default:
        // "all" timeframe - no filtering
        setFilteredMeasurements([...measurements].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ));
        return;
    }
    
    const filtered = measurements.filter(m => 
      new Date(m.date) >= cutoffDate
    ).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    setFilteredMeasurements(filtered);
  }, [measurements, timeframe]);

  // Calculate changes
  const getChange = (property: keyof UserMeasurement) => {
    if (filteredMeasurements.length < 2) return null;
    
    const oldest = filteredMeasurements[0][property] as number;
    const newest = filteredMeasurements[filteredMeasurements.length - 1][property] as number;
    
    if (typeof oldest !== 'number' || typeof newest !== 'number') return null;
    return newest - oldest;
  };
  
  const weightChange = getChange('weight');
  const bodyFatChange = getChange('body_fat');
  const waistChange = getChange('waist');
  
  const renderChangeValue = (value: number | null, unit: string) => {
    if (value === null) return 'No data';
    
    const formattedValue = Math.abs(value).toFixed(1);
    const prefix = value > 0 ? '+' : value < 0 ? '-' : '';
    return `${prefix}${formattedValue}${unit}`;
  };
  
  const getChangeClass = (value: number | null, isPositiveGood = false) => {
    if (value === null) return 'text-gray-400';
    
    // For weight and waist, negative is generally considered good
    // For muscle measurements, positive is generally considered good
    const isGood = isPositiveGood ? value > 0 : value < 0;
    
    return isGood ? 'text-green-400' : value === 0 ? 'text-gray-300' : 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-quantum-darkBlue/30 border border-quantum-cyan/20">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-quantum-cyan">Progress Analytics</CardTitle>
            <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)} className="max-w-xs">
              <TabsList className="bg-quantum-black/50">
                <TabsTrigger value="1m">1M</TabsTrigger>
                <TabsTrigger value="3m">3M</TabsTrigger>
                <TabsTrigger value="6m">6M</TabsTrigger>
                <TabsTrigger value="1y">1Y</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMeasurements.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400">No measurement data available for this timeframe</p>
              <p className="text-gray-500 text-sm mt-2">Add measurements to see your progress</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-quantum-black/50 border border-quantum-purple/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-gray-400 mb-1">Weight Change</p>
                      <p className={`text-2xl font-bold ${getChangeClass(weightChange)}`}>
                        {renderChangeValue(weightChange, ' kg')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-quantum-black/50 border border-quantum-purple/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-gray-400 mb-1">Body Fat Change</p>
                      <p className={`text-2xl font-bold ${getChangeClass(bodyFatChange)}`}>
                        {renderChangeValue(bodyFatChange, '%')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-quantum-black/50 border border-quantum-purple/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-gray-400 mb-1">Waist Change</p>
                      <p className={`text-2xl font-bold ${getChangeClass(waistChange)}`}>
                        {renderChangeValue(waistChange, ' cm')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Tabs defaultValue="weight" className="mt-6">
                <TabsList className="bg-quantum-black/50">
                  <TabsTrigger value="weight">Weight</TabsTrigger>
                  <TabsTrigger value="body_fat">Body Fat</TabsTrigger>
                  <TabsTrigger value="measurements">Measurements</TabsTrigger>
                </TabsList>
                
                <TabsContent value="weight" className="mt-4">
                  <ProgressChart 
                    data={filteredMeasurements} 
                    dataKey="weight"
                    label="Weight (kg)"
                    color="#4f46e5"
                  />
                </TabsContent>
                
                <TabsContent value="body_fat" className="mt-4">
                  <ProgressChart 
                    data={filteredMeasurements.filter(m => m.body_fat !== null && m.body_fat !== undefined)} 
                    dataKey="body_fat"
                    label="Body Fat (%)"
                    color="#06b6d4"
                  />
                </TabsContent>
                
                <TabsContent value="measurements" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2 text-gray-400">Chest (cm)</h3>
                      <ProgressChart 
                        data={filteredMeasurements.filter(m => m.chest !== null && m.chest !== undefined)} 
                        dataKey="chest"
                        hideLabel
                        color="#8b5cf6"
                        height={180}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2 text-gray-400">Waist (cm)</h3>
                      <ProgressChart 
                        data={filteredMeasurements.filter(m => m.waist !== null && m.waist !== undefined)} 
                        dataKey="waist"
                        hideLabel
                        color="#ec4899"
                        height={180}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2 text-gray-400">Hips (cm)</h3>
                      <ProgressChart 
                        data={filteredMeasurements.filter(m => m.hips !== null && m.hips !== undefined)} 
                        dataKey="hips"
                        hideLabel
                        color="#f59e0b"
                        height={180}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2 text-gray-400">Arms (cm)</h3>
                      <ProgressChart 
                        data={filteredMeasurements.filter(m => m.arms !== null && m.arms !== undefined)} 
                        dataKey="arms"
                        hideLabel
                        color="#10b981"
                        height={180}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressAnalytics;
