
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, Eye } from 'lucide-react';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';

export const DataAnonymizationControls = () => {
  const {
    anonymizationSettings,
    loading,
    isProcessing,
    updateAnonymizationSettings,
    anonymizeLocationData
  } = usePrivacySettings();

  const handleToggle = (field: string, value: boolean) => {
    updateAnonymizationSettings({ [field]: value });
  };

  const handlePrecisionChange = (value: number[]) => {
    updateAnonymizationSettings({ precision_reduction_level: value[0] });
  };

  const handleAnonymizeNow = async () => {
    if (anonymizationSettings?.precision_reduction_level) {
      await anonymizeLocationData(anonymizationSettings.precision_reduction_level);
    }
  };

  const getPrecisionDescription = (level: number) => {
    switch (level) {
      case 1: return 'Very High (±1m)';
      case 2: return 'High (±10m)';
      case 3: return 'Medium (±100m)';
      case 4: return 'Low (±1km)';
      case 5: return 'Very Low (±10km)';
      default: return 'Medium';
    }
  };

  if (loading) {
    return (
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-quantum-cyan" />
            <span className="ml-2 text-quantum-cyan">Loading anonymization settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-quantum-cyan/20 bg-transparent">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          Data Anonymization Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="anonymize-location">Anonymize Location Data</Label>
              <p className="text-sm text-muted-foreground">
                Reduce precision of location coordinates
              </p>
            </div>
            <Switch
              id="anonymize-location"
              checked={anonymizationSettings?.anonymize_location_data || false}
              onCheckedChange={(checked) => handleToggle('anonymize_location_data', checked)}
              disabled={isProcessing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="anonymize-device">Anonymize Device Information</Label>
              <p className="text-sm text-muted-foreground">
                Remove device identifiers and specs
              </p>
            </div>
            <Switch
              id="anonymize-device"
              checked={anonymizationSettings?.anonymize_device_info || false}
              onCheckedChange={(checked) => handleToggle('anonymize_device_info', checked)}
              disabled={isProcessing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="anonymize-patterns">Anonymize Usage Patterns</Label>
              <p className="text-sm text-muted-foreground">
                Remove behavioral and timing patterns
              </p>
            </div>
            <Switch
              id="anonymize-patterns"
              checked={anonymizationSettings?.anonymize_usage_patterns || false}
              onCheckedChange={(checked) => handleToggle('anonymize_usage_patterns', checked)}
              disabled={isProcessing}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Location Precision Level</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Current: {getPrecisionDescription(anonymizationSettings?.precision_reduction_level || 3)}
            </p>
            <Slider
              value={[anonymizationSettings?.precision_reduction_level || 3]}
              onValueChange={handlePrecisionChange}
              max={5}
              min={1}
              step={1}
              className="w-full"
              disabled={isProcessing}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Most Precise</span>
              <span>Least Precise</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-quantum-cyan/20">
          <Button 
            onClick={handleAnonymizeNow} 
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            Anonymize Existing Data Now
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            This will apply current settings to all existing location data
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
