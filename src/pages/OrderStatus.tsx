
import React from 'react';
import { useParams } from 'react-router-dom';

const OrderStatus = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container mx-auto p-4 pt-20">
      <h1 className="text-2xl font-bold text-quantum-cyan">Order Status</h1>
      <p>Tracking order: {id}</p>
      {/* Order status details would be displayed here */}
    </div>
  );
};

export default OrderStatus;
