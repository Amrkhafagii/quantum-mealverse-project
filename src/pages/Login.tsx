
import React from 'react';
import { AuthForm } from '@/components/AuthForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Login = () => {
  return (
    <div className="flex min-h-screen bg-quantum-black items-center justify-center p-4">
      <Card className="w-full max-w-md bg-quantum-darkBlue/80 border-quantum-cyan/30 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-quantum-cyan">Login</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm 
            mode="login" 
            onSuccess={() => {
              window.location.href = '/';
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
