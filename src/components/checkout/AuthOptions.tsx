
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

export const AuthOptions = () => {
  const navigate = useNavigate();

  return (
    <Card className="holographic-card p-6 mb-6">
      <h2 className="text-xl font-bold text-quantum-cyan mb-4">Account Required</h2>
      <p className="text-gray-300 mb-4">Please log in or create an account to continue with your order.</p>
      <div className="flex gap-4">
        <Button 
          className="flex-1 cyber-button" 
          onClick={() => navigate('/auth', { state: { returnTo: '/checkout', mode: 'login' } })}
        >
          Login
        </Button>
        <Button 
          className="flex-1 cyber-button" 
          variant="outline"
          onClick={() => navigate('/auth', { state: { returnTo: '/checkout', mode: 'signup' } })}
        >
          Sign Up
        </Button>
      </div>
    </Card>
  );
};
