
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AdaptiveForm from '@/components/forms/AdaptiveForm';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PageTransition } from '@/components/layout/PageTransition';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { NetworkAwareContainer } from '@/components/network/NetworkAwareContainer';
import { toast } from '@/components/ui/use-toast';

// Form schema
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is required'),
  address: z.string().optional(),
});

const AdaptiveFormDemo = () => {
  const { isOnline } = useConnectionStatus();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    
    // Simulate API request
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    console.log('Form submitted:', data);
    
    toast({
      title: isOnline ? 'Form submitted' : 'Form saved offline',
      description: isOnline 
        ? 'Your information has been submitted successfully.' 
        : 'Your information will be submitted when you\'re back online.',
    });
    
    setSubmitting(false);
    form.reset();
  };

  return (
    <PageTransition>
      <div className="container mx-auto p-4 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Adaptive Form Demo</h1>
        
        <NetworkAwareContainer>
          <div className="grid gap-6">
            <AdaptiveForm onSubmit={form.handleSubmit(onSubmit)} className="w-full">
              <Form {...form}>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Your email" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Your address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </div>
              </Form>
            </AdaptiveForm>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-sm">
              <h3 className="font-medium mb-2">Adaptive Form Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Adjusts validation strategy based on connection quality</li>
                <li>Stores form data locally when offline</li>
                <li>Automatically submits when connection is restored</li>
                <li>Visual indicators of current network state</li>
              </ul>
            </div>
          </div>
        </NetworkAwareContainer>
      </div>
    </PageTransition>
  );
};

export default AdaptiveFormDemo;
