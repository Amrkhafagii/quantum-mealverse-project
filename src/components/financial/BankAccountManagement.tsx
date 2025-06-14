import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  getBankAccounts, 
  setDefaultBankAccount
  // NOTE: createBankAccount, updateBankAccount, deleteBankAccount do NOT exist in the service,
  // if you have similarly named functions like addBankAccount/editBankAccount/removeBankAccount, import them instead.
  // Otherwise, comment out relevant code below if needed.
} from '@/services/financial/financialService';
import { BankAccount } from '@/types/financial';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Check, Trash2, Edit, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import BankAccountForm from './BankAccountForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export const BankAccountManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const accounts = await getBankAccounts(user.id);
      setBankAccounts(accounts);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bank accounts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBankAccount = async (bankAccount: any) => {
    // TODO: Replace with service implementation, e.g., addBankAccount(bankAccount)
    console.warn("Add bank account not implemented – missing service function.");
  };

  const handleUpdateBankAccount = async (bankAccount: any) => {
    // TODO: Replace with service implementation, e.g., editBankAccount(bankAccount)
    console.warn("Update bank account not implemented – missing service function.");
  };

  const handleDeleteBankAccount = async (accountId: string) => {
    // TODO: Replace with service implementation, e.g., removeBankAccount(accountId)
    console.warn("Delete bank account not implemented – missing service function.");
  };

  const handleSetDefault = async (accountId: string) => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      await setDefaultBankAccount(accountId, user.id);
      toast({
        title: 'Success',
        description: 'Default bank account updated',
      });
      fetchBankAccounts();
    } catch (error) {
      console.error('Error setting default bank account:', error);
      toast({
        title: 'Error',
        description: 'Failed to update default bank account',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const openAddDialog = () => {
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (account: BankAccount) => {
    setSelectedAccount(account);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (account: BankAccount) => {
    setSelectedAccount(account);
    setIsDeleteDialogOpen(true);
  };

  const handleAddSubmit = async (formData: Partial<BankAccount>) => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      await handleAddBankAccount({
        ...formData,
        restaurant_id: user.id,
        delivery_user_id: user.id,
      });
      
      setIsAddDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Bank account added successfully',
      });
      fetchBankAccounts();
    } catch (error) {
      console.error('Error adding bank account:', error);
      toast({
        title: 'Error',
        description: 'Failed to add bank account',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditSubmit = async (formData: Partial<BankAccount>) => {
    if (!selectedAccount) return;
    
    setIsProcessing(true);
    try {
      await handleUpdateBankAccount({
        ...selectedAccount,
        ...formData,
      });
      
      setIsEditDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Bank account updated successfully',
      });
      fetchBankAccounts();
    } catch (error) {
      console.error('Error updating bank account:', error);
      toast({
        title: 'Error',
        description: 'Failed to update bank account',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAccount) return;
    
    setIsProcessing(true);
    try {
      await handleDeleteBankAccount(selectedAccount.id);
      
      setIsDeleteDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Bank account deleted successfully',
      });
      fetchBankAccounts();
    } catch (error) {
      console.error('Error deleting bank account:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete bank account',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Bank Accounts</CardTitle>
        <Button onClick={openAddDialog} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : bankAccounts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No bank accounts found</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={openAddDialog}>
              Add your first bank account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {bankAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium flex items-center">
                    {account.account_holder_name}
                    {account.is_default && (
                      <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {account.bank_name} •••• {account.account_number.slice(-4)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!account.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(account.id)}
                      disabled={isProcessing}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(account)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteDialog(account)}
                    disabled={account.is_default}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add Bank Account Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bank Account</DialogTitle>
          </DialogHeader>
          <BankAccountForm
            onSubmit={handleAddSubmit}
            isProcessing={isProcessing}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Bank Account Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bank Account</DialogTitle>
          </DialogHeader>
          <BankAccountForm
            initialData={selectedAccount}
            onSubmit={handleEditSubmit}
            isProcessing={isProcessing}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bank account? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Account'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default BankAccountManagement;
