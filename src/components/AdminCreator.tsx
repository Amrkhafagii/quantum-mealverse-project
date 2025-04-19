
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminCreator = () => {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Check for the current user ID on component mount
  React.useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUserId(data.user.id);
        setUserId(data.user.id); // Pre-fill the form with current user ID
      }
    };
    checkUser();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast({
        title: "Error",
        description: "Please enter a valid user ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('admin_users')
        .insert([{ user_id: userId }]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Admin user created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto holographic-card">
      <h2 className="text-2xl font-bold text-quantum-cyan mb-4 neon-text">Admin Creator</h2>
      
      {currentUserId ? (
        <div className="mb-4">
          <p className="text-white">Your current user ID is:</p>
          <p className="text-quantum-cyan break-all font-mono">{currentUserId}</p>
        </div>
      ) : (
        <p className="text-amber-400 mb-4">You are not currently logged in</p>
      )}

      <form onSubmit={handleCreateAdmin}>
        <div className="space-y-4">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium mb-1">
              User ID to make admin
            </label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
              className="w-full"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full cyber-button" 
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Make Admin User'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AdminCreator;
