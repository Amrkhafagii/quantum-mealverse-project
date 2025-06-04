
interface FileValidationResult {
  isValid: boolean;
  error?: string;
  file?: File;
  preview?: string;
}

interface FileValidationOptions {
  maxSizeInMB?: number;
  allowedTypes?: string[];
  requireImage?: boolean;
}

/**
 * Validates file uploads with detailed feedback
 */
export const validateFileUpload = async (
  file: File,
  options: FileValidationOptions = {}
): Promise<FileValidationResult> => {
  const {
    maxSizeInMB = 5,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    requireImage = true
  } = options;

  try {
    // Check if file exists
    if (!file) {
      return {
        isValid: false,
        error: 'No file selected'
      };
    }

    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return {
        isValid: false,
        error: `File size must be less than ${maxSizeInMB}MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
      };
    }

    // Validate image dimensions if it's an image
    if (requireImage && file.type.startsWith('image/')) {
      const dimensionValidation = await validateImageDimensions(file);
      if (!dimensionValidation.isValid) {
        return dimensionValidation;
      }
    }

    // Create preview for images
    let preview: string | undefined;
    if (file.type.startsWith('image/')) {
      preview = await createImagePreview(file);
    }

    return {
      isValid: true,
      file,
      preview
    };

  } catch (error) {
    console.error('Error validating file:', error);
    return {
      isValid: false,
      error: 'Failed to validate file'
    };
  }
};

/**
 * Validates image dimensions
 */
const validateImageDimensions = (file: File): Promise<FileValidationResult> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      
      // Check minimum dimensions
      if (img.width < 100 || img.height < 100) {
        resolve({
          isValid: false,
          error: 'Image must be at least 100x100 pixels'
        });
        return;
      }

      // Check maximum dimensions
      if (img.width > 4000 || img.height > 4000) {
        resolve({
          isValid: false,
          error: 'Image must be smaller than 4000x4000 pixels'
        });
        return;
      }

      resolve({
        isValid: true,
        file
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        isValid: false,
        error: 'Invalid image file'
      });
    };

    img.src = url;
  });
};

/**
 * Creates a preview URL for images
 */
const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to create image preview'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Formats file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generates a safe filename
 */
export const generateSafeFilename = (originalName: string, prefix?: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop() || '';
  const baseName = originalName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
  
  return `${prefix ? prefix + '_' : ''}${baseName}_${timestamp}_${randomString}.${extension}`;
};
