import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CapsuleWardrobe {
  id: string;
  name: string;
  description?: string;
  season?: string;
  occasion?: string;
  color_scheme?: any;
  wardrobe_item_ids: string[];
  max_items: number;
  created_at: string;
  updated_at: string;
}

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color?: string;
  brand?: string;
  size?: string;
  image_url?: string;
  tags?: string[];
  notes?: string;
}

export const useCapsuleWardrobes = () => {
  const [capsules, setCapsules] = useState<CapsuleWardrobe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCapsules = async () => {
    try {
      const { data, error } = await supabase
        .from('capsule_wardrobes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCapsules(data || []);
    } catch (error) {
      console.error('Error fetching capsule wardrobes:', error);
      setError('Failed to load capsule wardrobes');
      toast.error('Failed to load capsule wardrobes');
    } finally {
      setLoading(false);
    }
  };

  const createCapsule = async (capsuleData: {
    name: string;
    description?: string;
    season?: string;
    occasion?: string;
    color_scheme?: any;
    wardrobe_item_ids: string[];
    max_items?: number;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('capsule_wardrobes')
        .insert({
          ...capsuleData,
          user_id: user.id,
          max_items: capsuleData.max_items || 30
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Capsule wardrobe created successfully!');
      await fetchCapsules();
      return data;
    } catch (error) {
      console.error('Error creating capsule:', error);
      toast.error('Failed to create capsule wardrobe');
      throw error;
    }
  };

  const updateCapsule = async (id: string, updates: Partial<CapsuleWardrobe>) => {
    try {
      const { error } = await supabase
        .from('capsule_wardrobes')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Capsule wardrobe updated successfully!');
      await fetchCapsules();
    } catch (error) {
      console.error('Error updating capsule:', error);
      toast.error('Failed to update capsule wardrobe');
      throw error;
    }
  };

  const deleteCapsule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('capsule_wardrobes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Capsule wardrobe deleted successfully!');
      await fetchCapsules();
    } catch (error) {
      console.error('Error deleting capsule:', error);
      toast.error('Failed to delete capsule wardrobe');
      throw error;
    }
  };

  const getCapsuleItems = async (capsule: CapsuleWardrobe): Promise<WardrobeItem[]> => {
    try {
      if (capsule.wardrobe_item_ids.length === 0) return [];

      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('*')
        .in('id', capsule.wardrobe_item_ids);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching capsule items:', error);
      return [];
    }
  };

  const generateOutfitCombinations = (items: WardrobeItem[]): number => {
    // Simple calculation: count by category and estimate combinations
    const categories = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tops = (categories['Tops'] || 0) + (categories['Dresses'] || 0);
    const bottoms = (categories['Bottoms'] || 0) + (categories['Dresses'] || 0);
    const outerwear = categories['Outerwear'] || 1;
    const shoes = categories['Shoes'] || 1;

    // Basic combination calculation
    return Math.max(1, tops * bottoms * Math.min(outerwear, 2) * Math.min(shoes, 3));
  };

  useEffect(() => {
    fetchCapsules();
  }, []);

  return {
    capsules,
    loading,
    error,
    fetchCapsules,
    createCapsule,
    updateCapsule,
    deleteCapsule,
    getCapsuleItems,
    generateOutfitCombinations
  };
};