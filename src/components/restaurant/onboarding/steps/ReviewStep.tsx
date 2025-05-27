
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, FileText, Clock, MapPin, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { onboardingService } from '@/services/onboarding/onboardingService';
import type { RestaurantDocument, OperationalHours, DeliveryArea } from '@/types/onboarding';

interface ReviewStepProps {
  restaurantId: string;
  onComplete: () => void;
  onSubmit: () => Promise<void>;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ restaurantId, onComplete, onSubmit }) => {
  const { restaurant } = useRestaurantAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<RestaurantDocument[]>([]);
  const [hours, setHours] = useState<OperationalHours[]>([]);
  const [areas, setAreas] = useState<DeliveryArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAllData();
  }, [restaurantId]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [docsData, hoursData, areasData] = await Promise.all([
        onboardingService.getRestaurantDocuments(restaurantId),
        onboardingService.getOperationalHours(restaurantId),
        onboardingService.getDeliveryAreas(restaurantId)
      ]);
      
      setDocuments(docsData);
      setHours(hoursData);
      setAreas(areasData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load review data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    try {
      setSubmitting(true);
      await onSubmit();
      onComplete();
    } catch (error) {
      console.error('Error submitting for review:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit for review',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getDocumentStatusSummary = () => {
    const total = documents.length;
    const approved = documents.filter(d => d.verification_status === 'approved').length;
    const pending = documents.filter(d => d.verification_status === 'pending').length;
    const rejected = documents.filter(d => d.verification_status === 'rejected').length;
    
    return { total, approved, pending, rejected };
  };

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan"></div>
      </div>
    );
  }

  const docSummary = getDocumentStatusSummary();

  return (
    <div className="space-y-6">
      {/* Restaurant Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            Restaurant Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Name:</strong> {restaurant?.name}</p>
              <p><strong>Email:</strong> {restaurant?.email}</p>
              <p><strong>Phone:</strong> {restaurant?.phone}</p>
              <p><strong>Cuisine:</strong> {restaurant?.cuisine_type}</p>
            </div>
            <div>
              <p><strong>Address:</strong> {restaurant?.address}</p>
              <p><strong>City:</strong> {restaurant?.city}</p>
              <p><strong>Delivery Radius:</strong> {restaurant?.delivery_radius}km</p>
              <p><strong>Min Order:</strong> ${restaurant?.minimum_order_amount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Documents ({docSummary.total} uploaded)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{docSummary.approved}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{docSummary.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{docSummary.rejected}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>
          
          <div className="space-y-2">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="font-medium">{doc.document_type.replace('_', ' ')}</span>
                <Badge className={
                  doc.verification_status === 'approved' ? 'bg-green-100 text-green-800' :
                  doc.verification_status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }>
                  {doc.verification_status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Operating Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {DAYS.map((day, index) => {
              const dayHours = hours.find(h => h.day_of_week === index);
              return (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">{day}</span>
                  <span className="text-sm">
                    {dayHours?.is_open ? 
                      `${dayHours.open_time} - ${dayHours.close_time}` : 
                      'Closed'
                    }
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Delivery Areas ({areas.length} configured)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {areas.map(area => (
              <div key={area.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{area.area_name}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    ({area.radius_km}km, ${area.delivery_fee} fee)
                  </span>
                </div>
                <Badge variant={area.is_active ? 'default' : 'secondary'}>
                  {area.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-blue-900">Ready to Submit</h4>
            <p className="text-sm text-blue-700 mt-1">
              Once submitted, your restaurant profile will be reviewed by our team. 
              You'll receive an email notification about the approval status within 24-48 hours.
            </p>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleSubmitForReview} 
        disabled={submitting} 
        className="w-full"
        size="lg"
      >
        {submitting ? 'Submitting for Review...' : 'Submit for Review'}
      </Button>
    </div>
  );
};
