import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getBankAccounts, createBankAccount, updateBankAccount, deleteBankAccount, setDefaultBankAccount } from '@/services/financial/financialService';
import { BankAccount } from '@/types/financial';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from '@/hooks/use-toast';

const BankAccountManagement = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [newAccount, setNewAccount] = useState<Omit<BankAccount, 'id' | 'user_id' | 'is_verified' | 'created_at' | 'updated_at' | 'verification_status' | 'external_account_id'> & { is_default: boolean, restaurant_id?: string, delivery_user_id?: string }>({
    account_holder_name: '',
    bank_name: '',
    account_number: '',
    routing_number: '',
    account_type: 'checking',
    is_default: false,
    restaurant_id: '',
    delivery_user_id: ''
  });
  const [loading, setLoading] = useState(false);

  const userId = user?.id;
  const userType = user?.user_metadata?.user_type;

  useEffect(() => {
    if (userId) {
      fetchBankAccounts();
    }
  }, [userId, userType]);

  const fetchBankAccounts = async () => {
    setLoading(true);
    try {
      let accounts;
      if (userType === "restaurant" || userType === "delivery_user") {
        accounts = await getBankAccounts(userId, userType);
      } else {
        accounts = await getBankAccounts(userId); // for customers, no role arg needed
      }
      setAccounts(accounts || []);
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch bank accounts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAccount(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const accountData = {
        ...newAccount,
        user_id: userId,
        restaurant_id: userType === 'restaurant' ? userId : undefined,
        delivery_user_id: userType === 'delivery_user' ? userId : undefined,
      };
      
      await createBankAccount(accountData);
      toast({
        title: "Success",
        description: "Bank account created successfully!",
      });
      await fetchBankAccounts();
      setNewAccount({
        account_holder_name: '',
        bank_name: '',
        account_number: '',
        routing_number: '',
        account_type: 'checking',
        is_default: false,
        restaurant_id: '',
        delivery_user_id: ''
      });
    } catch (error) {
      console.error("Error creating bank account:", error);
      toast({
        title: "Error",
        description: "Failed to create bank account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bankAccountId: string) => {
    setLoading(true);
    try {
      await deleteBankAccount(bankAccountId);
      toast({
        title: "Success",
        description: "Bank account deleted successfully!",
      });
      await fetchBankAccounts();
    } catch (error) {
      console.error("Error deleting bank account:", error);
      toast({
        title: "Error",
        description: "Failed to delete bank account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = (bankAccountId: string) => {
    // Always mark as default (true)
    setDefaultBankAccount(userId, bankAccountId, true);
  };

  const handleChangeDefault = (bankAccountId: string) => {
    setDefaultBankAccount(userId, bankAccountId, true); // Pass boolean, not string
  };

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle>Manage Bank Accounts</CardTitle>
        <CardDescription>Add, update, or delete your bank account information.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="account_holder_name">Account Holder Name</Label>
            <Input
              type="text"
              id="account_holder_name"
              name="account_holder_name"
              value={newAccount.account_holder_name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="bank_name">Bank Name</Label>
            <Input
              type="text"
              id="bank_name"
              name="bank_name"
              value={newAccount.bank_name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="account_number">Account Number</Label>
            <Input
              type="text"
              id="account_number"
              name="account_number"
              value={newAccount.account_number}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="routing_number">Routing Number</Label>
            <Input
              type="text"
              id="routing_number"
              name="routing_number"
              value={newAccount.routing_number}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="account_type">Account Type</Label>
            <select
              id="account_type"
              name="account_type"
              value={newAccount.account_type}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
            </select>
          </div>
          <div>
            <Label htmlFor="is_default">Set as Default</Label>
            <Input
              type="checkbox"
              id="is_default"
              name="is_default"
              checked={newAccount.is_default}
              onChange={() => setNewAccount(prev => ({ ...prev, is_default: !prev.is_default }))}
            />
          </div>
          <Button type="submit" disabled={loading} className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black">
            {loading ? 'Creating...' : 'Create Account'}
          </Button>
        </form>

        <h3 className="text-xl font-semibold mt-6 mb-2">Your Bank Accounts</h3>
        {accounts.length === 0 ? (
          <p>No bank accounts added yet.</p>
        ) : (
          <div className="space-y-4">
            {accounts.map(account => (
              <Card key={account.id} className="bg-quantum-black/30 border border-quantum-cyan/10">
                <CardContent className="space-y-2">
                  <p><strong>Bank Name:</strong> {account.bank_name}</p>
                  <p><strong>Account Holder:</strong> {account.account_holder_name}</p>
                  <p><strong>Account Number:</strong> {account.account_number}</p>
                  <p><strong>Routing Number:</strong> {account.routing_number}</p>
                  <p><strong>Type:</strong> {account.account_type}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleChangeDefault(account.id)}
                      disabled={account.is_default}
                      className="text-xs"
                    >
                      {account.is_default ? 'Default Account' : 'Set as Default'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(account.id)}
                      disabled={loading}
                      className="text-xs"
                    >
                      {loading ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BankAccountManagement;
