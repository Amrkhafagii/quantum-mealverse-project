
import React from 'react';
import { Card } from "@/components/ui/card";
import ParticleBackground from '@/components/ParticleBackground';
import Navbar from '@/components/Navbar';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { DeliveryManagementDashboard } from '@/components/admin/delivery/DeliveryManagementDashboard';
import { useAdmin } from '@/hooks/useAdmin';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoIcon, Truck } from "lucide-react";

const Admin = () => {
  const { isAdmin, meals, loading } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen bg-quantum-black text-white flex items-center justify-center">
        <div className="text-quantum-cyan text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-24 px-4 container mx-auto">
        {isAdmin ? (
          <Tabs defaultValue="meals" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="meals">Meals Management</TabsTrigger>
              <TabsTrigger value="delivery">Delivery Management</TabsTrigger>
            </TabsList>

            <TabsContent value="meals">
              <Alert className="mb-6 border-blue-500 bg-blue-950/30">
                <InfoIcon className="h-5 w-5 text-blue-500" />
                <AlertTitle className="text-blue-400">Feature Update</AlertTitle>
                <AlertDescription>
                  The meal management functionality has been removed. The meal catalog is now view-only.
                </AlertDescription>
              </Alert>
              <AdminDashboard meals={meals} />
            </TabsContent>

            <TabsContent value="delivery">
              <DeliveryManagementDashboard />
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="p-6 max-w-md mx-auto">
            <p className="text-center text-red-400">Access denied. You need admin privileges.</p>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Admin;
