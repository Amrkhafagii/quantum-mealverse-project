
import React from 'react';
import { useParams } from 'react-router-dom';

const Restaurant = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container mx-auto p-4 pt-20">
      <h1 className="text-2xl font-bold text-quantum-cyan">Restaurant Details</h1>
      <p>Restaurant ID: {id}</p>
      {/* Restaurant details would be fetched and displayed here */}
    </div>
  );
};

export default Restaurant;
