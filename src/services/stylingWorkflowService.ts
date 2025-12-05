import { supabase } from "@/integrations/supabase/client";

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface WorkflowRequest {
  userPrompt: string;
  userLocation?: { lat: number; lon: number };
}

export interface InterpretedEvent {
  event_type: string;
  dress_code: string;
  setting: string;
  location: string;
  date: string;
  time_of_day: string;
  tone: string;
  environment_notes: string;
  is_historical: boolean;
  historical_era?: string;
  duration_hours?: number;
  indoor_outdoor: 'indoor' | 'outdoor' | 'mixed';
  formality_level: number;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active';
}

export interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  colour: string;
  brand?: string;
  size?: string;
  image_url?: string;
  tags?: string[];
  seasonality: string[];
  formality_level: number;
  colour_family: string;
  silhouette?: string;
  practicality_score: number;
  weather_suitability: string[];
}

export interface ProductResult {
  id: string;
  name: string;
  brand: string;
  price: number;
  rental_price?: number;
  category: string;
  colours: string[];
  sizes: string[];
  image_url: string;
  retailer_name: string;
  retailer_url: string;
  affiliate_url?: string;
  in_stock: boolean;
  source_type: 'purchase' | 'rental' | 'vintage';
}

export interface StylingOutput {
  event_summary: {
    interpreted_event: InterpretedEvent;
    weather_summary: string;
    key_considerations: string[];
  };
  etiquette_guidance: {
    dress_code_explanation: string;
    do_list: string[];
    dont_list: string[];
    cultural_notes: string;
  };
  wardrobe_outfit: {
    items: WardrobeItem[];
    styling_notes: string;
    gaps_identified: string[];
  };
  shopping_options: {
    purchase_items: ProductResult[];
    rental_items: ProductResult[];
    vintage_items: ProductResult[];
    total_purchase_cost: number;
    total_rental_cost: number;
  };
  accessories: {
    recommended: string[];
    from_wardrobe: WardrobeItem[];
    to_purchase: ProductResult[];
  };
  weather_adjustments: {
    layering_strategy: string;
    protection_items: string[];
    backup_plan: string;
  };
  practical_considerations: {
    comfort_tips: string[];
    transport_notes: string;
    venue_considerations: string;
    time_of_day_adjustments: string;
  };
  checklist: string[];
  confidence_score: number;
  validation_notes: string[];
}

export interface WorkflowResponse {
  success: boolean;
  data?: StylingOutput;
  error?: string;
}

// ============================================
// WORKFLOW SERVICE
// ============================================

class StylingWorkflowService {
  
  /**
   * Execute the complete styling workflow
   */
  async generateStyling(request: WorkflowRequest): Promise<WorkflowResponse> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: "Please sign in to get personalised styling recommendations"
        };
      }
      
      // Get user profile for personalisation
      const { data: profile } = await supabase
        .from('user_style_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      // Call the workflow edge function
      const { data, error } = await supabase.functions.invoke('styling-workflow', {
        body: {
          userPrompt: request.userPrompt,
          userId: user.id,
          userLocation: request.userLocation,
          userProfile: profile ? {
            preferred_colors: profile.preferred_colors,
            preferred_patterns: profile.preferred_patterns,
            preferred_fabrics: profile.preferred_fabrics,
            style_personality: profile.style_personality,
            body_type: profile.body_type,
            budget_min: profile.budget_min,
            budget_max: profile.budget_max,
            disliked_colors: profile.disliked_colors,
            disliked_styles: profile.disliked_styles
          } : undefined
        }
      });
      
      if (error) {
        console.error("Workflow error:", error);
        return {
          success: false,
          error: error.message || "Failed to generate styling recommendations"
        };
      }
      
      return data as WorkflowResponse;
      
    } catch (error) {
      console.error("Workflow service error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred"
      };
    }
  }
  
  /**
   * Get user's location for weather data
   */
  async getUserLocation(): Promise<{ lat: number; lon: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        () => {
          // Default to London if geolocation fails
          resolve({ lat: 51.5074, lon: -0.1278 });
        },
        { timeout: 5000 }
      );
    });
  }
  
  /**
   * Quick interpretation of event type from prompt
   */
  isHistoricalEvent(prompt: string): boolean {
    const historicalTerms = [
      '1920s', '1930s', '1940s', '1950s', '1960s', '1970s', '1980s',
      'gatsby', 'art deco', 'victorian', 'edwardian', 'medieval', 
      'renaissance', 'vintage', 'retro', 'period', 'historical', 'themed'
    ];
    const lowerPrompt = prompt.toLowerCase();
    return historicalTerms.some(term => lowerPrompt.includes(term));
  }
}

export const stylingWorkflowService = new StylingWorkflowService();
