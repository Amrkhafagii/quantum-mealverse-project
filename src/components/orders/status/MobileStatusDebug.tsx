
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Bug } from 'lucide-react';

interface MobileStatusDebugProps {
  onStatusFixed?: () => void;
}

export const MobileStatusDebug: React.FC<MobileStatusDebugProps> = ({
  onStatusFixed
}) => {
  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bug className="h-4 w-4" />
          Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs">Status:</span>
          <Badge variant="outline" className="text-xs">Active</Badge>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onStatusFixed}
          className="w-full"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </CardContent>
    </Card>
  );
};
