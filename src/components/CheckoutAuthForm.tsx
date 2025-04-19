
import React from 'react';
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: email || "",
      password: "",
    },
    mode: "onChange" // Enable validation as fields change
  });

  return (
    <Card className="holographic-card p-6 mb-6">
      <h2 className="text-xl font-bold text-quantum-cyan mb-4">Account Information</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {showPassword && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Create a password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {showPassword && (
            <Button type="submit" className="cyber-button w-full">
              Create Account
            </Button>
          )}
        </form>
      </Form>
    </Card>
  );
};
