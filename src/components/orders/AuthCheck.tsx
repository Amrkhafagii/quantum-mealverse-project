
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const AuthCheck: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Authentication Required</CardTitle>
        <CardDescription>
          You need to be logged in to view your orders
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={() => navigate('/auth')}
          className="w-full"
        >
          Login to Your Account
        </Button>
      </CardContent>
    </Card>
  );
};
