
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <nav className="fixed w-full z-20 top-0 bg-black/50 backdrop-blur-md border-b border-quantum-cyan/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-quantum-cyan neon-text">
            Quantum Eats
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" className="text-quantum-cyan hover:text-white">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
