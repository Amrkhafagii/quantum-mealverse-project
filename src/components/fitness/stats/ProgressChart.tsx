
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DataPoint {
  date: string;
  value: number;
  [key: string]: any;
}

interface ProgressChartProps {
  title: string;
  data: DataPoint[];
  dataKey: string;
  unit?: string;
  color?: string;
  showSelect?: boolean;
  timeRanges?: { label: string; value: string }[];
  onRangeChange?: (range: string) => void;
  selectedRange?: string;
  yAxisDomain?: [number, number] | 'auto';
}

const ProgressChart: React.FC<ProgressChartProps> = ({
  title,
  data,
  dataKey,
  unit = '',
  color = '#9b87f5',
  showSelect = true,
  timeRanges = [
    { label: '1W', value: '1w' },
    { label: '1M', value: '1m' },
    { label: '3M', value: '3m' },
    { label: '1Y', value: '1y' },
    { label: 'All', value: 'all' },
  ],
  onRangeChange,
  selectedRange = '1m',
  yAxisDomain = 'auto',
}) => {
  const formatTooltipDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return format(date, 'MMM dd, yyyy');
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as DataPoint;

      return (
        <div className="bg-quantum-darkBlue/90 p-3 border border-quantum-cyan/20 rounded-md shadow-lg">
          <p className="text-sm font-medium">{formatTooltipDate(dataPoint.date)}</p>
          <p className="text-sm text-quantum-cyan">
            {dataPoint.value} {unit}
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        {showSelect && onRangeChange && (
          <Select value={selectedRange} onValueChange={onRangeChange}>
            <SelectTrigger className="w-[100px] h-8">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="date"
                tickFormatter={(timestamp) => format(new Date(timestamp), 'MMM dd')}
                tick={{ fill: '#888', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                domain={yAxisDomain === 'auto' ? ['dataMin - 5', 'dataMax + 5'] : yAxisDomain}
                tick={{ fill: '#888', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                dot={{ strokeWidth: 2, r: 4, stroke: color, fill: '#1A1A2E' }}
                activeDot={{ r: 6, strokeWidth: 0, fill: color }}
                name={title}
                fillOpacity={0.2}
                fill="url(#colorValue)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressChart;
