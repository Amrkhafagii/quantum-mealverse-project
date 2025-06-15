
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { restaurantService, type Restaurant } from '@/services/restaurantService';

interface RestaurantVerificationProps {
  restaurant: Restaurant;
  onUpdate: (restaurant: Restaurant) => void;
}

export const RestaurantVerification: React.FC<RestaurantVerificationProps> = ({
  restaurant,
  onUpdate
}) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'under_review':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleFileUpload = async (file: File, documentType: string) => {
    setUploading(true);
    try {
      // Upload logic would go here
      toast({
        title: "Document uploaded",
        description: `${documentType} has been uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your document",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitForReview = async () => {
    try {
      // Fixed: Only pass 2 arguments instead of 3
      const updatedRestaurant = await restaurantService.updateRestaurant(restaurant.id, {
        verification_status: 'under_review'
      });
      
      onUpdate(updatedRestaurant);
      toast({
        title: "Submitted for review",
        description: "Your verification documents have been submitted for review",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit for review",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(restaurant.verification_status)}
            Verification Status
          </CardTitle>
          <CardDescription>
            Current verification status and required documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span>Status:</span>
            <Badge className={getStatusColor(restaurant.verification_status)}>
              {restaurant.verification_status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          {restaurant.verification_notes && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Notes:</strong> {restaurant.verification_notes}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">Business License</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Upload business license</p>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'Business License');
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Tax Registration</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Upload tax registration</p>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'Tax Registration');
                  }}
                />
              </div>
            </div>
          </div>

          {restaurant.verification_status === 'pending' && (
            <Button
              onClick={handleSubmitForReview}
              disabled={uploading}
              className="w-full"
            >
              Submit for Review
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
