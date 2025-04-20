
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './StarRating';
import { toast } from 'sonner';
import { Review } from '@/types/review';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

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
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
      images: [],
    },
  });
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      const newImages = [...uploadedImages];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Limit to images smaller than 5MB
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Image file size must be less than 5MB');
          continue;
        }
        
        // Ensure it's an image
        if (!file.type.startsWith('image/')) {
          toast.error('Only image files are allowed');
          continue;
        }
        
        const filename = `${user?.id}_${Date.now()}_${i}`;
        const { data, error } = await supabase.storage
          .from('review-images')
          .upload(filename, file);
          
        if (error) {
          toast.error('Failed to upload image');
          console.error(error);
          continue;
        }
        
        const { data: urlData } = supabase.storage
          .from('review-images')
          .getPublicUrl(data.path);
          
        newImages.push(urlData.publicUrl);
      }
      
      setUploadedImages(newImages);
      form.setValue('images', newImages);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    }
  };
  
  const onSubmit = async (values: ReviewFormValues) => {
    if (!user) {
      toast.error('You must be logged in to submit a review');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if the user has already reviewed this meal at this restaurant
      const { data: existingReviews } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('meal_id', mealId)
        .eq('restaurant_id', restaurantId);
        
      if (existingReviews && existingReviews.length > 0) {
        toast.error('You have already reviewed this meal from this restaurant');
        setIsSubmitting(false);
        return;
      }
      
      // Verify that the user has ordered this meal from this restaurant
      const { data: orders } = await supabase
        .from('order_items')
        .select('order_id')
        .eq('meal_id', mealId)
        .eq('user_id', user.id);
        
      const isVerifiedPurchase = orders && orders.length > 0;
      
      // Create the review
      const review: Partial<Review> = {
        user_id: user.id,
        meal_id: mealId,
        restaurant_id: restaurantId,
        rating: values.rating,
        comment: values.comment,
        images: values.images,
        is_verified_purchase: isVerifiedPurchase,
        status: 'pending',
      };
      
      const { error } = await supabase
        .from('reviews')
        .insert(review);
        
      if (error) {
        throw error;
      }
      
      toast.success('Review submitted successfully!');
      
      // Reset the form
      form.reset();
      setUploadedImages([]);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
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
            
            <div>
              <FormLabel>Add Photos (Optional)</FormLabel>
              <div className="mt-2 flex flex-wrap gap-2">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative w-20 h-20">
                    <img
                      src={image}
                      alt={`Uploaded ${index + 1}`}
                      className="w-full h-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      onClick={() => {
                        const newImages = [...uploadedImages];
                        newImages.splice(index, 1);
                        setUploadedImages(newImages);
                        form.setValue('images', newImages);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                  <Camera className="w-6 h-6 text-gray-400" />
                  <span className="text-xs mt-1 text-gray-500">Add Photo</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploadedImages.length >= 5}
                  />
                </label>
              </div>
              {uploadedImages.length >= 5 && (
                <p className="text-xs text-gray-500 mt-1">Maximum 5 images allowed</p>
              )}
            </div>
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
