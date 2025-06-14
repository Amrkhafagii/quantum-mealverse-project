
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, FileText, Calendar } from 'lucide-react';

export interface WorkoutDataExport {
  id: string;
  workout_data_exports_user_id: string;
  export_type: 'full' | 'progress' | 'plans' | 'logs';
  file_format: 'json' | 'csv' | 'pdf';
  date_range_start: string;
  date_range_end: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_path?: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export const WorkoutDataExport: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exportType, setExportType] = useState<'full' | 'progress' | 'plans' | 'logs'>('full');
  const [fileFormat, setFileFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to export your data",
        variant: "destructive"
      });
      return;
    }

    if (!dateRangeStart || !dateRangeEnd) {
      toast({
        title: "Date range required",
        description: "Please select both start and end dates",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);

    try {
      const { data, error } = await supabase
        .from('workout_data_exports')
        .insert({
          workout_data_exports_user_id: user.id,
          export_type: exportType,
          file_format: fileFormat,
          date_range_start: dateRangeStart,
          date_range_end: dateRangeEnd,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Export requested",
        description: "Your data export has been queued for processing. You'll receive a notification when it's ready.",
      });

      // Reset form
      setExportType('full');
      setFileFormat('json');
      setDateRangeStart('');
      setDateRangeEnd('');

    } catch (error) {
      console.error('Error requesting export:', error);
      toast({
        title: "Export failed",
        description: "There was an error requesting your data export. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="bg-quantum-black/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="text-quantum-cyan flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Workout Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Export Type</label>
            <Select value={exportType} onValueChange={(value: any) => setExportType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select export type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Complete Data</SelectItem>
                <SelectItem value="progress">Progress Only</SelectItem>
                <SelectItem value="plans">Workout Plans</SelectItem>
                <SelectItem value="logs">Workout Logs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">File Format</label>
            <Select value={fileFormat} onValueChange={(value: any) => setFileFormat(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={dateRangeStart}
              onChange={(e) => setDateRangeStart(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-quantum-cyan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={dateRangeEnd}
              onChange={(e) => setDateRangeEnd(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-quantum-cyan"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-400">
            <FileText className="inline h-4 w-4 mr-1" />
            Export includes workouts, progress, and achievements
          </div>
          
          <Button 
            onClick={handleExport}
            disabled={isExporting}
            className="bg-quantum-purple hover:bg-quantum-purple/90"
          >
            {isExporting ? 'Processing...' : 'Export Data'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
