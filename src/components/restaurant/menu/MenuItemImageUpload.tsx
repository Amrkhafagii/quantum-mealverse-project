
import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X, Image } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { useToast } from '@/hooks/use-toast';

interface MenuItemImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
}

export const MenuItemImageUpload: React.FC<MenuItemImageUploadProps> = ({
  currentImageUrl,
  onImageUploaded
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const { restaurant } = useRestaurantAuth();

  const handleFileSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !restaurant?.id) return;

    // File size validation (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File is too large",
        description: "Please select an image under 5MB",
        variant: "destructive"
      });
      return;
    }
    
    // File type validation
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Only image files are allowed",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      console.log("Starting image upload...");
      
      // Create a temporary preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${restaurant.id}/${uuidv4()}.${fileExt}`;
      
      console.log(`Uploading to menu-items bucket with path: ${fileName}`);

      // Force check and create bucket if it doesn't exist
      try {
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
          console.error('Error listing buckets:', bucketsError);
          throw new Error('Could not access storage buckets');
        }
        
        const menuItemsBucketExists = buckets.some(bucket => bucket.name === 'menu-items');
        
        if (!menuItemsBucketExists) {
          toast({
            title: "Creating storage bucket",
            description: "Setting up image storage for the first time"
          });
          
          const { error: createBucketError } = await supabase.storage
            .createBucket('menu-items', { public: true });
            
          if (createBucketError) {
            console.error('Error creating bucket:', createBucketError);
            throw new Error(`Error creating storage bucket: ${createBucketError.message}`);
          }
        }
      } catch (bucketError) {
        console.error('Bucket creation error:', bucketError);
        toast({
          title: "Storage Error",
          description: "Could not initialize image storage. Please try again.",
          variant: "destructive"
        });
        setIsUploading(false);
        return;
      }
      
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('menu-items')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (error) {
        console.error('Upload error details:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }
      
      console.log('Upload successful:', data);
      
      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('menu-items')
        .getPublicUrl(data.path);
      
      console.log('Public URL:', urlData.publicUrl);
        
      // Call the callback with the URL
      onImageUploaded(urlData.publicUrl);
      
      toast({
        title: "Image uploaded successfully",
        description: "Your image has been uploaded and saved",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Failed to upload image",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
      // Reset preview on error
      if (currentImageUrl) {
        setPreviewUrl(currentImageUrl);
      } else {
        setPreviewUrl(null);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewUrl(null);
    onImageUploaded('');
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="relative rounded-lg overflow-hidden border">
          <img 
            src={previewUrl} 
            alt="Menu item preview" 
            className="w-full max-h-52 object-cover"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
            type="button"
            style={{ position: 'absolute', zIndex: 50 }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div 
          className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={handleFileSelect}
          style={{ position: 'relative', zIndex: 10 }}
        >
          <Image className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm font-medium">
            Click to upload an image
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG or WEBP (max. 5MB)
          </p>
        </div>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
      
      {!previewUrl && (
        <Button
          type="button"
          variant="outline"
          onClick={handleFileSelect}
          className="w-full"
          disabled={isUploading}
          style={{ position: 'relative', zIndex: 10 }}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </>
          )}
        </Button>
      )}
    </div>
  );
};
