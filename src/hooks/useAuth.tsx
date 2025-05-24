
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

// This hook simply uses the context from AuthContext.tsx
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { useAuth };
export { AuthProvider } from '@/contexts/AuthContext';
export default useAuth;
