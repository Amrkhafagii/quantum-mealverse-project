
import React, { useState } from 'react';
// Fix the icon import
import { Pencil } from 'lucide-react';
import BankAccountForm from './BankAccountForm';
import { toast } from '@/components/ui/use-toast';

type BankAccount = {
  id: string;
  bank_name: string;
  account_number: string;
  routing_number: string;
  account_holder_name: string;
  account_type?: string;
  is_default?: boolean;
  verification_status?: string;
  is_verified?: boolean;
};

const mockAccounts: BankAccount[] = [
  {
    id: '1',
    bank_name: 'Bank of Shadcn',
    account_number: '****4321',
    routing_number: '123456789',
    account_holder_name: 'John Doe',
    account_type: 'checking',
    is_default: true,
    verification_status: 'verified',
    is_verified: true,
  },
];

const BankAccountManagement: React.FC = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>(mockAccounts);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  // Show "not implemented" toast for actions without service implementation
  const showNotImplementedToast = (msg: string) => {
    toast({
      title: msg,
      variant: 'destructive',
    });
  };

  const handleAddClick = () => {
    setEditingAccount(null);
    setShowForm(true);
  };

  // For demo only - would be replaced by API call
  const handleSaveAccount = (data: Partial<BankAccount>) => {
    if (editingAccount) {
      // Edit
      setAccounts((prev) => prev.map(acc => acc.id === editingAccount.id ? { ...acc, ...data } as BankAccount : acc));
      toast({ title: 'Bank account updated!' });
    } else {
      // Create
      setAccounts((prev) => [
        ...prev,
        {
          ...data,
          id: (prev.length + 1).toString(),
          account_number: data.account_number || '****0000'
        } as BankAccount
      ]);
      toast({ title: 'Bank account added!' });
    }
    setShowForm(false);
  };

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    showNotImplementedToast('Delete bank account: Not implemented');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Bank Accounts</h2>
        <button
          className="px-4 py-2 rounded bg-quantum-cyan text-black"
          onClick={handleAddClick}
        >
          Add Account
        </button>
      </div>
      <div className="space-y-4">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="border rounded-lg p-4 flex items-center justify-between bg-gray-800"
          >
            <div>
              <div className="font-semibold">
                {account.bank_name}{" "}
                {account.is_default && (
                  <span className="text-xs bg-blue-500 text-white ml-2 px-2 py-0.5 rounded">
                    Default
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-400">
                {account.account_type} | {account.account_number}
              </div>
              <div className="text-xs text-gray-500">
                Routing: {account.routing_number} | Holder: {account.account_holder_name}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded hover:bg-quantum-cyan/20"
                onClick={() => handleEdit(account)}
                title="Edit"
              >
                <Pencil className="mr-2 h-4 w-4" />
              </button>
              <button
                className="p-2 rounded bg-red-500 text-white hover:bg-red-600"
                onClick={() => handleDelete(account.id)}
                title="Delete"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit or Add */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white rounded-lg shadow-lg p-8 min-w-[350px]">
            <h3 className="text-lg font-bold mb-4">{editingAccount ? "Edit Account" : "Add Bank Account"}</h3>
            <BankAccountForm
              onSubmit={handleSaveAccount}
              initialValues={editingAccount || {}}
            />
            <button className="mt-4 text-gray-500" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAccountManagement;

