import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ShoppingItem {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  description: string | null;
  image_url: string | null;
  retailer_name: string | null;
  retailer_url: string | null;
  affiliate_url: string | null;
  price: number | null;
  sizes: string[];
  colors: string[];
  in_stock: boolean;
}

export const useTrendProducts = (trendName: string, trendCategory: string, trendColors: string[]) => {
  const [products, setProducts] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!trendName && !trendCategory) return;
      
      setIsLoading(true);
      setError(null);

      try {
        // Search for products matching the trend
        let query = supabase
          .from('shopping_items')
          .select('*')
          .eq('in_stock', true);

        // Filter by category if available
        if (trendCategory && trendCategory !== 'All') {
          query = query.eq('category', trendCategory);
        }

        // Search in name or description for trend keywords
        const trendKeywords = trendName.toLowerCase().split(' ');
        
        const { data, error: fetchError } = await query.limit(12);

        if (fetchError) throw fetchError;

        // Filter results to match trend better (client-side)
        const filteredData = data?.filter(item => {
          const itemText = `${item.name} ${item.description || ''} ${item.brand || ''}`.toLowerCase();
          
          // Check if any trend keyword appears in item
          const hasKeyword = trendKeywords.some(keyword => 
            keyword.length > 3 && itemText.includes(keyword)
          );

          // Check if item colors match trend colors
          const hasMatchingColor = trendColors.length === 0 || 
            item.colors?.some(color => 
              trendColors.some(trendColor => 
                color.toLowerCase().includes(trendColor.toLowerCase()) ||
                trendColor.toLowerCase().includes(color.toLowerCase())
              )
            );

          return hasKeyword || hasMatchingColor || item.category === trendCategory;
        }) || [];

        setProducts(filteredData.slice(0, 8)); // Limit to 8 products
      } catch (err) {
        console.error('Error fetching trend products:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [trendName, trendCategory, trendColors]);

  return {
    products,
    isLoading,
    error
  };
};
