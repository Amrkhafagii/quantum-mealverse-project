
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

// This hook simply uses the context from AuthContext.tsx
const useAuth = () => {
  return useContext(AuthContext);
};

export { useAuth, AuthProvider } from '@/contexts/AuthContext';
