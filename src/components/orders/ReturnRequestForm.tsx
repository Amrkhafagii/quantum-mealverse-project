import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';

interface ReturnRequestFormProps {
  orderId: string;
  onSuccess?: () => void;
}

interface FormData {
  reason: string;
  images: FileList;
  details: string;
}

const RETURN_REASONS = [
  "Wrong items received",
  "Quality issues",
  "Late delivery",
  "Changed my mind",
  "Other"
];

export const ReturnRequestForm: React.FC<ReturnRequestFormProps> = ({ orderId, onSuccess }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();
  const { toast } = useToast();
  
  // Get the current user session
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });
  
  const onSubmit = async (data: FormData) => {
    try {
      if (!session?.user?.id) {
        throw new Error('You must be logged in to submit a return request');
      }
      
      // Convert images to base64
      const imageUrls: string[] = [];
      for (let i = 0; i < data.images.length; i++) {
        const file = data.images[i];
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          throw new Error('Each image must be less than 5MB');
        }
        
        const reader = new FileReader();
        const base64String = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        imageUrls.push(base64String);
      }
      
      const { error } = await supabase
        .from('return_requests')
        .insert({
          order_id: orderId,
          reason: data.reason,
          images: imageUrls,
          admin_notes: data.details,
          return_requests_user_id: session.user.id // Fix: use correct field
        });
        
      if (error) throw error;
      
      toast({
        title: "Return Request Submitted",
        description: "We'll review your request and get back to you soon.",
      });
      
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Return Request</CardTitle>
        <CardDescription>
          Please provide details about your return request
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Return</Label>
            <Select {...register('reason', { required: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {RETURN_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.reason && (
              <span className="text-sm text-red-500">Please select a reason</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Photos (Optional, max 5MB each)</Label>
            <Input
              id="images"
              type="file"
              accept="image/jpeg,image/png"
              multiple
              {...register('images')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Additional Details</Label>
            <Textarea
              id="details"
              placeholder="Please provide any additional information about your return request"
              {...register('details')}
            />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Return Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
