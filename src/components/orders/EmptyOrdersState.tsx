
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

export const EmptyOrdersState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl mb-4">You haven't placed any orders yet</h2>
      <Button onClick={() => navigate('/customer')}>Browse Meals</Button>
    </div>
  );
};
