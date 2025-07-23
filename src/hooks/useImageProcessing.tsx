import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ImageProcessor, type ProcessedImageResult } from '@/utils/imageProcessing';

interface UploadOptions {
  bucket: string;
  folder?: string;
  filename?: string;
  makePublic?: boolean;
}

interface UseImageProcessingReturn {
  isProcessing: boolean;
  isUploading: boolean;
  processAndUpload: (
    file: File,
    uploadOptions: UploadOptions,
    processingOptions?: {
      compress?: boolean;
      removeBackground?: boolean;
      extractColors?: boolean;
    }
  ) => Promise<{
    url: string;
    processedResult: ProcessedImageResult;
    metadata: any;
  } | null>;
  processImage: (
    file: File,
    options?: {
      compress?: boolean;
      removeBackground?: boolean;
      extractColors?: boolean;
    }
  ) => Promise<ProcessedImageResult | null>;
  uploadBlob: (
    blob: Blob,
    uploadOptions: UploadOptions
  ) => Promise<string | null>;
}

export const useImageProcessing = (): UseImageProcessingReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const processImage = useCallback(async (
    file: File,
    options = { compress: true, removeBackground: false, extractColors: true }
  ): Promise<ProcessedImageResult | null> => {
    setIsProcessing(true);
    try {
      const result = await ImageProcessor.processImage(file, {
        compress: options.compress,
        removeBackground: options.removeBackground,
        extractColors: options.extractColors,
        maxSizeMB: 1,
        maxWidthOrHeight: 1920
      });
      
      return result;
    } catch (error) {
      console.error('Image processing failed:', error);
      toast.error('Failed to process image');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const uploadBlob = useCallback(async (
    blob: Blob,
    uploadOptions: UploadOptions
  ): Promise<string | null> => {
    setIsUploading(true);
    try {
      const { bucket, folder = '', filename = `image-${Date.now()}.jpg` } = uploadOptions;
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to upload images');
        return null;
      }

      // Create the full path
      const userId = user.id;
      const fullPath = folder ? `${userId}/${folder}/${filename}` : `${userId}/${filename}`;

      // Convert blob to file
      const file = new File([blob], filename, { type: blob.type });

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fullPath, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Failed to upload image');
        return null;
      }

      // Get public URL
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(fullPath);

      return data.publicUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const processAndUpload = useCallback(async (
    file: File,
    uploadOptions: UploadOptions,
    processingOptions = { compress: true, removeBackground: false, extractColors: true }
  ) => {
    try {
      // First process the image
      const processedResult = await processImage(file, processingOptions);
      if (!processedResult) return null;

      // Determine which blob to upload (prefer compressed if available)
      const blobToUpload = processedResult.compressedBlob || processedResult.originalBlob;
      
      // Upload the processed image
      const url = await uploadBlob(blobToUpload, uploadOptions);
      if (!url) return null;

      // Prepare metadata to save with the image record
      const metadata = {
        ...processedResult.metadata,
        colors: processedResult.colors,
        dominantColor: processedResult.dominantColor,
        hasBackgroundRemoved: !!processedResult.backgroundRemovedBlob,
        processingOptions
      };

      toast.success('Image processed and uploaded successfully!');
      
      return {
        url,
        processedResult,
        metadata
      };
    } catch (error) {
      console.error('Process and upload failed:', error);
      toast.error('Failed to process and upload image');
      return null;
    }
  }, [processImage, uploadBlob]);

  return {
    isProcessing,
    isUploading,
    processAndUpload,
    processImage,
    uploadBlob
  };
};

export default useImageProcessing;