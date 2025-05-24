
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CustomerHeaderProps {
  userEmail?: string;
  onLogout: () => void;
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  userEmail,
  onLogout
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Dashboard</CardTitle>
        <CardDescription>
          Welcome, {userEmail}! Explore restaurants and view recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onLogout}>Sign Out</Button>
      </CardContent>
    </Card>
  );
};
