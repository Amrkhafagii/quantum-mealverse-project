
import React, { useState } from 'react';
import { z } from 'zod';
import { BaseForm } from './BaseForm';
import { TextField } from './FormField';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AuthService, SignInData, SignUpData } from '@/services/auth/AuthService';
import { useToast } from '@/hooks/use-toast';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

interface AuthFormComponentProps {
  mode: 'signin' | 'signup';
  onSuccess?: (user: any) => void;
  onModeChange?: (mode: 'signin' | 'signup') => void;
  className?: string;
}

export const AuthFormComponent: React.FC<AuthFormComponentProps> = ({
  mode,
  onSuccess,
  onModeChange,
  className
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSignIn = async (data: SignInFormData) => {
    setIsLoading(true);
    
    // Create SignInData with guaranteed required properties
    const signInData: SignInData = {
      email: data.email,
      password: data.password,
    };
    
    const result = await AuthService.signIn(signInData);
    
    if (result.success && result.user) {
      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully.",
      });
      onSuccess?.(result.user);
    } else {
      toast({
        title: "Sign in failed",
        description: result.error || "Please check your credentials and try again.",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    
    const signUpData: SignUpData = {
      email: data.email,
      password: data.password,
      userType: 'customer'
    };
    
    const result = await AuthService.signUp(signUpData);
    
    if (result.success) {
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
      onSuccess?.(result.user);
    } else {
      toast({
        title: "Sign up failed",
        description: result.error || "Please try again.",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  if (mode === 'signup') {
    return (
      <Card className={`holographic-card p-6 ${className}`}>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-quantum-cyan mb-2">Create Account</h2>
          <p className="text-gray-400">Join us to start ordering healthy meals</p>
        </div>
        
        <BaseForm
          schema={signUpSchema}
          onSubmit={handleSignUp}
          className="space-y-4"
        >
          <TextField
            name="email"
            type="email"
            label="Email"
            placeholder="Enter your email"
            required
          />
          
          <TextField
            name="password"
            type="password"
            label="Password"
            placeholder="Create a password"
            required
          />
          
          <TextField
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="Confirm your password"
            required
          />
          
          <Button 
            type="submit" 
            className="cyber-button w-full"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </BaseForm>
        
        {onModeChange && (
          <div className="mt-4 text-center">
            <span className="text-gray-400">Already have an account? </span>
            <Button
              variant="link"
              onClick={() => onModeChange('signin')}
              className="text-quantum-cyan p-0"
            >
              Sign in
            </Button>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className={`holographic-card p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-quantum-cyan mb-2">Welcome Back</h2>
        <p className="text-gray-400">Sign in to your account</p>
      </div>
      
      <BaseForm
        schema={signInSchema}
        onSubmit={handleSignIn}
        className="space-y-4"
      >
        <TextField
          name="email"
          type="email"
          label="Email"
          placeholder="Enter your email"
          required
        />
        
        <TextField
          name="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          required
        />
        
        <Button 
          type="submit" 
          className="cyber-button w-full"
          disabled={isLoading}
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
      </BaseForm>
      
      {onModeChange && (
        <div className="mt-4 text-center">
          <span className="text-gray-400">Don't have an account? </span>
          <Button
            variant="link"
            onClick={() => onModeChange('signup')}
            className="text-quantum-cyan p-0"
          >
            Sign up
          </Button>
        </div>
      )}
    </Card>
  );
};
