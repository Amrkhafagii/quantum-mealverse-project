import { supabase } from '@/integrations/supabase/client';

export interface ExportOptions {
  userId: string;
  exportType: 'full' | 'plans' | 'logs' | 'progress';
  fileFormat: 'json' | 'csv' | 'pdf';
  dateRangeStart?: string;
  dateRangeEnd?: string;
}

export const generateWorkoutDataExport = async (options: ExportOptions) => {
  const { userId, exportType, fileFormat, dateRangeStart, dateRangeEnd } = options;

  let data: any = {};

  try {
    // Fetch data based on export type
    switch (exportType) {
      case 'full':
        data = await fetchAllUserData(userId, dateRangeStart, dateRangeEnd);
        break;
      case 'plans':
        data = await fetchWorkoutPlans(userId);
        break;
      case 'logs':
        data = await fetchWorkoutLogs(userId, dateRangeStart, dateRangeEnd);
        break;
      case 'progress':
        data = await fetchProgressData(userId, dateRangeStart, dateRangeEnd);
        break;
    }

    // Format data based on file format
    switch (fileFormat) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return convertToCSV(data, exportType);
      case 'pdf':
        return generatePDFReport(data, exportType);
      default:
        return JSON.stringify(data, null, 2);
    }
  } catch (error) {
    console.error('Error generating export:', error);
    throw error;
  }
};

const fetchAllUserData = async (userId: string, startDate?: string, endDate?: string) => {
  const [plans, logs, progress, goals, preferences] = await Promise.all([
    fetchWorkoutPlans(userId),
    fetchWorkoutLogs(userId, startDate, endDate),
    fetchProgressData(userId, startDate, endDate),
    fetchWorkoutGoals(userId),
    fetchUserPreferences(userId)
  ]);

  return {
    workout_plans: plans,
    workout_logs: logs,
    exercise_progress: progress,
    workout_goals: goals,
    user_preferences: preferences,
    exported_at: new Date().toISOString()
  };
};

