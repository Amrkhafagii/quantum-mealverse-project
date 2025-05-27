
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, CreditCard, Check, Shield } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { financialService } from '@/services/financial/financialService';
import type { BankAccount } from '@/types/financial';

interface BankAccountManagementProps {
  restaurantId?: string;
  deliveryUserId?: string;
}

export const BankAccountManagement: React.FC<BankAccountManagementProps> = ({ 
  restaurantId, 
  deliveryUserId 
}) => {
  const { toast } = useToast();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    account_holder_name: '',
    bank_name: '',
    account_number: '',
    routing_number: '',
    account_type: 'checking' as 'checking' | 'savings'
  });

  useEffect(() => {
    loadBankAccounts();
  }, [restaurantId, deliveryUserId]);

  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      const data = await financialService.getBankAccounts(restaurantId, deliveryUserId);
      setBankAccounts(data);
    } catch (error) {
      console.error('Error loading bank accounts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bank accounts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async () => {
    try {
      setSaving(true);
      
      const bankAccountData = {
        ...newAccount,
        restaurant_id: restaurantId,
        delivery_user_id: deliveryUserId,
        is_verified: false,
        is_default: bankAccounts.length === 0, // First account becomes default
        verification_status: 'pending' as const
      };

      await financialService.addBankAccount(bankAccountData);
      
      toast({
        title: 'Bank Account Added',
        description: 'Your bank account has been added successfully'
      });
      
      setDialogOpen(false);
      setNewAccount({
        account_holder_name: '',
        bank_name: '',
        account_number: '',
        routing_number: '',
        account_type: 'checking'
      });
      
      await loadBankAccounts();
    } catch (error) {
      console.error('Error adding bank account:', error);
      toast({
        title: 'Error',
        description: 'Failed to add bank account',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (bankAccountId: string) => {
    try {
      await financialService.setDefaultBankAccount(bankAccountId, restaurantId, deliveryUserId);
      
      toast({
        title: 'Default Account Updated',
        description: 'Default bank account has been updated'
      });
      
      await loadBankAccounts();
    } catch (error) {
      console.error('Error setting default account:', error);
      toast({
        title: 'Error',
        description: 'Failed to update default account',
        variant: 'destructive'
      });
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Shield className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber;
    return '****' + accountNumber.slice(-4);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
          <span className="ml-2">Loading bank accounts...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Bank Accounts</CardTitle>
            <CardDescription>Manage your bank accounts for payouts</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Bank Account</DialogTitle>
                <DialogDescription>
                  Add a new bank account for receiving payouts
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="account_holder_name">Account Holder Name</Label>
                  <Input
                    id="account_holder_name"
                    value={newAccount.account_holder_name}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, account_holder_name: e.target.value }))}
                    placeholder="Full name on account"
                  />
                </div>
                <div>
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name"
                    value={newAccount.bank_name}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, bank_name: e.target.value }))}
                    placeholder="e.g., Chase Bank"
                  />
                </div>
                <div>
                  <Label htmlFor="routing_number">Routing Number</Label>
                  <Input
                    id="routing_number"
                    value={newAccount.routing_number}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, routing_number: e.target.value }))}
                    placeholder="9-digit routing number"
                    maxLength={9}
                  />
                </div>
                <div>
                  <Label htmlFor="account_number">Account Number</Label>
                  <Input
                    id="account_number"
                    value={newAccount.account_number}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, account_number: e.target.value }))}
                    placeholder="Bank account number"
                  />
                </div>
                <div>
                  <Label htmlFor="account_type">Account Type</Label>
                  <Select value={newAccount.account_type} onValueChange={(value: 'checking' | 'savings') => setNewAccount(prev => ({ ...prev, account_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleAddAccount} 
                  disabled={saving || !newAccount.account_holder_name || !newAccount.bank_name || !newAccount.routing_number || !newAccount.account_number}
                  className="w-full"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Add Bank Account
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {bankAccounts.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Bank Accounts</h3>
            <p className="text-gray-600">Add a bank account to receive payouts</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bankAccounts.map((account) => (
              <div key={account.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="font-medium">{account.bank_name}</div>
                      <div className="text-sm text-gray-600">
                        {account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)} 
                        {' • '}****{account.account_number.slice(-4)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getVerificationBadge(account.verification_status)}
                    {account.is_default && (
                      <Badge variant="outline">Default</Badge>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  <div>Account Holder: {account.account_holder_name}</div>
                  <div>Routing: {account.routing_number}</div>
                  <div>Added: {new Date(account.created_at).toLocaleDateString()}</div>
                </div>
                
                {!account.is_default && account.verification_status === 'verified' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSetDefault(account.id)}
                  >
                    Set as Default
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
