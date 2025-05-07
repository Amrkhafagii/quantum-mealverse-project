
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSuspenseProps {
  children: React.ReactNode;
}

export const LoadingSuspense: React.FC<LoadingSuspenseProps> = ({ children }) => {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center w-full min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
        </div>
      }
    >
      {children}
    </React.Suspense>
  );
};
