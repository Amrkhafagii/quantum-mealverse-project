
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Download, FileText, FileSpreadsheet, CalendarIcon, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface ExportRecord {
  id: string;
  export_type: string;
  file_format: string;
  status: string;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

export const WorkoutDataExport: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exportType, setExportType] = useState<'full' | 'plans' | 'logs' | 'progress'>('full');
  const [fileFormat, setFileFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [isExporting, setIsExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchExportHistory();
  }, [user]);

  const fetchExportHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('workout_data_exports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setExportHistory(data || []);
    } catch (error) {
      console.error('Error fetching export history:', error);
    }
  };

  const startExport = async () => {
    if (!user) return;

    setIsExporting(true);

    try {
      const exportData = {
        user_id: user.id,
        export_type: exportType,
        file_format: fileFormat,
        date_range_start: dateRange.from?.toISOString().split('T')[0] || null,
        date_range_end: dateRange.to?.toISOString().split('T')[0] || null,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('workout_data_exports')
        .insert(exportData)
        .select()
        .single();

      if (error) throw error;

      // Simulate export processing (in a real app, this would be handled by a background job)
      await simulateExportProcessing(data.id);

      toast({
        title: "Export started!",
        description: "Your workout data export is being processed. You'll be notified when it's ready.",
      });

      fetchExportHistory();
    } catch (error) {
      console.error('Error starting export:', error);
      toast({
        title: "Export failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const simulateExportProcessing = async (exportId: string) => {
    // Simulate processing time
    setTimeout(async () => {
      try {
        await supabase
          .from('workout_data_exports')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            file_path: `/exports/${exportId}.${fileFormat}`
          })
          .eq('id', exportId);

        fetchExportHistory();
      } catch (error) {
        console.error('Error updating export status:', error);
      }
    }, 3000);
  };

  const downloadExport = (exportRecord: ExportRecord) => {
    // In a real app, this would download the actual file
    toast({
      title: "Download started",
      description: `Downloading ${exportRecord.export_type} data as ${exportRecord.file_format.toUpperCase()}`,
    });
  };

  const getExportTypeDescription = (type: string) => {
    switch (type) {
      case 'full':
        return 'Complete workout data including plans, logs, and progress';
      case 'plans':
        return 'Workout plans and templates';
      case 'logs':
        return 'Workout session logs and performance data';
      case 'progress':
        return 'Exercise progress and measurements';
      default:
        return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getFileIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-quantum-cyan" />
            Export Workout Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Export Type
              </label>
              <Select value={exportType} onValueChange={(value: any) => setExportType(value)}>
                <SelectTrigger className="bg-quantum-black/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Complete Data</SelectItem>
                  <SelectItem value="plans">Workout Plans</SelectItem>
                  <SelectItem value="logs">Workout Logs</SelectItem>
                  <SelectItem value="progress">Progress Data</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400 mt-1">
                {getExportTypeDescription(exportType)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                File Format
              </label>
              <Select value={fileFormat} onValueChange={(value: any) => setFileFormat(value)}>
                <SelectTrigger className="bg-quantum-black/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Date Range (Optional)
            </label>
            <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`
                    ) : (
                      format(dateRange.from, "MMM dd, yyyy")
                    )
                  ) : (
                    "All time"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => setDateRange(range || {})}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button
            onClick={startExport}
            disabled={isExporting}
            className="w-full bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
          >
            {isExporting ? 'Starting Export...' : 'Start Export'}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle>Export History</CardTitle>
        </CardHeader>
        <CardContent>
          {exportHistory.length === 0 ? (
            <div className="text-center py-8">
              <Download className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No exports yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {exportHistory.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-quantum-black/40 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(record.file_format)}
                    <div>
                      <div className="font-medium">
                        {record.export_type.replace('_', ' ').toUpperCase()} Export
                      </div>
                      <div className="text-sm text-gray-400">
                        {format(new Date(record.created_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                    
                    {record.status === 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadExport(record)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {record.status === 'processing' && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-quantum-cyan"></div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
