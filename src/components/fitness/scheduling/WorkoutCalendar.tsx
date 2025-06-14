import React, { useState, useEffect } from 'react';
import type { CalendarEvent } from '@/types/fitness';

interface WorkoutCalendarProps {
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onCreateSchedule?: () => void;
}

export const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({
  onDateSelect,
  onEventClick,
  onCreateSchedule
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { getCalendarEvents, fetchSessions } = useWorkoutScheduling();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const events = getCalendarEvents(
    format(calendarStart, 'yyyy-MM-dd'),
    format(calendarEnd, 'yyyy-MM-dd')
  );

  useEffect(() => {
    fetchSessions(
      format(calendarStart, 'yyyy-MM-dd'),
      format(calendarEnd, 'yyyy-MM-dd')
    );
  }, [currentDate, fetchSessions]);

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'skipped': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-quantum-cyan';
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5 text-quantum-cyan" />
            Workout Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium min-w-[140px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={onCreateSchedule}
              className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black ml-2"
            >
              <Plus className="h-4 w-4 mr-1" />
              Schedule
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-400 p-2">
              {day}
            </div>
          ))}
          
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            return (
              <motion.div
                key={day.toISOString()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                className={`
                  relative p-2 min-h-[80px] border border-quantum-cyan/10 rounded-lg cursor-pointer
                  transition-colors hover:border-quantum-cyan/30
                  ${isCurrentMonth ? 'bg-quantum-black/20' : 'bg-quantum-black/10 opacity-50'}
                  ${isSelected ? 'border-quantum-cyan bg-quantum-cyan/10' : ''}
                  ${isToday ? 'ring-1 ring-quantum-purple' : ''}
                `}
                onClick={() => handleDateClick(day)}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-quantum-purple' : ''}`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <motion.div
                      key={event.id}
                      whileHover={{ scale: 1.02 }}
                      className={`
                        text-xs p-1 rounded cursor-pointer
                        ${getStatusColor(event.status)} text-white
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                    >
                      <div className="truncate font-medium">{event.title}</div>
                      {event.time && (
                        <div className="text-xs opacity-80">{event.time}</div>
                      )}
                    </motion.div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-400">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-quantum-cyan/20">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-quantum-cyan"></div>
            <span className="text-xs">Scheduled</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span className="text-xs">In Progress</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-xs">Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gray-500"></div>
            <span className="text-xs">Skipped</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
