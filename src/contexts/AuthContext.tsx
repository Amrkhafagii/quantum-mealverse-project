
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { userTypeService } from '@/services/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

export interface UserWithMetadata extends User {
  user_metadata: {
    user_type?: string;
    [key: string]: any;
  };
}

interface AuthContextType {
  user: UserWithMetadata | null;
  session: Session | null;
  userType: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserWithMetadata | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserType = async (currentUser: User | null) => {
    if (!currentUser) {
      setUserType(null);
      return;
    }

    try {
      // First check user metadata
      const userMetadata = currentUser?.user_metadata as { user_type?: string } | undefined;
      console.log('AuthContext - User metadata:', userMetadata);
      
      if (userMetadata?.user_type) {
        console.log('AuthContext - Found user type in metadata:', userMetadata.user_type);
        setUserType(userMetadata.user_type);
        return;
      }

      // If not in metadata, check database
      console.log('AuthContext - Checking database for user type:', currentUser.id);
      const type = await userTypeService.getUserType(currentUser.id);
      console.log('AuthContext - Found user type in database:', type);
      setUserType(type);
    } catch (error) {
      console.error('AuthContext - Error fetching user type:', error);
      setUserType(null);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthContext - Initial session:', session);
      console.log('AuthContext - Initial user metadata:', session?.user?.user_metadata);
      setSession(session);
      setUser(session?.user as UserWithMetadata ?? null);
      
      // Fetch user type
      fetchUserType(session?.user ?? null).finally(() => {
        setLoading(false);
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('AuthContext - Auth state changed:', _event, session);
      console.log('AuthContext - User metadata in auth change:', session?.user?.user_metadata);
      setSession(session);
      setUser(session?.user as UserWithMetadata ?? null);
      
      // Fetch user type for new session
      fetchUserType(session?.user ?? null).finally(() => {
        setLoading(false);
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const logout = async (): Promise<boolean> => {
    try {
      await supabase.auth.signOut();
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    userType,
    loading,
    login,
    logout,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
