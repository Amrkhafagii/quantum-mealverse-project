
import React from 'react';
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
import { useReviewSubmission, ReviewSubmissionData } from '@/hooks/useReviewSubmission';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
  images: z.array(z.string()).optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  mealId: string;
  restaurantId: string;
  onSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ 
  mealId, 
  restaurantId,
  onSuccess 
}) => {
  const { uploadedImages, handleImageUpload, removeImage, isMaxImagesReached } = useImageUpload();
  const { submitReview, isSubmitting } = useReviewSubmission();
  
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
      images: [],
    },
  });
  
  const onSubmit = async (values: ReviewFormValues) => {
    // Ensure rating is always provided and valid
    const rating = values.rating || 1;
    
    const reviewData: ReviewSubmissionData = {
      rating: rating, // Ensure rating is always provided
      comment: values.comment,
      mealId,
      restaurantId,
      images: uploadedImages
    };
    
    const success = await submitReview(reviewData);
    
    if (success) {
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
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
                  <FormLabel>Your Review (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your experience with this meal..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
              disabled={isSubmitting || form.getValues('rating') === 0}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
