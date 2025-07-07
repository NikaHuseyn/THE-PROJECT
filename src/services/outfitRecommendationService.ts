import { supabase } from '@/integrations/supabase/client';

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color?: string;
  brand?: string;
  size?: string;
  tags?: string[];
  created_at?: string;
}

interface UserProfile {
  preferred_colors?: string[];
  disliked_colors?: string[];
  style_personality?: string[];
  preferred_brands?: string[];
  budget_min?: number;
  budget_max?: number;
  fit_preference?: string;
}

interface TrendData {
  fashion_trends: any[];
  seasonal_forecasts: any[];
  trend_predictions: any[];
}

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  location?: string;
  dress_code?: string;
  event_type?: string;
}

interface OutfitRecommendation {
  id: string;
  eventId: string;
  top: string;
  bottom: string;
  shoes: string;
  accessories: string[];
  colors: string[];
  notes: string;
  reasoning: string;
  confidence_score: number;
  wardrobe_items: WardrobeItem[];
  suggested_purchases: any[];
}

class OutfitRecommendationService {
  async generatePersonalizedRecommendations(
    events: CalendarEvent[]
  ): Promise<OutfitRecommendation[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Fetch all required data in parallel
      const [wardrobeItems, userProfile, trendData] = await Promise.all([
        this.fetchWardrobeItems(user.id),
        this.fetchUserProfile(user.id),
        this.fetchTrendData()
      ]);

      // Generate recommendations for each event
      const recommendations = await Promise.all(
        events.map(event => 
          this.generateEventRecommendation(event, wardrobeItems, userProfile, trendData)
        )
      );

      return recommendations;
    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      throw error;
    }
  }

  private async fetchWardrobeItems(userId: string): Promise<WardrobeItem[]> {
    const { data, error } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }

  private async fetchUserProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_style_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || {};
  }

  private async fetchTrendData(): Promise<TrendData> {
    const [fashionTrends, seasonalForecasts, trendPredictions] = await Promise.all([
      supabase.from('fashion_trends').select('*').order('trend_score', { ascending: false }).limit(10),
      supabase.from('seasonal_forecasts').select('*').order('confidence_score', { ascending: false }).limit(5),
      supabase.from('trend_predictions').select('*').order('probability', { ascending: false }).limit(10)
    ]);

    return {
      fashion_trends: fashionTrends.data || [],
      seasonal_forecasts: seasonalForecasts.data || [],
      trend_predictions: trendPredictions.data || []
    };
  }

  private async generateEventRecommendation(
    event: CalendarEvent,
    wardrobeItems: WardrobeItem[],
    userProfile: UserProfile,
    trendData: TrendData
  ): Promise<OutfitRecommendation> {
    // Analyze event requirements
    const dressCode = event.dress_code || 'smart casual';
    const eventType = event.event_type || 'general';
    const season = this.getCurrentSeason();

    // Filter wardrobe items by appropriateness and user preferences
    const appropriateItems = this.filterAppropriateItems(
      wardrobeItems, 
      dressCode, 
      eventType,
      userProfile
    );

    // Get relevant trends for the occasion
    const relevantTrends = this.getRelevantTrends(trendData, dressCode, season);

    // Generate outfit combination
    const outfitCombination = this.createOutfitCombination(
      appropriateItems,
      relevantTrends,
      userProfile,
      dressCode
    );

    // Generate AI reasoning
    const reasoning = this.generateReasoning(
      event,
      outfitCombination,
      relevantTrends,
      userProfile
    );

    return {
      id: `rec_${event.id}_${Date.now()}`,
      eventId: event.id,
      top: outfitCombination.top,
      bottom: outfitCombination.bottom,
      shoes: outfitCombination.shoes,
      accessories: outfitCombination.accessories,
      colors: outfitCombination.colors,
      notes: outfitCombination.notes,
      reasoning,
      confidence_score: outfitCombination.confidence_score,
      wardrobe_items: outfitCombination.wardrobe_items,
      suggested_purchases: outfitCombination.suggested_purchases
    };
  }

  private filterAppropriateItems(
    items: WardrobeItem[],
    dressCode: string,
    eventType: string,
    userProfile: UserProfile
  ): WardrobeItem[] {
    return items.filter(item => {
      // Filter by dress code appropriateness
      const isAppropriate = this.isItemAppropriate(item, dressCode, eventType);
      
      // Filter by user color preferences
      const colorMatches = !userProfile.disliked_colors?.some(disliked => 
        item.color?.toLowerCase().includes(disliked.toLowerCase())
      );

      // Filter by brand preferences if specified
      const brandMatches = !userProfile.preferred_brands?.length || 
        userProfile.preferred_brands.some(brand => 
          item.brand?.toLowerCase().includes(brand.toLowerCase())
        );

      return isAppropriate && colorMatches && brandMatches;
    });
  }

  private isItemAppropriate(item: WardrobeItem, dressCode: string, eventType: string): boolean {
    const category = item.category.toLowerCase();
    const name = item.name.toLowerCase();
    
    switch (dressCode.toLowerCase()) {
      case 'formal':
        return (category.includes('formal') || 
                name.includes('suit') || 
                name.includes('dress') ||
                name.includes('blazer'));
      case 'business casual':
        return !name.includes('shorts') && 
               !name.includes('flip') && 
               !category.includes('activewear');
      case 'smart casual':
        return !category.includes('activewear') && 
               !name.includes('gym');
      case 'activewear':
        return category.includes('activewear') || 
               name.includes('sport') || 
               name.includes('gym');
      default:
        return true;
    }
  }

  private getRelevantTrends(trendData: TrendData, dressCode: string, season: string) {
    const relevantFashionTrends = trendData.fashion_trends.filter(trend => 
      trend.occasions?.includes(dressCode) || trend.season === season
    );

    const relevantSeasonalTrends = trendData.seasonal_forecasts.filter(forecast => 
      forecast.season === season
    );

    return {
      fashion_trends: relevantFashionTrends.slice(0, 3),
      seasonal_forecasts: relevantSeasonalTrends.slice(0, 2),
      trending_colors: relevantFashionTrends.flatMap(trend => trend.colors || []).slice(0, 5)
    };
  }

  private createOutfitCombination(
    items: WardrobeItem[],
    trends: any,
    userProfile: UserProfile,
    dressCode: string
  ) {
    // Group items by category
    const tops = items.filter(item => item.category.toLowerCase().includes('top'));
    const bottoms = items.filter(item => item.category.toLowerCase().includes('bottom'));
    const shoes = items.filter(item => item.category.toLowerCase().includes('shoes'));
    const accessories = items.filter(item => item.category.toLowerCase().includes('accessories'));

    // Select best matching items
    const selectedTop = this.selectBestItem(tops, userProfile, trends);
    const selectedBottom = this.selectBestItem(bottoms, userProfile, trends);
    const selectedShoes = this.selectBestItem(shoes, userProfile, trends);
    const selectedAccessories = accessories.slice(0, 2);

    // Combine trending colors with user preferences
    const recommendedColors = this.combineColors(
      trends.trending_colors,
      userProfile.preferred_colors || []
    );

    return {
      top: selectedTop?.name || `Recommended ${dressCode} top`,
      bottom: selectedBottom?.name || `Recommended ${dressCode} bottom`,
      shoes: selectedShoes?.name || `Recommended ${dressCode} shoes`,
      accessories: selectedAccessories.map(acc => acc.name),
      colors: recommendedColors,
      notes: this.generateStyleNotes(dressCode, trends),
      confidence_score: this.calculateConfidenceScore(items, trends, userProfile),
      wardrobe_items: [selectedTop, selectedBottom, selectedShoes, ...selectedAccessories].filter(Boolean),
      suggested_purchases: this.suggestPurchases(items, dressCode, trends)
    };
  }

  private selectBestItem(items: WardrobeItem[], userProfile: UserProfile, trends: any): WardrobeItem | null {
    if (!items.length) return null;

    return items.reduce((best, current) => {
      const currentScore = this.calculateItemScore(current, userProfile, trends);
      const bestScore = this.calculateItemScore(best, userProfile, trends);
      return currentScore > bestScore ? current : best;
    });
  }

  private calculateItemScore(item: WardrobeItem, userProfile: UserProfile, trends: any): number {
    let score = 0;

    // User preference bonus
    if (userProfile.preferred_colors?.some(color => 
      item.color?.toLowerCase().includes(color.toLowerCase())
    )) {
      score += 30;
    }

    // Brand preference bonus
    if (userProfile.preferred_brands?.some(brand => 
      item.brand?.toLowerCase().includes(brand.toLowerCase())
    )) {
      score += 20;
    }

    // Trend alignment bonus
    if (trends.trending_colors?.some((color: string) => 
      item.color?.toLowerCase().includes(color.toLowerCase())
    )) {
      score += 25;
    }

    // Recent addition bonus (encouraging variety)
    if (item.created_at) {
      const daysSinceAdded = Math.floor(
        (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceAdded < 30) score += 10;
    }

    return score;
  }

  private combineColors(trendingColors: string[], userColors: string[]): string[] {
    const combined = [...new Set([...trendingColors, ...userColors])];
    return combined.slice(0, 4);
  }

  private generateStyleNotes(dressCode: string, trends: any): string {
    const notes = [`Perfect for ${dressCode.toLowerCase()} occasions.`];
    
    if (trends.fashion_trends.length > 0) {
      notes.push(`Incorporates current ${trends.fashion_trends[0].name} trend.`);
    }
    
    if (trends.seasonal_forecasts.length > 0) {
      notes.push(`Aligned with seasonal forecast for ${trends.seasonal_forecasts[0].season}.`);
    }

    return notes.join(' ');
  }

  private calculateConfidenceScore(items: WardrobeItem[], trends: any, userProfile: UserProfile): number {
    let confidence = 50; // Base confidence

    // Wardrobe completeness bonus
    const categories = ['tops', 'bottoms', 'shoes'];
    const availableCategories = categories.filter(cat => 
      items.some(item => item.category.toLowerCase().includes(cat))
    );
    confidence += (availableCategories.length / categories.length) * 30;

    // User profile completeness bonus
    if (userProfile.preferred_colors?.length) confidence += 10;
    if (userProfile.style_personality?.length) confidence += 10;

    return Math.min(confidence, 95);
  }

  private suggestPurchases(items: WardrobeItem[], dressCode: string, trends: any): any[] {
    const suggestions = [];
    
    // Check for missing essentials
    const hasTop = items.some(item => item.category.toLowerCase().includes('top'));
    const hasBottom = items.some(item => item.category.toLowerCase().includes('bottom'));
    const hasShoes = items.some(item => item.category.toLowerCase().includes('shoes'));

    if (!hasTop) {
      suggestions.push({
        category: 'Tops',
        suggestion: `${dressCode} appropriate top`,
        priority: 'high'
      });
    }

    if (!hasBottom) {
      suggestions.push({
        category: 'Bottoms',
        suggestion: `${dressCode} appropriate bottom`,
        priority: 'high'
      });
    }

    if (!hasShoes) {
      suggestions.push({
        category: 'Shoes',
        suggestion: `${dressCode} appropriate shoes`,
        priority: 'medium'
      });
    }

    return suggestions;
  }

  private generateReasoning(
    event: CalendarEvent,
    outfit: any,
    trends: any,
    userProfile: UserProfile
  ): string {
    const reasons = [
      `For your ${event.title}, I've selected an outfit that balances your personal style with current trends.`
    ];

    if (userProfile.preferred_colors?.length) {
      reasons.push(`The color palette aligns with your preferred colors: ${userProfile.preferred_colors.slice(0, 2).join(', ')}.`);
    }

    if (trends.fashion_trends.length > 0) {
      reasons.push(`This look incorporates the trending ${trends.fashion_trends[0].name} style for a modern touch.`);
    }

    if (event.dress_code) {
      reasons.push(`The outfit is perfectly suited for the ${event.dress_code} dress code.`);
    }

    if (outfit.wardrobe_items.length > 0) {
      reasons.push(`I've prioritized items from your existing wardrobe to maximize your investment.`);
    }

    return reasons.join(' ');
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  }
}

export const outfitRecommendationService = new OutfitRecommendationService();
