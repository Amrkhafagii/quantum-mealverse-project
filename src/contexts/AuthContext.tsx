import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { userTypeService } from '@/services/supabaseClient';

interface UserType {
  type: 'customer' | 'restaurant' | 'delivery';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userType: string | null;
  loading: boolean;
  logout: () => Promise<boolean>;
  getUserType: () => Promise<string | null>;
}

const defaultContext: AuthContextType = {
  user: null,
  session: null,
  userType: null,
  loading: true,
  logout: async () => false,
  getUserType: async () => null,
};

export const AuthContext = createContext<AuthContextType>(defaultContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to get user type from either metadata or database
  const getUserType = async (): Promise<string | null> => {
    // Skip if no user
    if (!user) return null;
    
    // First check metadata
    const metadataType = user.user_metadata?.user_type;
    if (metadataType) return metadataType;
    
    // If not in metadata, check our user_types table
    try {
      const type = await userTypeService.getUserType(user.id);
      if (type) {
        return type;
      }
    } catch (error) {
      console.error('Error fetching user type:', error);
    }
    
    // Default to customer if not found
    return 'customer';
  };

  // Load user type whenever user changes
  useEffect(() => {
    const loadUserType = async () => {
      if (user) {
        const type = await getUserType();
        setUserType(type);
      } else {
        setUserType(null);
      }
    };
    
    loadUserType();
  }, [user]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        setUser(session?.user ?? null);
        setSession(session);
        
        // Get user type when auth state changes
        if (session?.user) {
          const type = await getUserType();
          setUserType(type);
        } else {
          setUserType(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      setSession(session);
      
      // Get user type on initial load
      if (session?.user) {
        const type = await getUserType();
        setUserType(type);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    try {
      console.log("Logging out user:", user?.email);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error during signOut:", error);
        throw error;
      }
      
      // Clear user and session state immediately for better UX
      setUser(null);
      setSession(null);
      setUserType(null);
      
      console.log("Logout successful");
      navigate('/login');
      return true;
    } catch (error) {
      console.error('Error logging out:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, userType, loading, logout, getUserType }}>
      {children}
    </AuthContext.Provider>
  );
};
