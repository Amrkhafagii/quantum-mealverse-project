import React from "react";
import { Review } from "@/types/review";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EnhancedReviewCardProps {
  review: Review;
  onFlag?: (id: string) => void;
}

export const EnhancedReviewCard: React.FC<EnhancedReviewCardProps> = ({
  review,
  onFlag,
}) => {
  const { user } = useAuth();

  const userInitials = review.user_id?.slice(0, 2)?.toUpperCase() || "??";

  const handleFlag = async () => {
    if (!user) {
      toast.error("You must be logged in to flag a review");
      return;
    }

    try {
      const { error } = await supabase
        .from("reviews")
        .update({ is_flagged: true })
        .eq("id", review.id);

      if (error) throw error;

      toast.success("Review flagged for moderation");
    } catch (error) {
      console.error("Error flagging review:", error);
      toast.error("Failed to flag review");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffDays = Math.floor(diff / (1000 * 3600 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-yellow-500 ${i < rating ? "fill-current" : "text-gray-300"
          }`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-start space-x-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={`https://avatar.vercel.sh/${review.user_id}.png`} />
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-semibold">{review.user_id}</h4>
                <Badge variant="secondary">{review.status}</Badge>
                {review.is_verified_purchase && (
                  <Badge variant="outline">Verified Purchase</Badge>
                )}
                {review.is_flagged && (
                  <Badge variant="destructive">Flagged</Badge>
                )}
              </div>
              <p className="text-xs text-gray-500">{formatDate(review.created_at!)}</p>
            </div>
            <div className="flex items-center space-x-2">
              {onFlag && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFlag}
                  disabled={review.is_flagged}
                >
                  <Flag className="w-4 h-4 mr-1" />
                  Flag
                </Button>
              )}
            </div>
          </div>
          <div className="mt-2">
            <div className="flex">{renderStars(review.rating)}</div>
            <p className="text-sm text-gray-700">{review.comment}</p>
          </div>
          {review.images && review.images.length > 0 && (
            <div className="mt-3 flex space-x-2">
              {review.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Review image ${index + 1}`}
                  className="w-20 h-20 object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
