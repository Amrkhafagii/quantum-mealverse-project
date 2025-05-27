
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
  const [isInitialized, setIsInitialized] = useState(false);

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
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        console.log('AuthContext - Initial session:', session);
        setSession(session);
        setUser(session?.user as UserWithMetadata ?? null);
        
        // Fetch user type
        await fetchUserType(session?.user ?? null);
        
        if (mounted) {
          setIsInitialized(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('AuthContext - Error initializing auth:', error);
        if (mounted) {
          setIsInitialized(true);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('AuthContext - Auth state changed:', event);
      
      // Batch state updates to prevent multiple renders
      setSession(session);
      setUser(session?.user as UserWithMetadata ?? null);
      
      // Only fetch user type if we have a session and we're initialized
      if (session?.user && isInitialized) {
        await fetchUserType(session.user);
      } else if (!session) {
        setUserType(null);
      }
      
      if (mounted && isInitialized) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isInitialized]);

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
