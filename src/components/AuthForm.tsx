
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { SignupFormData } from '@/types/auth';

interface AuthFormProps {
  type?: 'login' | 'signup'; // allow undefined for fallback
}

const AuthForm: React.FC<AuthFormProps> = ({ type = 'login' }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>();
  const auth = useAuth() as any;
  const { user, loading } = auth;
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (data: SignupFormData) => {
    if (type === 'signup' && data.password !== data.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (type === 'login') {
        // Use login function from auth context
        await auth.login(data.email, data.password);
        toast({
          title: 'Success',
          description: 'Logged in successfully!',
        });
        navigate('/dashboard');
      } else {
        await auth.signUp(data.email, data.password, 'customer', {
          fullName: data.fullName,
          phone: data.phone,
        });
        toast({
          title: 'Success',
          description: 'Signed up successfully!',
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{type === 'login' ? 'Login' : 'Sign Up'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email', { required: 'Email is required' })}
              className="w-full"
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              {...register('password', { required: 'Password is required' })}
              className="w-full"
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            <Button variant="ghost" size="sm" type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Hide' : 'Show'} Password
            </Button>
          </div>
          {type === 'signup' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  {...register('confirmPassword', { required: 'Confirm Password is required' })}
                  className="w-full"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? 'Hide' : 'Show'} Confirm Password
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  {...register('fullName', { required: 'Full Name is required' })}
                  className="w-full"
                />
                {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  {...register('phone', { required: 'Phone Number is required' })}
                  className="w-full"
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
              </div>
            </>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : type === 'login' ? 'Login' : 'Sign Up'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
