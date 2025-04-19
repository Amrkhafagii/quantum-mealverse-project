
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (file: File) => void;
  currentImageUrl?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, currentImageUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="space-y-4">
      {currentImageUrl && (
        <img 
          src={currentImageUrl} 
          alt="Current meal" 
          className="w-full max-w-md h-48 object-cover rounded-lg"
        />
      )}
      <div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          {currentImageUrl ? 'Change Image' : 'Upload Image'}
        </Button>
      </div>
    </div>
  );
};
