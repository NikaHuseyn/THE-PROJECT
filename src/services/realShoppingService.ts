
import { supabase } from '@/integrations/supabase/client';

interface ShoppingItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  rental_price?: number;
  image_url: string;
  retailer_name: string;
  retailer_url: string;
  affiliate_url?: string;
  sizes: string[];
  colors: string[];
  description?: string;
  in_stock: boolean;
}

interface ShoppingRecommendation {
  outfit_type: string;
  items: ShoppingItem[];
  total_price: number;
  total_rental_price: number;
  styling_notes: string;
}

class RealShoppingService {
  
  async searchItems(query: string, category?: string, maxPrice?: number): Promise<ShoppingItem[]> {
    try {
      let queryBuilder = supabase
        .from('shopping_items')
        .select('*')
        .eq('in_stock', true)
        .order('created_at', { ascending: false });

      if (category) {
        queryBuilder = queryBuilder.ilike('category', `%${category}%`);
      }

      if (maxPrice) {
        queryBuilder = queryBuilder.lte('price', maxPrice);
      }

      if (query) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,brand.ilike.%${query}%,description.ilike.%${query}%`);
      }

      const { data, error } = await queryBuilder.limit(50);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching shopping items:', error);
      return [];
    }
  }

  async getItemsByCategory(category: string, limit: number = 20): Promise<ShoppingItem[]> {
    try {
      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .ilike('category', `%${category}%`)
        .eq('in_stock', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching items by category:', error);
      return [];
    }
  }

  async getRecommendedItems(userStyleProfile: any, occasion: string, weatherData?: any): Promise<ShoppingRecommendation[]> {
    try {
      // Determine what categories we need based on occasion
      const neededCategories = this.getCategoriesForOccasion(occasion);
      
      // Get user's budget range
      const maxPrice = userStyleProfile?.budget_max || 500;
      const preferredColors = userStyleProfile?.preferred_colors || [];
      const preferredBrands = userStyleProfile?.preferred_brands || [];

      const recommendations: ShoppingRecommendation[] = [];

      // Create outfit combinations
      for (const outfitType of ['Professional', 'Casual Chic', 'Weekend Relaxed']) {
        const outfitItems: ShoppingItem[] = [];
        let totalPrice = 0;
        let totalRentalPrice = 0;

        for (const category of neededCategories) {
          let queryBuilder = supabase
            .from('shopping_items')
            .select('*')
            .ilike('category', `%${category}%`)
            .eq('in_stock', true)
            .lte('price', maxPrice);

          // Apply color preferences if available
          if (preferredColors.length > 0) {
            const colorFilter = preferredColors.map(color => `colors.cs.{${color}}`).join(',');
            queryBuilder = queryBuilder.or(colorFilter);
          }

          // Apply brand preferences if available
          if (preferredBrands.length > 0) {
            const brandFilter = preferredBrands.map(brand => `brand.ilike.%${brand}%`).join(',');
            queryBuilder = queryBuilder.or(brandFilter);
          }

          const { data: items } = await queryBuilder
            .order('created_at', { ascending: false })
            .limit(3);

          if (items && items.length > 0) {
            const selectedItem = items[Math.floor(Math.random() * items.length)];
            outfitItems.push(selectedItem);
            totalPrice += selectedItem.price || 0;
            totalRentalPrice += selectedItem.rental_price || 0;
          }
        }

        if (outfitItems.length > 0) {
          recommendations.push({
            outfit_type: outfitType,
            items: outfitItems,
            total_price: totalPrice,
            total_rental_price: totalRentalPrice,
            styling_notes: this.generateStylingNotes(outfitType, occasion, weatherData)
          });
        }
      }

      return recommendations;
    } catch (error) {
      console.error('Error getting recommended items:', error);
      return [];
    }
  }

  private getCategoriesForOccasion(occasion: string): string[] {
    const lowerOccasion = occasion.toLowerCase();
    
    if (lowerOccasion.includes('work') || lowerOccasion.includes('business') || lowerOccasion.includes('professional')) {
      return ['blazers', 'trousers', 'blouses', 'shoes', 'accessories'];
    } else if (lowerOccasion.includes('formal') || lowerOccasion.includes('wedding') || lowerOccasion.includes('cocktail')) {
      return ['dresses', 'heels', 'accessories', 'outerwear'];
    } else if (lowerOccasion.includes('casual') || lowerOccasion.includes('weekend') || lowerOccasion.includes('brunch')) {
      return ['tops', 'jeans', 'sneakers', 'jackets'];
    } else if (lowerOccasion.includes('date') || lowerOccasion.includes('dinner')) {
      return ['dresses', 'tops', 'trousers', 'shoes', 'accessories'];
    }
    
    // Default categories
    return ['tops', 'bottoms', 'shoes', 'accessories'];
  }

  private generateStylingNotes(outfitType: string, occasion: string, weatherData?: any): string {
    let notes = `This ${outfitType.toLowerCase()} look is perfect for ${occasion.toLowerCase()}.`;
    
    if (weatherData) {
      if (weatherData.temperature < 60) {
        notes += " Layer with a warm coat or jacket for the cooler weather.";
      } else if (weatherData.temperature > 80) {
        notes += " Choose breathable fabrics and lighter colors for the warm weather.";
      }
    }
    
    switch (outfitType) {
      case 'Professional':
        notes += " Pair with minimal jewelry and a structured bag for a polished finish.";
        break;
      case 'Casual Chic':
        notes += " Add a statement accessory to elevate the look while maintaining comfort.";
        break;
      case 'Weekend Relaxed':
        notes += " Perfect for comfort without sacrificing style - ideal for running errands or casual meetups.";
        break;
    }
    
    return notes;
  }

  async addShoppingItem(item: Omit<ShoppingItem, 'id'>): Promise<ShoppingItem | null> {
    try {
      const { data, error } = await supabase
        .from('shopping_items')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding shopping item:', error);
      return null;
    }
  }

  async syncWithRetailers(): Promise<void> {
    // This would integrate with actual retailer APIs
    // For now, we'll populate with sample data if the table is empty
    try {
      const { data: existingItems } = await supabase
        .from('shopping_items')
        .select('id')
        .limit(1);

      if (!existingItems || existingItems.length === 0) {
        await this.populateSampleItems();
      }
    } catch (error) {
      console.error('Error syncing with retailers:', error);
    }
  }

  private async populateSampleItems(): Promise<void> {
    const sampleItems = [
      {
        name: 'Professional Blazer',
        brand: 'Reiss',
        category: 'blazers',
        price: 195,
        rental_price: 45,
        image_url: '/api/placeholder/400/500',
        retailer_name: 'Reiss',
        retailer_url: 'https://www.reiss.com',
        sizes: ['6', '8', '10', '12', '14', '16'],
        colors: ['Navy', 'Black', 'Charcoal'],
        description: 'Sharp, tailored blazer perfect for business meetings',
        in_stock: true
      },
      {
        name: 'Silk Midi Dress',
        brand: 'COS',
        category: 'dresses',
        price: 135,
        rental_price: 35,
        image_url: '/api/placeholder/400/500',
        retailer_name: 'COS',
        retailer_url: 'https://www.cosstores.com',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Navy', 'Black', 'Sage'],
        description: 'Elegant midi dress in premium silk',
        in_stock: true
      },
      {
        name: 'High-Waisted Trousers',
        brand: 'Next',
        category: 'trousers',
        price: 75,
        rental_price: 20,
        image_url: '/api/placeholder/400/500',
        retailer_name: 'Next',
        retailer_url: 'https://www.next.co.uk',
        sizes: ['6', '8', '10', '12', '14', '16', '18'],
        colors: ['Black', 'Navy', 'Grey', 'Camel'],
        description: 'Tailored high-waisted trousers in premium fabric',
        in_stock: true
      },
      {
        name: 'Leather Ankle Boots',
        brand: 'John Lewis',
        category: 'shoes',
        price: 145,
        rental_price: 30,
        image_url: '/api/placeholder/400/500',
        retailer_name: 'John Lewis',
        retailer_url: 'https://www.johnlewis.com',
        sizes: ['3', '4', '5', '6', '7', '8'],
        colors: ['Black', 'Tan', 'Navy'],
        description: 'Premium leather ankle boots with comfortable heel',
        in_stock: true
      },
      {
        name: 'Cashmere Jumper',
        brand: 'M&S',
        category: 'knitwear',
        price: 89,
        rental_price: 25,
        image_url: '/api/placeholder/400/500',
        retailer_name: 'Marks & Spencer',
        retailer_url: 'https://www.marksandspencer.com',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Cream', 'Navy', 'Grey', 'Camel'],
        description: 'Luxurious cashmere blend jumper',
        in_stock: true
      }
    ];

    for (const item of sampleItems) {
      await this.addShoppingItem(item);
    }
  }
}

export const realShoppingService = new RealShoppingService();
export type { ShoppingItem, ShoppingRecommendation };
