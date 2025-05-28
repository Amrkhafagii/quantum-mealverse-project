
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Coffee, Clock, Pause } from 'lucide-react';
import type { DeliveryBreakSetting, BreakStatus } from '@/types/availability';

interface BreakTimeSettingsProps {
  breakSettings: DeliveryBreakSetting[];
  currentBreakStatus: BreakStatus;
  createBreakSetting: (setting: Omit<DeliveryBreakSetting, 'id' | 'created_at' | 'updated_at'>) => Promise<DeliveryBreakSetting | undefined>;
  startBreak: (breakType: string, breakSettingId?: string, location?: { latitude: number; longitude: number }) => Promise<void>;
  isProcessing: boolean;
}

const BREAK_TYPES = [
  { value: 'short_break', label: 'Short Break', icon: <Pause className="h-4 w-4" /> },
  { value: 'lunch_break', label: 'Lunch Break', icon: <Coffee className="h-4 w-4" /> },
  { value: 'custom_break', label: 'Custom Break', icon: <Clock className="h-4 w-4" /> }
];

export const BreakTimeSettings: React.FC<BreakTimeSettingsProps> = ({
  breakSettings,
  currentBreakStatus,
  createBreakSetting,
  startBreak,
  isProcessing
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBreakSetting, setNewBreakSetting] = useState({
    break_type: 'short_break' as const,
    duration_minutes: 15,
    scheduled_time: '',
    is_flexible: true,
    max_break_count_per_day: 1,
    minimum_interval_between_breaks_minutes: 120,
    auto_break_reminder: false
  });

  const handleCreateBreakSetting = async () => {
    const setting = await createBreakSetting({
      delivery_user_id: '', // Will be set by the service
      break_type: newBreakSetting.break_type,
      duration_minutes: newBreakSetting.duration_minutes,
      scheduled_time: newBreakSetting.scheduled_time ? newBreakSetting.scheduled_time + ':00' : undefined,
      is_flexible: newBreakSetting.is_flexible,
      max_break_count_per_day: newBreakSetting.max_break_count_per_day,
      minimum_interval_between_breaks_minutes: newBreakSetting.minimum_interval_between_breaks_minutes,
      auto_break_reminder: newBreakSetting.auto_break_reminder,
      is_active: true
    });

    if (setting) {
      setShowAddForm(false);
      setNewBreakSetting({
        break_type: 'short_break',
        duration_minutes: 15,
        scheduled_time: '',
        is_flexible: true,
        max_break_count_per_day: 1,
        minimum_interval_between_breaks_minutes: 120,
        auto_break_reminder: false
      });
    }
  };

  const handleStartBreak = async (breakType: string, breakSettingId?: string) => {
    await startBreak(breakType, breakSettingId);
  };

  const getBreakTypeInfo = (breakType: string) => {
    return BREAK_TYPES.find(type => type.value === breakType) || BREAK_TYPES[0];
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'Flexible';
    return timeString.slice(0, 5); // Remove seconds
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Break Time Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure your break schedules and preferences
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Break Setting
        </Button>
      </div>

      {/* Current Break Status */}
      {currentBreakStatus.is_on_break && (
        <Card className="border border-yellow-500/20 bg-yellow-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Coffee className="h-5 w-5 text-yellow-500" />
                <div>
                  <div className="font-medium">Currently on Break</div>
                  <div className="text-sm text-muted-foreground">
                    Type: {currentBreakStatus.break_type}
                  </div>
                  {currentBreakStatus.estimated_end_time && (
                    <div className="text-sm text-muted-foreground">
                      Estimated end: {new Date(currentBreakStatus.estimated_end_time).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showAddForm && (
        <Card className="border border-quantum-cyan/20 bg-transparent">
          <CardHeader>
            <CardTitle>Add Break Setting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Break Type</Label>
                <Select
                  value={newBreakSetting.break_type}
                  onValueChange={(value: any) => setNewBreakSetting({ ...newBreakSetting, break_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BREAK_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  min="5"
                  max="120"
                  value={newBreakSetting.duration_minutes}
                  onChange={(e) => setNewBreakSetting({ ...newBreakSetting, duration_minutes: parseInt(e.target.value) || 15 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Scheduled Time (Optional)</Label>
                <Input
                  type="time"
                  value={newBreakSetting.scheduled_time}
                  onChange={(e) => setNewBreakSetting({ ...newBreakSetting, scheduled_time: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Leave empty for flexible timing</p>
              </div>

              <div className="space-y-2">
                <Label>Max Breaks per Day</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={newBreakSetting.max_break_count_per_day}
                  onChange={(e) => setNewBreakSetting({ ...newBreakSetting, max_break_count_per_day: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Flexible Timing</Label>
                  <p className="text-sm text-muted-foreground">Allow taking breaks at any time within work hours</p>
                </div>
                <Switch
                  checked={newBreakSetting.is_flexible}
                  onCheckedChange={(checked) => setNewBreakSetting({ ...newBreakSetting, is_flexible: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Break Reminders</Label>
                  <p className="text-sm text-muted-foreground">Get notifications when it's time for a break</p>
                </div>
                <Switch
                  checked={newBreakSetting.auto_break_reminder}
                  onCheckedChange={(checked) => setNewBreakSetting({ ...newBreakSetting, auto_break_reminder: checked })}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateBreakSetting} disabled={isProcessing}>
                Save Break Setting
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {breakSettings.length === 0 ? (
          <Card className="border border-quantum-cyan/20 bg-transparent">
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <Coffee className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No break settings configured</p>
                <p className="text-sm">Add your first break setting to get started</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          breakSettings.map((setting) => {
            const typeInfo = getBreakTypeInfo(setting.break_type);
            return (
              <Card key={setting.id} className="border border-quantum-cyan/20 bg-transparent">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {typeInfo.icon}
                        <div>
                          <div className="font-medium">{typeInfo.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {setting.duration_minutes} minutes
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Time: {formatTime(setting.scheduled_time)} | Max per day: {setting.max_break_count_per_day}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={setting.is_flexible ? 'default' : 'secondary'}>
                          {setting.is_flexible ? 'Flexible' : 'Scheduled'}
                        </Badge>
                        {setting.auto_break_reminder && (
                          <Badge variant="outline">Reminders</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!currentBreakStatus.is_on_break && (
                        <Button
                          size="sm"
                          onClick={() => handleStartBreak(setting.break_type, setting.id)}
                          disabled={isProcessing}
                        >
                          Start Break
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
