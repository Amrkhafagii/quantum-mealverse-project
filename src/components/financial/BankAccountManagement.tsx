import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, PencilIcon, TrashIcon } from '@radix-ui/react-icons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BankAccount } from '@/types/financial';
import { financialService } from '@/services/financial/financialService';
import BankAccountForm from '@/components/financial/BankAccountForm';
import { toast } from 'sonner';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const BankAccountManagement: React.FC = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBankAccounts();
  }, []);

  const loadBankAccounts = async () => {
    setIsLoading(true);
    try {
      const accounts = await financialService.getBankAccounts();
      setBankAccounts(accounts);
    } catch (error: any) {
      toast({
        title: "Error!",
        description: error.message,
        duration: 3000,
      })
      console.error('Error loading bank accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBankAccount = async (formData: Partial<BankAccount>) => {
    setIsLoading(true);
    try {
      await financialService.createBankAccount(formData);
      toast({
        title: "Success!",
        description: "Bank account created.",
        duration: 3000,
      })
      loadBankAccounts();
      setIsAddDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error!",
        description: error.message,
        duration: 3000,
      })
      console.error('Error creating bank account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditBankAccount = async (formData: Partial<BankAccount>) => {
    if (!selectedBankAccount) return;

    setIsLoading(true);
    try {
      await financialService.updateBankAccount(selectedBankAccount.id, formData);
      toast({
        title: "Success!",
        description: "Bank account updated.",
        duration: 3000,
      })
      loadBankAccounts();
      setIsEditDialogOpen(false);
      setSelectedBankAccount(null);
    } catch (error: any) {
      toast({
        title: "Error!",
        description: error.message,
        duration: 3000,
      })
      console.error('Error updating bank account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBankAccount = async (id: string) => {
    setIsLoading(true);
    try {
      await financialService.deleteBankAccount(id);
      toast({
        title: "Success!",
        description: "Bank account deleted.",
        duration: 3000,
      })
      loadBankAccounts();
      setIsDeleteDialogOpen(false);
      setDeleteConfirmationId(null);
    } catch (error: any) {
       toast({
        title: "Error!",
        description: error.message,
        duration: 3000,
      })
      console.error('Error deleting bank account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="container max-w-4xl mx-auto mt-8 holographic-card">
      <CardHeader>
        <CardTitle className="text-2xl">Bank Account Management</CardTitle>
        <CardDescription>
          Manage your bank accounts for payouts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Bank Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Bank Account</DialogTitle>
                <DialogDescription>
                  Enter the details for the new bank account.
                </DialogDescription>
              </DialogHeader>
              <BankAccountForm
                onSubmit={handleAddBankAccount}
                // Removed isProcessing and onCancel, which aren't in BankAccountFormProps
              />
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Holder</TableHead>
              <TableHead>Bank Name</TableHead>
              <TableHead>Account Number</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bankAccounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell>{account.account_holder_name}</TableCell>
                <TableCell>{account.bank_name}</TableCell>
                <TableCell>{account.account_number}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedBankAccount(account);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <PencilIcon className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <TrashIcon className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the bank account.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteBankAccount(account.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            {/* This trigger is hidden and only serves to manage the dialog state */}
            <Button style={{ display: 'none' }}>Edit Bank Account</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Bank Account</DialogTitle>
              <DialogDescription>
                Edit the details for the selected bank account.
              </DialogDescription>
            </DialogHeader>
            {
              isEditDialogOpen && selectedBankAccount && (
                <BankAccountForm
                  onSubmit={handleEditBankAccount}
                  initialValues={selectedBankAccount}
                  // Removed initialData, isProcessing and onCancel
                />
              )
            }
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default BankAccountManagement;
