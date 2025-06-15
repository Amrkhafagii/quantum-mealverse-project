
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
  signUp: (email: string, password: string, userType?: string, metadata?: Record<string, any>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserWithMetadata | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Updated: fetchUserType grabs from user_types with correct column
  const fetchUserType = async (currentUser: User | null) => {
    if (!currentUser) {
      setUserType(null);
      return;
    }

    try {
      const userMetadata = currentUser?.user_metadata as { user_type?: string } | undefined;
      if (userMetadata?.user_type) {
        setUserType(userMetadata.user_type);
        return;
      }
      // Query user_types using user_types_user_id
      const { data, error } = await supabase
        .from('user_types')
        .select('type')
        .eq('user_types_user_id', currentUser.id)
        .single();

      setUserType(data?.type ?? null);
    } catch (error) {
      console.error('AuthContext - Error fetching user type:', error);
      setUserType(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(session);
        setUser(session?.user as UserWithMetadata ?? null);

        await fetchUserType(session?.user ?? null);

        if (mounted) {
          setIsInitialized(true);
          setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setIsInitialized(true);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user as UserWithMetadata ?? null);

      if (session?.user && isInitialized) {
        await fetchUserType(session.user);
      } else if (!session) {
        setUserType(null);
      }

      if (mounted && isInitialized) setLoading(false);
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

  const signUp = async (
    email: string,
    password: string,
    userType?: string,
    metadata?: Record<string, any>
  ) => {
    const redirectUrl = window.location.origin + "/";
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          user_type: userType,
          ...metadata,
        },
      },
    });
    if (error) throw error;
  };

  const logout = async (): Promise<boolean> => {
    try {
      await supabase.auth.signOut();
      return true;
    } catch (error) {
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
    signUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
