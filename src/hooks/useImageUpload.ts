
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export const useImageUpload = (maxImages: number = 5) => {
  const { user } = useAuth();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  const handleImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;
    
    try {
      const newImages = [...uploadedImages];
      
      for (let i = 0; i < files.length && newImages.length < maxImages; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Image file size must be less than 5MB');
          continue;
        }
        
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
      return newImages;
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
      return uploadedImages;
    }
  };
  
  const removeImage = (index: number) => {
    const newImages = [...uploadedImages];
    newImages.splice(index, 1);
    setUploadedImages(newImages);
    return newImages;
  };
  
  return {
    uploadedImages,
    setUploadedImages,
    handleImageUpload,
    removeImage,
    isMaxImagesReached: uploadedImages.length >= maxImages
  };
};
