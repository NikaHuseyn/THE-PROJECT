import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CategorizationRequest {
  itemName?: string;
  description?: string;
  imageBase64?: string;
  dominantColor?: string;
  extractedColors?: string[];
}

interface CategorizationResult {
  category: string;
  subcategory?: string;
  suggestedBrand?: string;
  colors: string[];
  tags: string[];
  confidence: number;
  reasoning: string;
}

export const useAIItemCategorization = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastResult, setLastResult] = useState<CategorizationResult | null>(null);

  const categorizeItem = async (request: CategorizationRequest): Promise<CategorizationResult | null> => {
    setIsAnalyzing(true);
    
    try {
      console.log('Sending categorization request:', request);
      
      const { data, error } = await supabase.functions.invoke('categorize-wardrobe-item', {
        body: request
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to categorize item');
      }

      if (!data) {
        throw new Error('No data received from categorization service');
      }

      console.log('Categorization result:', data);
      
      const result = data as CategorizationResult;
      setLastResult(result);
      
      return result;
    } catch (error) {
      console.error('Error categorizing item:', error);
      toast.error(`Categorization failed: ${error.message}`);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const categorizeFromText = async (itemName: string, description?: string) => {
    if (!itemName.trim()) {
      toast.error('Item name is required for categorization');
      return null;
    }

    return await categorizeItem({
      itemName: itemName.trim(),
      description: description?.trim()
    });
  };

  const categorizeFromImage = async (imageBase64: string, itemName?: string, description?: string) => {
    return await categorizeItem({
      itemName: itemName?.trim(),
      description: description?.trim(),
      imageBase64
    });
  };

  const categorizeFromImageData = async (
    imageBase64: string, 
    dominantColor?: string, 
    extractedColors?: string[],
    itemName?: string,
    description?: string
  ) => {
    return await categorizeItem({
      itemName: itemName?.trim(),
      description: description?.trim(),
      imageBase64,
      dominantColor,
      extractedColors
    });
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    if (confidence >= 0.4) return 'Low';
    return 'Very Low';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    if (confidence >= 0.4) return 'text-orange-600';
    return 'text-red-600';
  };

  return {
    categorizeItem,
    categorizeFromText,
    categorizeFromImage,
    categorizeFromImageData,
    isAnalyzing,
    lastResult,
    getConfidenceLevel,
    getConfidenceColor
  };
};