
import React from 'react';
import { Camera } from 'lucide-react';
import { FormLabel } from '@/components/ui/form';

interface ImageUploadSectionProps {
  uploadedImages: string[];
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: (index: number) => void;
  isMaxImagesReached: boolean;
}

export const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  uploadedImages,
  onImageUpload,
  onImageRemove,
  isMaxImagesReached
}) => {
  return (
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
              onClick={() => onImageRemove(index)}
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
            onChange={onImageUpload}
            disabled={isMaxImagesReached}
          />
        </label>
      </div>
      {isMaxImagesReached && (
        <p className="text-xs text-gray-500 mt-1">Maximum 5 images allowed</p>
      )}
    </div>
  );
};
