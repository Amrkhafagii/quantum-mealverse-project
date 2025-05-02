
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { DeliveryPaymentDetails } from '@/types/delivery';
import { Loader2 } from 'lucide-react';

const paymentSchema = z.object({
  account_name: z.string()
    .min(2, { message: 'Account name must be at least 2 characters' })
    .max(100, { message: 'Account name cannot exceed 100 characters' }),
  account_number: z.string()
    .min(5, { message: 'Account number must be at least 5 characters' })
    .max(20, { message: 'Account number cannot exceed 20 characters' })
    .refine(val => /^\d+$/.test(val), { message: 'Account number must contain only numbers' }),
  routing_number: z.string()
    .min(9, { message: 'Routing number must be 9 digits' })
    .max(9, { message: 'Routing number must be 9 digits' })
    .refine(val => /^\d+$/.test(val), { message: 'Routing number must contain only numbers' }),
  bank_name: z.string()
    .min(2, { message: 'Bank name must be at least 2 characters' })
    .max(100, { message: 'Bank name cannot exceed 100 characters' }),
  has_accepted_terms: z.boolean()
    .refine(val => val === true, { message: 'You must accept the terms and conditions' }),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentDetailsFormProps {
  onSubmit: (data: PaymentFormData) => Promise<DeliveryPaymentDetails | null>;
  initialData?: Partial<PaymentFormData>;
  isLoading: boolean;
}

export const PaymentDetailsForm: React.FC<PaymentDetailsFormProps> = ({
  onSubmit,
  initialData,
  isLoading,
}) => {
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      account_name: initialData?.account_name || '',
      account_number: initialData?.account_number || '',
      routing_number: initialData?.routing_number || '',
      bank_name: initialData?.bank_name || '',
      has_accepted_terms: initialData?.has_accepted_terms || false,
    },
  });

  const handleSubmit = async (data: PaymentFormData) => {
    await onSubmit(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Payment Details</h2>
        <p className="text-gray-400 mt-1">Enter your bank details for payments</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="account_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Holder Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="account_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder="12345678" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="routing_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Routing Number</FormLabel>
                  <FormControl>
                    <Input placeholder="123456789" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="bank_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Name</FormLabel>
                <FormControl>
                  <Input placeholder="Bank of America" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="has_accepted_terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I accept the terms and conditions
                  </FormLabel>
                  <p className="text-sm text-gray-400">
                    I certify that all information provided is accurate and I agree to the payout terms. 
                    I understand that payments will be processed according to the delivery pay schedule.
                  </p>
                </div>
              </FormItem>
            )}
          />

          <div className="pt-4">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Complete Signup'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
