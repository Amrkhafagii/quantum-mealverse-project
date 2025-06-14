
import React from 'react';
import AuthForm from '@/components/AuthForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Signup = () => {
  return (
    <div className="flex min-h-screen bg-quantum-black items-center justify-center p-4">
      <Card className="w-full max-w-md bg-quantum-darkBlue/80 border-quantum-cyan/30 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-quantum-cyan">Sign Up</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Create a new account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm type="signup" />
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
