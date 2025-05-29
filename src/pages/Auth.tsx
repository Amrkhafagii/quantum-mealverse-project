
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthForm } from '@/components/AuthForm';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') as 'login' | 'signup' || 'login';
  const userType = searchParams.get('type') as 'customer' | 'restaurant' | 'delivery' || 'customer';

  return (
    <div className="min-h-screen flex items-center justify-center bg-quantum-black p-4">
      <div className="w-full max-w-md">
        <AuthForm 
          mode={mode}
          userType={userType}
          onSuccess={() => {
            // Handle success - redirect based on user type
            window.location.href = userType === 'restaurant' ? '/restaurant' : 
                                 userType === 'delivery' ? '/delivery' : '/';
          }}
        />
      </div>
    </div>
  );
};

export default Auth;
