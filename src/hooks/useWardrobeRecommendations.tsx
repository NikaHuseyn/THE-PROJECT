
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { outfitRecommendationService } from '@/services/outfitRecommendationService';

interface WardrobeStats {
  totalItems: number;
  categoryCoverage: Record<string, number>;
  colorDiversity: string[];
  recentAdditions: number;
  recommendationReadiness: number;
}

export const useWardrobeRecommendations = () => {
  const [wardrobeStats, setWardrobeStats] = useState<WardrobeStats>({
    totalItems: 0,
    categoryCoverage: {},
    colorDiversity: [],
    recentAdditions: 0,
    recommendationReadiness: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeWardrobe = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: wardrobeItems, error: fetchError } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;

      const items = wardrobeItems || [];
      
      // Analyze categories
      const categoryCoverage: Record<string, number> = {};
      items.forEach(item => {
        categoryCoverage[item.category] = (categoryCoverage[item.category] || 0) + 1;
      });

      // Analyze colors
      const colors = items
        .map(item => item.color)
        .filter(Boolean)
        .filter((color, index, arr) => arr.indexOf(color) === index);

      // Count recent additions (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentAdditions = items.filter(item => 
        new Date(item.created_at) > thirtyDaysAgo
      ).length;

      // Calculate recommendation readiness score
      const essentialCategories = ['Tops', 'Bottoms', 'Shoes', 'Outerwear'];
      const coveredCategories = essentialCategories.filter(cat => 
        Object.keys(categoryCoverage).some(key => 
          key.toLowerCase().includes(cat.toLowerCase())
        )
      );
      
      const recommendationReadiness = Math.round(
        (coveredCategories.length / essentialCategories.length) * 100
      );

      setWardrobeStats({
        totalItems: items.length,
        categoryCoverage,
        colorDiversity: colors,
        recentAdditions,
        recommendationReadiness
      });

    } catch (err) {
      console.error('Error analyzing wardrobe:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze wardrobe');
    } finally {
      setIsLoading(false);
    }
  };

  const generateWardrobeRecommendations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create a mock event for general wardrobe recommendations
      const mockEvent = {
        id: 'wardrobe_analysis',
        title: 'General Wardrobe Enhancement',
        start_time: new Date().toISOString(),
        dress_code: 'smart casual',
        event_type: 'general'
      };

      const recommendations = await outfitRecommendationService.generatePersonalizedRecommendations([mockEvent]);
      return recommendations[0];
    } catch (error) {
      console.error('Error generating wardrobe recommendations:', error);
      throw error;
    }
  };

  useEffect(() => {
    analyzeWardrobe();
  }, []);

  return {
    wardrobeStats,
    isLoading,
    error,
    analyzeWardrobe,
    generateWardrobeRecommendations
  };
};
