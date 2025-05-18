
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { BiometricAuth } from '@/plugins/BiometricAuthPlugin';
import { Platform } from '@/utils/platform';

export type User = {
  id: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  user_metadata?: Record<string, any>;
  created_at?: string;
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithBiometrics: () => Promise<boolean>;
  logout: () => Promise<boolean>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  setupBiometrics: () => Promise<boolean>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  loginWithBiometrics: async () => false,
  logout: async () => false,
  signup: async () => {},
  setupBiometrics: async () => false,
});

export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);

  // Check for biometric availability on mount
  useEffect(() => {
    const checkBiometrics = async () => {
      if (Platform.isNative) {
        try {
          const { available } = await BiometricAuth.isAvailable();
          setBiometricsAvailable(available);
        } catch (e) {
          console.error('Error checking biometrics:', e);
          setBiometricsAvailable(false);
        }
      }
    };
    
    checkBiometrics();
  }, []);

  // Simulate checking for a stored session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('health_and_fix_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user', e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock login for now
      const mockUser = {
        id: '1',
        displayName: 'Test User',
        email,
        photoURL: null,
        user_metadata: { user_type: 'customer' }
      };
      
      setUser(mockUser);
      localStorage.setItem('health_and_fix_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithBiometrics = async (): Promise<boolean> => {
    if (!biometricsAvailable) return false;
    
    try {
      const { authenticated } = await BiometricAuth.authenticate({
        reason: "Login to HealthAndFix",
        title: "Biometric Authentication"
      });
      
      if (authenticated) {
        // In a real app, we would retrieve the stored user credentials here
        // For now, just create a mock user
        const mockUser = {
          id: '1',
          displayName: 'Biometric User',
          email: 'biometric@example.com',
          photoURL: null,
          user_metadata: { user_type: 'customer' }
        };
        
        setUser(mockUser);
        localStorage.setItem('health_and_fix_user', JSON.stringify(mockUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Biometric login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<boolean> => {
    setLoading(true);
    try {
      setUser(null);
      localStorage.removeItem('health_and_fix_user');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      // Mock signup
      const mockUser = {
        id: '1',
        displayName,
        email,
        photoURL: null,
        user_metadata: { user_type: 'customer' }
      };
      
      setUser(mockUser);
      localStorage.setItem('health_and_fix_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const setupBiometrics = async (): Promise<boolean> => {
    if (!biometricsAvailable || !user) return false;
    
    try {
      const { success } = await BiometricAuth.setupBiometricLogin({
        userId: user.id,
        token: "mockSecureToken"
      });
      
      return success;
    } catch (error) {
      console.error('Setup biometrics error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      loginWithBiometrics,
      logout, 
      signup,
      setupBiometrics
    }}>
      {children}
    </AuthContext.Provider>
  );
};
