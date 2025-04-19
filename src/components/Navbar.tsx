
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut, User, UserRound } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = React.useState(null);

  React.useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkAdminStatus(session?.user?.id);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkAdminStatus(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId) => {
    if (!userId) return;
    
    const { data } = await supabase
      .from('admin_users')
      .select()
      .eq('user_id', userId)
      .maybeSingle();
      
    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const toggleUserView = (checked: boolean) => {
    if (checked) {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="fixed w-full z-20 top-0 bg-black/50 backdrop-blur-md border-b border-quantum-cyan/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-quantum-cyan neon-text">
            Quantum Eats
          </Link>
          
          <div className="flex items-center gap-4">
            {session ? (
              <>
                {isAdmin && (
                  <div className="flex items-center gap-2 text-quantum-cyan">
                    <span className="text-sm">Customer</span>
                    <Switch onCheckedChange={toggleUserView} />
                    <span className="text-sm">Admin</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-quantum-cyan" />
                  <span className="text-quantum-cyan">{session.user.email}</span>
                </div>
                <Button 
                  variant="ghost" 
                  className="text-quantum-cyan hover:text-white"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" className="text-quantum-cyan hover:text-white">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
