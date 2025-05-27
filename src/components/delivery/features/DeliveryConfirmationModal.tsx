
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useDeliveryConfirmation } from '@/hooks/delivery/useDeliveryConfirmation';
import { useAuth } from '@/hooks/useAuth';
import { Camera, MapPin, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DeliveryConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
  type: 'pickup' | 'delivery';
  onConfirmed?: () => void;
}

export const DeliveryConfirmationModal: React.FC<DeliveryConfirmationModalProps> = ({
  isOpen,
  onClose,
  assignmentId,
  type,
  onConfirmed
}) => {
  const { user } = useAuth();
  const { loading, uploadPhoto, createConfirmation } = useDeliveryConfirmation();
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [includeLocation, setIncludeLocation] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    for (const file of files) {
      const photoUrl = await uploadPhoto(file, assignmentId, type);
      if (photoUrl) {
        setPhotos(prev => [...prev, photoUrl]);
      }
    }
  };

  const handleConfirm = async () => {
    if (photos.length === 0) {
      toast({
        title: 'Photo required',
        description: 'Please take at least one confirmation photo',
        variant: 'destructive'
      });
      return;
    }

    if (!user?.id) return;

    const confirmation = await createConfirmation(
      assignmentId,
      type,
      photos,
      user.id,
      notes || undefined,
      includeLocation
    );

    if (confirmation) {
      onConfirmed?.();
      onClose();
      setPhotos([]);
      setNotes('');
    }
  };

  const title = type === 'pickup' ? 'Confirm Pickup' : 'Confirm Delivery';
  const description = type === 'pickup' 
    ? 'Take photos of the items you picked up'
    : 'Take photos showing the delivery was completed';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-quantum-cyan" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-400">{description}</p>

          {/* Photo upload */}
          <div className="space-y-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full"
            >
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          {/* Photo previews */}
          {photos.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Confirmation ${index + 1}`}
                  className="w-full h-24 object-cover rounded border"
                />
              ))}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          {/* Location toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeLocation"
              checked={includeLocation}
              onChange={(e) => setIncludeLocation(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="includeLocation" className="text-sm flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Include current location
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={photos.length === 0 || loading}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-2" />
              Confirm {type === 'pickup' ? 'Pickup' : 'Delivery'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
