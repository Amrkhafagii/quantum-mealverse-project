
import React from 'react';

export const OrderConfirmationHeader = ({ className }: { className?: string }) => {
  return (
    <div className={`text-center ${className}`}>
      <h1 className="text-3xl font-bold">Order Confirmation</h1>
      <p className="text-gray-500">Thank you for your order!</p>
    </div>
  );
};

export const OrderConfirmationDetails = ({ className }: { className?: string }) => {
  return (
    <div className={`border p-4 rounded ${className}`}>
      <h2 className="text-lg font-bold mb-2">Order Details</h2>
      <p>This is a placeholder for order details.</p>
    </div>
  );
};

export const OrderConfirmationFooter = ({ className }: { className?: string }) => {
  return (
    <div className={`mt-8 ${className}`}>
      <p className="text-center text-gray-500">
        If you have any questions about your order, please contact customer support.
      </p>
    </div>
  );
};