const fetchWorkoutPlans = async (userId: string) => {
  const { data, error } = await supabase
    .from('workout_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

const fetchWorkoutLogs = async (userId: string, startDate?: string, endDate?: string) => {
  let query = supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId);

  if (startDate) {
    query = query.gte('date', startDate);
  }
  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query.order('date', { ascending: false });

  if (error) throw error;
  return data || [];
};

const fetchProgressData = async (userId: string, startDate?: string, endDate?: string) => {
  let query = supabase
    .from('exercise_progress')
    .select('*')
    .eq('user_id', userId);

  if (startDate) {
    query = query.gte('recorded_date', startDate);
  }
  if (endDate) {
    query = query.lte('recorded_date', endDate);
  }

  const { data, error } = await query.order('recorded_date', { ascending: false });

  if (error) throw error;
  return data || [];
};

const fetchWorkoutGoals = async (userId: string) => {
  const { data, error } = await supabase
    .from('workout_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

const fetchUserPreferences = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_workout_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

const convertToCSV = (data: any, exportType: string): string => {
  if (!data || typeof data !== 'object') return '';

  // Handle different data structures based on export type
  let csvData: any[] = [];
  
  switch (exportType) {
    case 'plans':
      csvData = Array.isArray(data) ? data : data.workout_plans || [];
      break;
    case 'logs':
      csvData = Array.isArray(data) ? data : data.workout_logs || [];
      break;
    case 'progress':
      csvData = Array.isArray(data) ? data : data.exercise_progress || [];
      break;
    case 'full':
      // For full export, create a summary CSV
      return createSummaryCSV(data);
    default:
      csvData = Array.isArray(data) ? data : [];
  }

  if (csvData.length === 0) return 'No data available';

  // Get headers from first object
  const headers = Object.keys(csvData[0]);
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value).replace(/"/g, '""');
        }
        return `"${String(value || '').replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

  return csvContent;
};

const createSummaryCSV = (data: any): string => {
  const summary = [
    ['Data Type', 'Count', 'Date Range'],
    ['Workout Plans', data.workout_plans?.length || 0, 'All time'],
    ['Workout Logs', data.workout_logs?.length || 0, getDateRange(data.workout_logs)],
    ['Exercise Progress Records', data.exercise_progress?.length || 0, getDateRange(data.exercise_progress, 'recorded_date')],
    ['Workout Goals', data.workout_goals?.length || 0, 'All time']
  ];

  return summary.map(row => row.join(',')).join('\n');
};

const getDateRange = (data: any[], dateField: string = 'date'): string => {
  if (!data || data.length === 0) return 'No data';
  
  const dates = data.map(item => new Date(item[dateField])).filter(date => !isNaN(date.getTime()));
  if (dates.length === 0) return 'No valid dates';
  
  const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
  const latest = new Date(Math.max(...dates.map(d => d.getTime())));
  
  return `${earliest.toLocaleDateString()} - ${latest.toLocaleDateString()}`;
};

const generatePDFReport = (data: any, exportType: string): string => {
  // In a real implementation, this would generate a PDF using a library like jsPDF
  // For now, return a formatted text report
  let report = `WORKOUT DATA REPORT\n`;
  report += `Generated: ${new Date().toLocaleString()}\n`;
  report += `Export Type: ${exportType.toUpperCase()}\n`;
  report += `\n${'='.repeat(50)}\n\n`;

  switch (exportType) {
    case 'plans':
      report += generatePlansReport(Array.isArray(data) ? data : data.workout_plans || []);
      break;
    case 'logs':
      report += generateLogsReport(Array.isArray(data) ? data : data.workout_logs || []);
      break;
    case 'progress':
      report += generateProgressReport(Array.isArray(data) ? data : data.exercise_progress || []);
      break;
    case 'full':
      report += generateFullReport(data);
      break;
  }

  return report;
};

const generatePlansReport = (plans: any[]): string => {
  let report = `WORKOUT PLANS (${plans.length})\n\n`;
  
  plans.forEach((plan, index) => {
    report += `${index + 1}. ${plan.name}\n`;
    report += `   Goal: ${plan.goal}\n`;
    report += `   Difficulty: ${plan.difficulty}\n`;
    report += `   Frequency: ${plan.frequency}x per week\n`;
    report += `   Created: ${new Date(plan.created_at).toLocaleDateString()}\n\n`;
  });

  return report;
};

const generateLogsReport = (logs: any[]): string => {
  let report = `WORKOUT LOGS (${logs.length})\n\n`;
  
  const totalDuration = logs.reduce((sum, log) => sum + (log.duration || 0), 0);
  const totalCalories = logs.reduce((sum, log) => sum + (log.calories_burned || 0), 0);
  
  report += `SUMMARY:\n`;
  report += `Total Workouts: ${logs.length}\n`;
  report += `Total Duration: ${totalDuration} minutes\n`;
  report += `Total Calories: ${totalCalories}\n`;
  report += `Average Duration: ${Math.round(totalDuration / logs.length)} minutes\n\n`;

  report += `RECENT WORKOUTS:\n`;
  logs.slice(0, 10).forEach((log, index) => {
    report += `${index + 1}. ${new Date(log.date).toLocaleDateString()}\n`;
    report += `   Duration: ${log.duration || 0} minutes\n`;
    report += `   Calories: ${log.calories_burned || 0}\n\n`;
  });

  return report;
};

const generateProgressReport = (progress: any[]): string => {
  let report = `EXERCISE PROGRESS (${progress.length} records)\n\n`;
  
  const exerciseGroups = progress.reduce((groups, record) => {
    const name = record.exercise_name;
    if (!groups[name]) groups[name] = [];
    groups[name].push(record);
    return groups;
  }, {} as Record<string, any[]>);

  Object.entries(exerciseGroups).forEach(([exercise, records]) => {
    const sortedRecords = Array.isArray(records) ? records : [];
    const latest = sortedRecords.sort((a, b) => new Date(b.recorded_date).getTime() - new Date(a.recorded_date).getTime())[0];
    const earliest = sortedRecords.sort((a, b) => new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime())[0];
    
    report += `${exercise}:\n`;
    report += `  Records: ${sortedRecords.length}\n`;
    report += `  Current Max Weight: ${latest?.max_weight || 0}kg\n`;
    report += `  Starting Weight: ${earliest?.max_weight || 0}kg\n`;
    report += `  Progress: +${((latest?.max_weight || 0) - (earliest?.max_weight || 0))}kg\n\n`;
  });

  return report;
};

const generateFullReport = (data: any): string => {
  let report = `COMPLETE WORKOUT DATA REPORT\n\n`;
  
  report += generatePlansReport(data.workout_plans || []);
  report += `\n${'='.repeat(50)}\n\n`;
  report += generateLogsReport(data.workout_logs || []);
  report += `\n${'='.repeat(50)}\n\n`;
  report += generateProgressReport(data.exercise_progress || []);

  return report;
};
