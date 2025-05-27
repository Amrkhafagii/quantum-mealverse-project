
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, AlertCircle, FileText, Clock, MapPin, Store } from 'lucide-react';
import { onboardingService } from '@/services/onboarding/onboardingService';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';

interface ReviewStepProps {
  restaurantId: string;
  onComplete: () => void;
  onSubmit: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ restaurantId, onComplete, onSubmit }) => {
  const { restaurant } = useRestaurantAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState({
    documents: 0,
    operationalHours: 0,
    deliveryAreas: 0
  });

  useEffect(() => {
    loadSummary();
  }, [restaurantId]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const [docs, hours, areas] = await Promise.all([
        onboardingService.getRestaurantDocuments(restaurantId),
        onboardingService.getOperationalHours(restaurantId),
        onboardingService.getDeliveryAreas(restaurantId)
      ]);
      
      setSummary({
        documents: docs.length,
        operationalHours: hours.filter(h => h.is_open).length,
        deliveryAreas: areas.length
      });
    } catch (error) {
      console.error('Error loading summary:', error);
      toast({
        title: 'Error',
        description: 'Failed to load onboarding summary',
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
      toast({
        title: 'Success',
        description: 'Your restaurant profile has been submitted for review',
      });
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan"></div>
      </div>
    );
  }

  const isComplete = summary.documents > 0 && summary.operationalHours > 0 && summary.deliveryAreas > 0;

  return (
    <div className="space-y-6">
      {/* Restaurant Information Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Store className="h-5 w-5 mr-2" />
            Restaurant Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Name:</strong> {restaurant?.name}</p>
              <p><strong>Email:</strong> {restaurant?.email}</p>
              <p><strong>Phone:</strong> {restaurant?.phone}</p>
            </div>
            <div>
              <p><strong>Address:</strong> {restaurant?.address}</p>
              <p><strong>City:</strong> {restaurant?.city}</p>
              <p><strong>Cuisine:</strong> {restaurant?.cuisine_type || 'Not specified'}</p>
            </div>
          </div>
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Complete
          </Badge>
        </CardContent>
      </Card>

      {/* Documents Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Documents Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p>{summary.documents} documents uploaded</p>
            {summary.documents > 0 ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Incomplete
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Operational Hours Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Operational Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p>{summary.operationalHours} days configured</p>
            {summary.operationalHours > 0 ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Incomplete
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Areas Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Delivery Areas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p>{summary.deliveryAreas} delivery areas configured</p>
            {summary.deliveryAreas > 0 ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Incomplete
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Section */}
      <Card>
        <CardContent className="pt-6">
          {isComplete ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center text-green-600">
                <CheckCircle className="h-8 w-8 mr-2" />
                <h3 className="text-lg font-semibold">Ready for Review</h3>
              </div>
              <p className="text-gray-600">
                All required information has been provided. Click below to submit your restaurant for approval.
              </p>
              <Button 
                onClick={handleSubmitForReview} 
                disabled={submitting}
                className="w-full"
                size="lg"
              >
                {submitting ? 'Submitting...' : 'Submit for Review'}
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center text-orange-600">
                <AlertCircle className="h-8 w-8 mr-2" />
                <h3 className="text-lg font-semibold">Incomplete Information</h3>
              </div>
              <p className="text-gray-600">
                Please complete all previous steps before submitting for review.
              </p>
              <Button disabled className="w-full" size="lg">
                Complete All Steps First
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
