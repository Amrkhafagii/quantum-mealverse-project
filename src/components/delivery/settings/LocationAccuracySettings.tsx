
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Shield, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import { useLocationAccuracy } from '@/hooks/useLocationAccuracy';
import type { LocationProvider } from '@/types/location-accuracy';

interface LocationAccuracySettingsProps {
  deliveryUserId: string;
}

export const LocationAccuracySettings: React.FC<LocationAccuracySettingsProps> = ({
  deliveryUserId
}) => {
  const {
    settings,
    qualityHistory,
    qualityStats,
    loading,
    isProcessing,
    updateSettings,
    updateAccuracyThreshold,
    updateConfidenceThreshold,
    setLocationProviders,
    toggleStrictEnforcement
  } = useLocationAccuracy(deliveryUserId);

  if (loading) {
    return (
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="text-quantum-cyan">Loading location accuracy settings...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardContent className="pt-6">
          <div className="text-center text-red-400">
            Failed to load location accuracy settings.
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleAccuracyThresholdChange = async (value: string) => {
    const threshold = parseFloat(value);
    if (!isNaN(threshold) && threshold > 0) {
      await updateAccuracyThreshold(threshold);
    }
  };

  const handleConfidenceThresholdChange = async (value: string) => {
    const threshold = parseFloat(value);
    if (!isNaN(threshold) && threshold >= 0 && threshold <= 1) {
      await updateConfidenceThreshold(threshold);
    }
  };

  const handleProviderChange = async (type: 'primary' | 'fallback', provider: LocationProvider) => {
    if (type === 'primary') {
      await setLocationProviders(provider, settings.fallback_provider);
    } else {
      await setLocationProviders(settings.primary_provider, provider);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quality Statistics */}
      {qualityStats && (
        <Card className="border border-quantum-cyan/20 bg-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Location Quality Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {qualityStats.valid_locations}
                </div>
                <div className="text-sm text-muted-foreground">Valid Locations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {qualityStats.invalid_locations}
                </div>
                <div className="text-sm text-muted-foreground">Invalid Locations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {qualityStats.avg_confidence_score.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Avg Confidence</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Accuracy Rate</span>
                <span>{((qualityStats.valid_locations / qualityStats.total_locations) * 100).toFixed(1)}%</span>
              </div>
              <Progress 
                value={(qualityStats.valid_locations / qualityStats.total_locations) * 100} 
                className="h-2"
              />
            </div>

            {qualityStats.most_common_errors.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Common Issues:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {qualityStats.most_common_errors.slice(0, 3).map((error, index) => (
                    <Badge key={index} variant="destructive">
                      {error.error} ({error.count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Minimum Accuracy Requirements */}
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Minimum Accuracy Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Minimum Accuracy Threshold (meters)</Label>
              <Input
                type="number"
                value={settings.minimum_accuracy_threshold}
                onChange={(e) => handleAccuracyThresholdChange(e.target.value)}
                disabled={isProcessing}
                min="1"
                step="0.1"
              />
              <p className="text-xs text-muted-foreground">
                Locations with accuracy worse than this threshold will be flagged
              </p>
            </div>

            <div className="space-y-2">
              <Label>Strict Enforcement</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.strict_accuracy_enforcement}
                  onCheckedChange={toggleStrictEnforcement}
                  disabled={isProcessing}
                />
                <span className="text-sm">
                  {settings.strict_accuracy_enforcement ? 'Reject' : 'Warn about'} low accuracy locations
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.reject_low_accuracy_locations}
              onCheckedChange={(checked) => updateSettings({ reject_low_accuracy_locations: checked })}
              disabled={isProcessing}
            />
            <Label>Automatically reject locations below accuracy threshold</Label>
          </div>
        </CardContent>
      </Card>

      {/* Location Validation Settings */}
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Location Validation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.enable_location_validation}
              onCheckedChange={(checked) => updateSettings({ enable_location_validation: checked })}
              disabled={isProcessing}
            />
            <Label>Enable comprehensive location validation</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.validate_speed_consistency}
                  onCheckedChange={(checked) => updateSettings({ validate_speed_consistency: checked })}
                  disabled={isProcessing}
                />
                <Label>Validate speed consistency</Label>
              </div>
              <Input
                type="number"
                value={settings.max_speed_threshold_mps}
                onChange={(e) => updateSettings({ max_speed_threshold_mps: parseFloat(e.target.value) })}
                disabled={isProcessing || !settings.validate_speed_consistency}
                min="0"
                step="0.1"
              />
              <p className="text-xs text-muted-foreground">
                Maximum speed in m/s (current: {(settings.max_speed_threshold_mps * 3.6).toFixed(1)} km/h)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.validate_distance_jumps}
                  onCheckedChange={(checked) => updateSettings({ validate_distance_jumps: checked })}
                  disabled={isProcessing}
                />
                <Label>Validate distance jumps</Label>
              </div>
              <Input
                type="number"
                value={settings.max_distance_jump_meters}
                onChange={(e) => updateSettings({ max_distance_jump_meters: parseFloat(e.target.value) })}
                disabled={isProcessing || !settings.validate_distance_jumps}
                min="0"
                step="10"
              />
              <p className="text-xs text-muted-foreground">
                Maximum distance jump in meters
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup Location Providers */}
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle>Backup Location Providers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.enable_backup_providers}
              onCheckedChange={(checked) => updateSettings({ enable_backup_providers: checked })}
              disabled={isProcessing}
            />
            <Label>Enable backup location providers</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Primary Provider</Label>
              <Select
                value={settings.primary_provider}
                onValueChange={(value: LocationProvider) => handleProviderChange('primary', value)}
                disabled={isProcessing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gps">GPS (High Accuracy)</SelectItem>
                  <SelectItem value="network">Network (Balanced)</SelectItem>
                  <SelectItem value="passive">Passive (Low Power)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fallback Provider</Label>
              <Select
                value={settings.fallback_provider}
                onValueChange={(value: LocationProvider) => handleProviderChange('fallback', value)}
                disabled={isProcessing || !settings.enable_backup_providers}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gps">GPS (High Accuracy)</SelectItem>
                  <SelectItem value="network">Network (Balanced)</SelectItem>
                  <SelectItem value="passive">Passive (Low Power)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Provider Timeout (seconds)</Label>
              <Input
                type="number"
                value={settings.provider_timeout_seconds}
                onChange={(e) => updateSettings({ provider_timeout_seconds: parseInt(e.target.value) })}
                disabled={isProcessing || !settings.enable_backup_providers}
                min="1"
                max="60"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Confidence Scoring */}
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle>Location Confidence Scoring</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.confidence_scoring_enabled}
              onCheckedChange={(checked) => updateSettings({ confidence_scoring_enabled: checked })}
              disabled={isProcessing}
            />
            <Label>Enable confidence scoring</Label>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Minimum Confidence Score</Label>
              <Input
                type="number"
                value={settings.minimum_confidence_score}
                onChange={(e) => handleConfidenceThresholdChange(e.target.value)}
                disabled={isProcessing || !settings.confidence_scoring_enabled}
                min="0"
                max="1"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground">
                Locations below this confidence score will be flagged (0.0 - 1.0)
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Accuracy Weight</Label>
                <Input
                  type="number"
                  value={settings.accuracy_weight}
                  onChange={(e) => updateSettings({ accuracy_weight: parseFloat(e.target.value) })}
                  disabled={isProcessing || !settings.confidence_scoring_enabled}
                  min="0"
                  max="1"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label>Recency Weight</Label>
                <Input
                  type="number"
                  value={settings.recency_weight}
                  onChange={(e) => updateSettings({ recency_weight: parseFloat(e.target.value) })}
                  disabled={isProcessing || !settings.confidence_scoring_enabled}
                  min="0"
                  max="1"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label>Source Weight</Label>
                <Input
                  type="number"
                  value={settings.source_weight}
                  onChange={(e) => updateSettings({ source_weight: parseFloat(e.target.value) })}
                  disabled={isProcessing || !settings.confidence_scoring_enabled}
                  min="0"
                  max="1"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label>Network Weight</Label>
                <Input
                  type="number"
                  value={settings.network_weight}
                  onChange={(e) => updateSettings({ network_weight: parseFloat(e.target.value) })}
                  disabled={isProcessing || !settings.confidence_scoring_enabled}
                  min="0"
                  max="1"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Quality History */}
      {qualityHistory.length > 0 && (
        <Card className="border border-quantum-cyan/20 bg-transparent">
          <CardHeader>
            <CardTitle>Recent Location Quality History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {qualityHistory.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border border-quantum-cyan/10 rounded">
                  <div className="flex items-center gap-3">
                    {log.validation_passed ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    )}
                    <div>
                      <div className="text-sm font-medium">
                        {log.latitude.toFixed(6)}, {log.longitude.toFixed(6)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(log.timestamp_recorded).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      {log.accuracy ? `${log.accuracy.toFixed(1)}m` : 'N/A'}
                    </div>
                    {log.confidence_score && (
                      <div className="text-xs text-muted-foreground">
                        Confidence: {(log.confidence_score * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
