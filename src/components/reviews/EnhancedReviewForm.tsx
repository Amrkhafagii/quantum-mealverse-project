
import React, { useEffect } from 'react';
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
import { VerificationStatusAlert } from './VerificationStatusAlert';
import { useReviewFormTimer } from '@/hooks/useReviewFormTimer';
import { useReviewContentAnalysis } from '@/hooks/useReviewContentAnalysis';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
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
  onSuccess,
}) => {
  const { uploadedImages, handleImageUpload, removeImage, isMaxImagesReached } = useImageUpload();
  const { submitReview, isSubmitting, checkVerificationStatus, verificationStatus } = useEnhancedReviewSubmission();
  const { seconds, reset: resetTimer } = useReviewFormTimer(true);
  const { score, analyze, loading: analyzing } = useReviewContentAnalysis();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
      images: [],
    },
  });

  // Check verification on load and when meal changes
  useEffect(() => {
    checkVerificationStatus(mealId);
    // eslint-disable-next-line
  }, [mealId]);

  // Analyze content as user types (optional, can be enhanced)
  useEffect(() => {
    const comment = form.watch('comment');
    if (typeof comment === 'string') {
      analyze(comment);
    }
    // eslint-disable-next-line
  }, [form.watch('comment')]);

  const onSubmit = async (values: ReviewFormValues) => {
    const reviewData = {
      rating: values.rating ?? 1,
      comment: values.comment,
      mealId,
      restaurantId,
      images: uploadedImages,
      reviewMetadata: {
        experienceTime: seconds,
        deviceInfo: typeof window !== 'undefined' ? window.navigator.userAgent : '',
        aiContentScore: score ?? undefined,
      },
    };
    const success = await submitReview(reviewData);
    if (success) {
      form.reset();
      resetTimer();
      if (onSuccess) onSuccess();
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
            <VerificationStatusAlert verificationStatus={verificationStatus} />

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
                      onRatingChange={field.onChange}
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
                  {/* Automated AI Content Score Feedback */}
                  {typeof score === "number" && (
                    <div className="text-xs mt-1 text-gray-400">
                      Quality Score: <b>{score}</b> / 100 {analyzing && <>...</>}
                    </div>
                  )}
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

            {/* Timer display for transparency */}
            <div className="text-xs text-gray-400">
              Time spent: <b>{seconds}</b> seconds
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                form.getValues('rating') === 0 ||
                verificationStatus?.isVerified === false ||
                (verificationStatus?.isVerified && verificationStatus?.canReview === false)
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
