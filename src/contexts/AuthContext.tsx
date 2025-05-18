
import React, { createContext, useContext, useState, ReactNode } from 'react';

type User = {
  id: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
  signup: async () => {},
});

export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Mock login for now
    setUser({
      id: '1',
      displayName: 'Test User',
      email,
      photoURL: null,
    });
  };

  const logout = async () => {
    setUser(null);
  };

  const signup = async (email: string, password: string, displayName: string) => {
    // Mock signup
    setUser({
      id: '1',
      displayName,
      email,
      photoURL: null,
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};
