
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

// This hook simply uses the context from AuthContext.tsx
export const useAuth = () => {
  return useContext(AuthContext);
};
