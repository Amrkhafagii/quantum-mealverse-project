
import React from 'react';

interface BankAccountFormProps {
  onSubmit: (data: any) => void;
  initialValues?: any;
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({ onSubmit, initialValues }) => {
  // Placeholder simple form
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit(initialValues || {});
      }}
      className="space-y-4"
    >
      {/* Placeholder content */}
      <div>Add Bank Account Form</div>
      <button type="submit" className="p-2 bg-quantum-cyan text-black rounded">
        Save
      </button>
    </form>
  );
};

export default BankAccountForm;
