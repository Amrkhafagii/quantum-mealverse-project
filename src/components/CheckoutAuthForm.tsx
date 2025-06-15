
import React from 'react';
import { z } from 'zod';
import { BaseForm } from '@/components/forms/BaseForm';
import { TextField } from '@/components/forms/FormField';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const authFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type AuthFormValues = z.infer<typeof authFormSchema>;

interface CheckoutAuthFormProps {
  onSubmit: (data: AuthFormValues) => void;
  email?: string;
  showPassword?: boolean;
}

export const CheckoutAuthForm = ({ onSubmit, email, showPassword = true }: CheckoutAuthFormProps) => {
  const defaultValues = {
    email: email || "",
    password: "",
  };

  return (
    <Card className="holographic-card p-6 mb-6">
      <h2 className="text-xl font-bold text-quantum-cyan mb-4">Account Information</h2>
      
      <BaseForm
        schema={authFormSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        className="space-y-4"
        mode="onChange"
      >
        <TextField
          name="email"
          type="email"
          label={!email ? "Email" : undefined}
          placeholder="Enter your email"
          required
          disabled={!!email}
          className={email ? "bg-gray-100" : ""}
        />
        
        {showPassword && (
          <TextField
            name="password"
            type="password"
            label="Password"
            placeholder="Create a password"
            required
          />
        )}
        
        {showPassword && (
          <Button type="submit" className="cyber-button w-full">
            Create Account
          </Button>
        )}
      </BaseForm>
    </Card>
  );
};
