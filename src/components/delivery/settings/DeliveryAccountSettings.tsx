import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DeliveryUser } from "@/types/delivery";
import { toast } from "sonner";
import { updateDeliveryUserStatus } from "@/services/delivery/deliveryService";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Mail } from "lucide-react";

interface DeliveryAccountSettingsProps {
  deliveryUser: DeliveryUser;
  onUpdate: () => void;
}

const DeliveryAccountSettings: React.FC<DeliveryAccountSettingsProps> = ({
  deliveryUser,
  onUpdate,
}) => {
  const [availableForDelivery, setAvailableForDelivery] = useState(
    deliveryUser.status === "active"
  );
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [resetPasswordSent, setResetPasswordSent] = useState(false);
  
  const handleStatusChange = async (checked: boolean) => {
    try {
      setUpdatingStatus(true);
      await updateDeliveryUserStatus(
        deliveryUser.delivery_users_user_id, // Updated field name
        checked ? "active" : "inactive"
      );
      setAvailableForDelivery(checked);
      onUpdate();
      toast.success(`Status updated to ${checked ? "active" : "inactive"}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
      setAvailableForDelivery(deliveryUser.status === "active");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        deliveryUser.delivery_users_user_id, // Updated field name
        { redirectTo: window.location.origin + "/auth" }
      );
      
      if (error) throw error;
      
      setResetPasswordSent(true);
      toast.success("Password reset email sent");
    } catch (error) {
      console.error("Error sending password reset:", error);
      toast.error("Failed to send password reset email");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Availability Status</h3>
              <p className="text-sm text-gray-400 mt-1">
                Toggle to change your availability for deliveries
              </p>
            </div>
            <Switch
              checked={availableForDelivery}
              onCheckedChange={handleStatusChange}
              disabled={updatingStatus}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium flex items-center">
            <Lock className="mr-2 h-4 w-4" /> Password & Security
          </h3>
          <p className="text-sm text-gray-400 mt-1 mb-4">
            Manage your login credentials and account security
          </p>
          
          <Button
            onClick={handleResetPassword}
            disabled={resetPasswordSent}
            className="flex w-full items-center justify-center"
            variant="outline"
          >
            <Mail className="mr-2 h-4 w-4" />
            {resetPasswordSent ? "Password Reset Email Sent" : "Reset Password"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium">User Account Information</h3>
          <p className="text-sm text-gray-400 mt-1 mb-4">
            Your account details and identification
          </p>
          
          <div className="space-y-2">
            <div className="grid grid-cols-3 items-center">
              <Label className="col-span-1 text-muted-foreground">User ID:</Label>
              <span className="col-span-2 truncate text-sm">{deliveryUser.delivery_users_user_id}</span>
            </div>
            <div className="grid grid-cols-3 items-center">
              <Label className="col-span-1 text-muted-foreground">Status:</Label>
              <span className={`col-span-2 text-sm ${
                deliveryUser.status === "active" ? "text-green-500" : 
                deliveryUser.status === "on_break" ? "text-yellow-500" : 
                "text-red-500"
              }`}>
                {deliveryUser.status === "active" ? "Active" : 
                 deliveryUser.status === "on_break" ? "On Break" : 
                 deliveryUser.status === "inactive" ? "Inactive" : "Suspended"}
              </span>
            </div>
            <div className="grid grid-cols-3 items-center">
              <Label className="col-span-1 text-muted-foreground">Joined:</Label>
              <span className="col-span-2 text-sm">
                {new Date(deliveryUser.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryAccountSettings;
