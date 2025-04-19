
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const EmptyCartMessage = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="p-8 text-center holographic-card">
      <h2 className="text-2xl font-bold text-quantum-cyan mb-6">Your cart is empty</h2>
      <p className="text-gray-300 mb-6">Please add some meals to your cart before checkout.</p>
      <Button className="cyber-button" onClick={() => navigate('/customer')}>
        Browse Meals
      </Button>
    </Card>
  );
};
