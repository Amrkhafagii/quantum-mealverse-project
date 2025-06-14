
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Users, CheckCircle } from 'lucide-react';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';
import { useAuth } from '@/hooks/useAuth';

export const ThirdPartyDataSharingSettings = () => {
  const { user } = useAuth();
  const {
    sharingPreferences,
    loading,
    isProcessing,
    updateSharingPreferences
  } = usePrivacySettings(user?.id || '');

  const handleToggle = (field: string, value: boolean) => {
    const updates: any = { [field]: value };
    
    // If enabling data processing consent, set consent date
    if (field === 'data_processing_consent' && value) {
      updates.consent_date = new Date().toISOString();
    }
    
    updateSharingPreferences(updates);
  };

  const handleRevokeConsent = () => {
    updateSharingPreferences({
      analytics_sharing: false,
      marketing_sharing: false,
      research_sharing: false,
      data_processing_consent: false,
      consent_date: null
    });
  };

  if (loading) {
    return (
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-quantum-cyan" />
            <span className="ml-2 text-quantum-cyan">Loading sharing preferences...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-quantum-cyan/20 bg-transparent">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5" />
          Third-Party Data Sharing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="analytics-sharing">Analytics Partners</Label>
              <p className="text-sm text-muted-foreground">
                Share anonymized usage data for service improvements
              </p>
            </div>
            <Switch
              id="analytics-sharing"
              checked={sharingPreferences?.analytics_sharing || false}
              onCheckedChange={(checked) => handleToggle('analytics_sharing', checked)}
              disabled={isProcessing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="marketing-sharing">Marketing Partners</Label>
              <p className="text-sm text-muted-foreground">
                Share data for personalized offers and recommendations
              </p>
            </div>
            <Switch
              id="marketing-sharing"
              checked={sharingPreferences?.marketing_sharing || false}
              onCheckedChange={(checked) => handleToggle('marketing_sharing', checked)}
              disabled={isProcessing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="research-sharing">Research Partners</Label>
              <p className="text-sm text-muted-foreground">
                Share anonymized data for academic and industry research
              </p>
            </div>
            <Switch
              id="research-sharing"
              checked={sharingPreferences?.research_sharing || false}
              onCheckedChange={(checked) => handleToggle('research_sharing', checked)}
              disabled={isProcessing}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-quantum-cyan/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label htmlFor="data-consent">Data Processing Consent</Label>
              <p className="text-sm text-muted-foreground">
                General consent for data processing activities
              </p>
              {sharingPreferences?.consent_date && (
                <p className="text-xs text-green-400 flex items-center mt-1">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Consented on {new Date(sharingPreferences.consent_date).toLocaleDateString()}
                </p>
              )}
            </div>
            <Switch
              id="data-consent"
              checked={sharingPreferences?.data_processing_consent || false}
              onCheckedChange={(checked) => handleToggle('data_processing_consent', checked)}
              disabled={isProcessing}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-quantum-cyan/20">
          <Button 
            variant="outline" 
            onClick={handleRevokeConsent} 
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Revoke All Consents
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            This will disable all third-party data sharing
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
