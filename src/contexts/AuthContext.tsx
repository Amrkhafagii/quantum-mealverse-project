import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
  logout: () => Promise<boolean>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => false,
  signup: async () => {},
});

export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulate checking for a stored session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('quantum_mealverse_user');
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
      localStorage.setItem('quantum_mealverse_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<boolean> => {
    setLoading(true);
    try {
      setUser(null);
      localStorage.removeItem('quantum_mealverse_user');
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
      localStorage.setItem('quantum_mealverse_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};
