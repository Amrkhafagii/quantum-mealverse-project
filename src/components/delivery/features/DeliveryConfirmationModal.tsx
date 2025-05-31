
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useDeliveryConfirmation } from '@/hooks/delivery/useDeliveryConfirmation';
import { useAuth } from '@/hooks/useAuth';
import { Camera, MapPin, Check, X, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeliveryConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
  type: 'pickup' | 'delivery';
  onConfirmed?: () => void;
}

interface PhotoPreview {
  file: File;
  url: string;
  uploaded: boolean;
  uploadedUrl?: string;
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
  const { toast } = useToast();
  const [photoPreview, setPhotoPreview] = useState<PhotoPreview[]>([]);
  const [notes, setNotes] = useState('');
  const [includeLocation, setIncludeLocation] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select only image files',
          variant: 'destructive'
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select images smaller than 10MB',
          variant: 'destructive'
        });
        return;
      }

      const url = URL.createObjectURL(file);
      setPhotoPreview(prev => [...prev, {
        file,
        url,
        uploaded: false
      }]);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePhotoUpload = async (preview: PhotoPreview, index: number) => {
    setUploading(true);
    try {
      const uploadedUrl = await uploadPhoto(preview.file, assignmentId, type);
      if (uploadedUrl) {
        setPhotoPreview(prev => prev.map((p, i) => 
          i === index ? { ...p, uploaded: true, uploadedUrl } : p
        ));
        toast({
          title: 'Photo uploaded',
          description: 'Photo uploaded successfully',
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Upload Failed',
        description: 'There was an error uploading your photo. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUploadAllPhotos = async () => {
    const unuploadedPhotos = photoPreview.filter(p => !p.uploaded);
    
    if (unuploadedPhotos.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < photoPreview.length; i++) {
        const preview = photoPreview[i];
        if (!preview.uploaded) {
          await handlePhotoUpload(preview, i);
        }
      }
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotoPreview(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].url);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const handleConfirm = async () => {
    const uploadedPhotos = photoPreview.filter(p => p.uploaded && p.uploadedUrl);
    
    if (uploadedPhotos.length === 0) {
      toast({
        title: 'No photos uploaded',
        description: 'Please upload at least one confirmation photo',
        variant: 'destructive'
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to confirm delivery',
        variant: 'destructive'
      });
      return;
    }

    try {
      const confirmation = await createConfirmation(
        assignmentId,
        type,
        uploadedPhotos.map(p => p.uploadedUrl!),
        user.id,
        notes || undefined,
        includeLocation
      );

      if (confirmation) {
        onConfirmed?.();
        onClose();
        // Clean up
        photoPreview.forEach(p => URL.revokeObjectURL(p.url));
        setPhotoPreview([]);
        setNotes('');
      }
    } catch (error) {
      console.error('Error creating confirmation:', error);
      toast({
        title: 'Confirmation failed',
        description: 'Failed to create delivery confirmation. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const title = type === 'pickup' ? 'Confirm Pickup' : 'Confirm Delivery';
  const description = type === 'pickup' 
    ? 'Take photos of the items you picked up'
    : 'Take photos showing the delivery was completed';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-quantum-cyan" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-400">{description}</p>

          {/* Photo selection */}
          <div className="space-y-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || uploading}
              className="w-full"
              variant="outline"
            >
              <Camera className="h-4 w-4 mr-2" />
              Select Photos
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>

          {/* Photo previews */}
          {photoPreview.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Photo Previews</h4>
                {photoPreview.some(p => !p.uploaded) && (
                  <Button
                    onClick={handleUploadAllPhotos}
                    disabled={uploading}
                    size="sm"
                  >
                    Upload All
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {photoPreview.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview.url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          const img = new Image();
                          img.src = preview.url;
                          const newWindow = window.open();
                          newWindow?.document.write(img.outerHTML);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 p-0"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Upload status */}
                    <div className="absolute top-1 right-1">
                      {preview.uploaded ? (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="h-2 w-2 text-white" />
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="h-6 w-6 p-0 text-xs"
                          onClick={() => handlePhotoUpload(preview, index)}
                          disabled={uploading}
                        >
                          ↑
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
              disabled={loading || uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={photoPreview.filter(p => p.uploaded).length === 0 || loading || uploading}
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
