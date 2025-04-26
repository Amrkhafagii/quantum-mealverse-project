
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './StarRating';
import { ImageUploadSection } from './ImageUploadSection';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useEnhancedReviewSubmission } from '@/hooks/useEnhancedReviewSubmission';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, Clock, CheckCircle2, ShoppingBag, CalendarIcon } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/components/ui/use-toast";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z.string().min(15, 'Please provide at least 15 characters for your review').max(1000).optional(),
  images: z.array(z.string()).optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface EnhancedReviewFormProps {
  mealId: string;
  restaurantId: string;
  onSuccess?: () => void;
}

export const EnhancedReviewForm: React.FC<EnhancedReviewFormProps> = ({ 
  mealId, 
  restaurantId,
  onSuccess 
}) => {
  const { uploadedImages, handleImageUpload, removeImage, isMaxImagesReached } = useImageUpload();
  const { submitReview, checkVerificationStatus, verificationStatus, isSubmitting } = useEnhancedReviewSubmission();
  const [formStartTime, setFormStartTime] = useState<number>(Date.now());
  const [aiContentScore, setAiContentScore] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
      images: [],
    },
  });

  // Check verification status when component mounts
  useEffect(() => {
    if (user) {
      checkVerificationStatus(mealId);
      // Start the form timer
      setFormStartTime(Date.now());
    }
  }, [mealId, user]);

  // Simulated AI content analysis (in real app, this would call an API)
  const analyzeReviewContent = (text: string): number => {
    // Simplified AI content scoring simulation
    if (!text) return 0;
    
    const wordCount = text.split(/\s+/).length;
    const hasDetails = text.length > 50;
    const hasMealSpecificTerms = /taste|flavor|texture|portion|temperature|quality|experience|recommend/i.test(text);
    
    // Calculate a basic score (0-100)
    let score = 0;
    if (wordCount > 5) score += 20;
    if (wordCount > 20) score += 20;
    if (hasDetails) score += 30;
    if (hasMealSpecificTerms) score += 30;
    
    return Math.min(100, score);
  };

  // Update AI content score when comment changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'comment') {
        const comment = value.comment;
        if (comment) {
          const score = analyzeReviewContent(comment);
          setAiContentScore(score);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);
  
  const onSubmit = async (values: ReviewFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a review",
        variant: "destructive"
      });
      return;
    }

    // Calculate time spent on form
    const experienceTime = Math.floor((Date.now() - formStartTime) / 1000);
    
    // Ensure rating is always provided and valid
    const rating = values.rating || 1;
    
    const reviewData = {
      rating,
      comment: values.comment,
      mealId,
      restaurantId,
      images: uploadedImages,
      reviewMetadata: {
        experienceTime,
        deviceInfo: navigator.userAgent,
        aiContentScore: aiContentScore || 0,
      }
    };
    
    const success = await submitReview(reviewData);
    
    if (success) {
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!"
      });
      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    }
  };
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newImages = await handleImageUpload(e.target.files);
    if (newImages) {
      form.setValue('images', newImages);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              Please sign in to write a review for this meal.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const renderVerificationStatus = () => {
    if (!verificationStatus) return null;
    
    if (!verificationStatus.isVerified) {
      return (
        <Alert variant="destructive" className="mb-4">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Not Verified</AlertTitle>
          <AlertDescription>
            You haven't purchased this meal. Only verified purchasers can leave reviews.
          </AlertDescription>
        </Alert>
      );
    }
    
    if (!verificationStatus.canReview) {
      return (
        <Alert className="mb-4">
          <Clock className="h-4 w-4" />
          <AlertTitle>Please Wait</AlertTitle>
          <AlertDescription>
            You can review this meal in {verificationStatus.waitTimeHours} more hours. 
            We require at least 24 hours after delivery to ensure a complete experience.
          </AlertDescription>
        </Alert>
      );
    }
    
    return (
      <Alert className="mb-4">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Verified Purchase</AlertTitle>
        <AlertDescription>
          <div className="space-y-2">
            <p>You've purchased this meal {verificationStatus.purchaseCount} time(s).</p>
            {verificationStatus.orderDate && (
              <div className="flex gap-2 text-xs items-center">
                <CalendarIcon className="h-3 w-3" />
                <span>Ordered: {format(new Date(verificationStatus.orderDate), 'PPP')}</span>
              </div>
            )}
            {verificationStatus.deliveryDate && (
              <div className="flex gap-2 text-xs items-center">
                <ShoppingBag className="h-3 w-3" />
                <span>Delivered: {format(new Date(verificationStatus.deliveryDate), 'PPP')}</span>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  const renderContentQualityFeedback = () => {
    if (!aiContentScore) return null;
    
    let message = "";
    let variant: "default" | "destructive" = "default";
    
    if (aiContentScore < 30) {
      message = "Your review lacks detail. Consider adding specific experiences with this meal.";
      variant = "destructive";
    } else if (aiContentScore < 70) {
      message = "Good start! Adding details about taste and quality would help others.";
      variant = "default";
    } else {
      message = "Great review! Your detailed feedback will be helpful to others.";
      variant = "default";
    }
    
    return (
      <Alert variant={variant} className="mt-2">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      
      {renderVerificationStatus()}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <StarRating 
                      rating={field.value} 
                      interactive 
                      size="lg"
                      onRatingChange={(value) => field.onChange(value)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your experience with this meal. What did you like or dislike? How was the taste, texture, and portion size?"
                      className="resize-none min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  {renderContentQualityFeedback()}
                </FormItem>
              )}
            />
            
            <ImageUploadSection
              uploadedImages={uploadedImages}
              onImageUpload={handleImageChange}
              onImageRemove={(index) => {
                const newImages = removeImage(index);
                form.setValue('images', newImages);
              }}
              isMaxImagesReached={isMaxImagesReached}
            />
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              disabled={
                isSubmitting || 
                form.getValues('rating') === 0 || 
                !verificationStatus?.isVerified || 
                !verificationStatus?.canReview
              }
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
