
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useDeliveryUser } from '@/hooks/useDeliveryUser';
import { updateDeliveryUserStatus } from '@/services/delivery/deliveryService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  PackageCheck, 
  TrendingUp, 
  Calendar, 
  ChevronDown, 
  DollarSign, 
  Bike, 
  MapPin,
  User,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { DeliveryUser } from '@/types/delivery';
import ParticleBackground from '@/components/ParticleBackground';
import Navbar from '@/components/Navbar';
import { ActiveDeliveries } from '@/components/delivery/dashboard/ActiveDeliveries';
import { DeliveryHistory } from '@/components/delivery/dashboard/DeliveryHistory';
import { EarningsSummary } from '@/components/delivery/dashboard/EarningsSummary';

const DeliveryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(false);
  const [activeTab, setActiveTab] = useState('current');
  
  const { 
    deliveryUser,
    loading: deliveryUserLoading, 
    error: deliveryUserError,
    refreshDeliveryUser
  } = useDeliveryUser(user?.id);
  
  useEffect(() => {
    // If user is not a delivery user yet, redirect to onboarding
    if (!authLoading && !deliveryUserLoading && !deliveryUser && !deliveryUserError) {
      navigate('/delivery/onboarding');
    }
  }, [authLoading, deliveryUserLoading, deliveryUser, deliveryUserError, navigate]);

  // Set initial online status based on delivery user status
  useEffect(() => {
    if (deliveryUser) {
      setIsOnline(deliveryUser.status === 'active');
    }
  }, [deliveryUser]);

  const handleStatusToggle = async () => {
    if (!user?.id || !deliveryUser) return;
    
    try {
      const newStatus = isOnline ? 'inactive' : 'active';
      await updateDeliveryUserStatus(user.id, newStatus);
      setIsOnline(!isOnline);
      
      toast({
        title: isOnline ? "You're now offline" : "You're now online",
        description: isOnline 
          ? "You won't receive new delivery requests" 
          : "You'll start receiving delivery requests",
      });
      
      refreshDeliveryUser();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Status update failed",
        description: "Couldn't update your availability status.",
        variant: "destructive"
      });
    }
  };

  if (authLoading || deliveryUserLoading) {
    return (
      <div className="min-h-screen bg-quantum-black flex flex-col items-center justify-center">
        <div className="animate-pulse text-quantum-cyan">Loading dashboard...</div>
      </div>
    );
  }
  
  if (!deliveryUser) {
    return (
      <div className="min-h-screen bg-quantum-black flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
          <p className="text-gray-400 mb-6">You need to complete your delivery profile before accessing the dashboard.</p>
          <Button onClick={() => navigate('/delivery/onboarding')}>
            Complete Profile
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-quantum-black flex flex-col">
      <ParticleBackground />
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-10 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Delivery Dashboard</h1>
            <p className="text-gray-400">Welcome back, {deliveryUser.first_name}</p>
          </div>
          
          <div className="flex items-center mt-4 md:mt-0">
            <div className="mr-4 flex items-center">
              <div className={`h-3 w-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-300">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <Switch 
              checked={isOnline} 
              onCheckedChange={handleStatusToggle}
              disabled={!deliveryUser.is_approved}
            />
          </div>
        </div>
        
        {!deliveryUser.is_approved && (
          <Card className="mb-8 bg-amber-900/20 border-amber-500/30">
            <CardContent className="p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-500">Account Pending Approval</h3>
                  <p className="text-sm text-gray-300">
                    Your delivery account is currently under review. You'll be able to receive delivery
                    requests once your account is approved.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatusCard 
            title="Account Status" 
            icon={<User className="h-5 w-5" />}
            value={deliveryUser.is_approved ? "Approved" : "Pending Approval"}
            variant={deliveryUser.is_approved ? "success" : "warning"}
          />
          <StatusCard 
            title="Total Deliveries" 
            icon={<PackageCheck className="h-5 w-5" />}
            value={deliveryUser.total_deliveries.toString()}
            variant="default"
          />
          <StatusCard 
            title="Rating" 
            icon={<TrendingUp className="h-5 w-5" />}
            value={`${deliveryUser.average_rating.toFixed(1)} / 5.0`}
            variant={deliveryUser.average_rating >= 4.5 ? "success" : "default"}
          />
        </div>
        
        <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="current">Current Deliveries</TabsTrigger>
            <TabsTrigger value="history">Delivery History</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="space-y-4">
            <ActiveDeliveries deliveryUserId={deliveryUser.id} />
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <DeliveryHistory deliveryUserId={deliveryUser.id} />
          </TabsContent>
          
          <TabsContent value="earnings" className="space-y-4">
            <EarningsSummary deliveryUserId={deliveryUser.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface StatusCardProps {
  title: string;
  icon: React.ReactNode;
  value: string;
  variant: 'default' | 'success' | 'warning' | 'error';
}

const StatusCard: React.FC<StatusCardProps> = ({ title, icon, value, variant = 'default' }) => {
  const variantStyles = {
    default: "bg-quantum-darkBlue/50 border-quantum-cyan/20",
    success: "bg-green-900/20 border-green-500/30",
    warning: "bg-amber-900/20 border-amber-500/30",
    error: "bg-red-900/20 border-red-500/30"
  };
  
  return (
    <Card className={`${variantStyles[variant]}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="mr-3 bg-quantum-black/30 p-2 rounded-full">
              {icon}
            </div>
            <div>
              <p className="text-sm text-gray-400">{title}</p>
              <p className="text-xl font-semibold mt-1">{value}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryDashboard;
