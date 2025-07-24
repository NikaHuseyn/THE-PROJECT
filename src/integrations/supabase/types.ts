export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_recommendations: {
        Row: {
          confidence_score: number | null
          created_at: string
          expires_at: string | null
          feedback_timestamp: string | null
          id: string
          improvement_suggestions: string | null
          is_accepted: boolean | null
          occasion: string | null
          reasoning: string | null
          recommendation_type: string | null
          recommended_items: Json | null
          user_feedback: string | null
          user_id: string
          user_rating: number | null
          was_worn: boolean | null
          wear_context: string | null
          weather_context: Json | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          expires_at?: string | null
          feedback_timestamp?: string | null
          id?: string
          improvement_suggestions?: string | null
          is_accepted?: boolean | null
          occasion?: string | null
          reasoning?: string | null
          recommendation_type?: string | null
          recommended_items?: Json | null
          user_feedback?: string | null
          user_id: string
          user_rating?: number | null
          was_worn?: boolean | null
          wear_context?: string | null
          weather_context?: Json | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          expires_at?: string | null
          feedback_timestamp?: string | null
          id?: string
          improvement_suggestions?: string | null
          is_accepted?: boolean | null
          occasion?: string | null
          reasoning?: string | null
          recommendation_type?: string | null
          recommended_items?: Json | null
          user_feedback?: string | null
          user_id?: string
          user_rating?: number | null
          was_worn?: boolean | null
          wear_context?: string | null
          weather_context?: Json | null
        }
        Relationships: []
      }
      ai_usage_limits: {
        Row: {
          created_at: string
          email: string
          id: string
          last_request_at: string
          requests_count: number
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
          window_start: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          last_request_at?: string
          requests_count?: number
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
          window_start?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_request_at?: string
          requests_count?: number
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
          window_start?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reports: {
        Row: {
          created_at: string | null
          id: string
          moderator_notes: string | null
          post_id: string
          report_reason: string | null
          report_type: string
          reporter_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          moderator_notes?: string | null
          post_id: string
          report_reason?: string | null
          report_type: string
          reporter_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          moderator_notes?: string | null
          post_id?: string
          report_reason?: string | null
          report_type?: string
          reporter_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      fashion_trends: {
        Row: {
          category: string
          colors: string[] | null
          created_at: string
          description: string | null
          external_id: string | null
          growth_rate: string | null
          id: string
          image_url: string | null
          name: string
          occasions: string[] | null
          popularity_rank: number | null
          season: string | null
          source: string | null
          trend_score: number
          updated_at: string
        }
        Insert: {
          category: string
          colors?: string[] | null
          created_at?: string
          description?: string | null
          external_id?: string | null
          growth_rate?: string | null
          id?: string
          image_url?: string | null
          name: string
          occasions?: string[] | null
          popularity_rank?: number | null
          season?: string | null
          source?: string | null
          trend_score?: number
          updated_at?: string
        }
        Update: {
          category?: string
          colors?: string[] | null
          created_at?: string
          description?: string | null
          external_id?: string | null
          growth_rate?: string | null
          id?: string
          image_url?: string | null
          name?: string
          occasions?: string[] | null
          popularity_rank?: number | null
          season?: string | null
          source?: string | null
          trend_score?: number
          updated_at?: string
        }
        Relationships: []
      }
      followers: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          related_post_id: string | null
          related_user_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          related_post_id?: string | null
          related_user_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          related_post_id?: string | null
          related_user_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_post_id_fkey"
            columns: ["related_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      outfit_combinations: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          occasion: string | null
          shopping_items: string[] | null
          updated_at: string
          user_id: string
          wardrobe_items: string[] | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          occasion?: string | null
          shopping_items?: string[] | null
          updated_at?: string
          user_id: string
          wardrobe_items?: string[] | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          occasion?: string | null
          shopping_items?: string[] | null
          updated_at?: string
          user_id?: string
          wardrobe_items?: string[] | null
        }
        Relationships: []
      }
      outfit_history: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          occasion: string | null
          outfit_id: string | null
          photo_url: string | null
          user_id: string
          user_notes: string | null
          weather_data: Json | null
          worn_date: string
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          occasion?: string | null
          outfit_id?: string | null
          photo_url?: string | null
          user_id: string
          user_notes?: string | null
          weather_data?: Json | null
          worn_date: string
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          occasion?: string | null
          outfit_id?: string | null
          photo_url?: string | null
          user_id?: string
          user_notes?: string | null
          weather_data?: Json | null
          worn_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "outfit_history_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "synced_calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outfit_history_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfit_combinations"
            referencedColumns: ["id"]
          },
        ]
      }
      outfit_ratings: {
        Row: {
          created_at: string
          feedback_text: string | null
          id: string
          outfit_id: string | null
          rating: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          outfit_id?: string | null
          rating?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          outfit_id?: string | null
          rating?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outfit_ratings_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfit_combinations"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          email: string
          id: string
          metadata: Json | null
          payment_type: string
          product_type: string
          status: string
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          email: string
          id?: string
          metadata?: Json | null
          payment_type: string
          product_type: string
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          email?: string
          id?: string
          metadata?: Json | null
          payment_type?: string
          product_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          caption: string | null
          comments_count: number | null
          created_at: string
          flag_reason: string | null
          id: string
          image_urls: string[]
          is_featured: boolean | null
          is_flagged: boolean | null
          likes_count: number | null
          moderated_at: string | null
          product_links: Json | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          comments_count?: number | null
          created_at?: string
          flag_reason?: string | null
          id?: string
          image_urls: string[]
          is_featured?: boolean | null
          is_flagged?: boolean | null
          likes_count?: number | null
          moderated_at?: string | null
          product_links?: Json | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          caption?: string | null
          comments_count?: number | null
          created_at?: string
          flag_reason?: string | null
          id?: string
          image_urls?: string[]
          is_featured?: boolean | null
          is_flagged?: boolean | null
          likes_count?: number | null
          moderated_at?: string | null
          product_links?: Json | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string | null
          id: string
          last_request_at: string | null
          operation_type: string
          requests_count: number | null
          updated_at: string | null
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_request_at?: string | null
          operation_type: string
          requests_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_request_at?: string | null
          operation_type?: string
          requests_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      recommendation_feedback: {
        Row: {
          alternative_preferences: string | null
          comfort_rating: number | null
          created_at: string
          disliked_aspects: string[] | null
          feedback_type: string
          id: string
          improvement_suggestions: string | null
          liked_aspects: string[] | null
          occasion_appropriateness: number | null
          rating: number
          recommendation_id: string
          style_satisfaction: number | null
          updated_at: string
          user_id: string
          would_wear_again: boolean | null
        }
        Insert: {
          alternative_preferences?: string | null
          comfort_rating?: number | null
          created_at?: string
          disliked_aspects?: string[] | null
          feedback_type: string
          id?: string
          improvement_suggestions?: string | null
          liked_aspects?: string[] | null
          occasion_appropriateness?: number | null
          rating: number
          recommendation_id: string
          style_satisfaction?: number | null
          updated_at?: string
          user_id: string
          would_wear_again?: boolean | null
        }
        Update: {
          alternative_preferences?: string | null
          comfort_rating?: number | null
          created_at?: string
          disliked_aspects?: string[] | null
          feedback_type?: string
          id?: string
          improvement_suggestions?: string | null
          liked_aspects?: string[] | null
          occasion_appropriateness?: number | null
          rating?: number
          recommendation_id?: string
          style_satisfaction?: number | null
          updated_at?: string
          user_id?: string
          would_wear_again?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_feedback_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "ai_recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      seasonal_forecasts: {
        Row: {
          color_palette: Json | null
          confidence_score: number
          created_at: string
          description: string | null
          id: string
          influencing_factors: string[] | null
          key_trends: string[] | null
          must_have_items: string[] | null
          season: string
          updated_at: string
          year: number
        }
        Insert: {
          color_palette?: Json | null
          confidence_score?: number
          created_at?: string
          description?: string | null
          id?: string
          influencing_factors?: string[] | null
          key_trends?: string[] | null
          must_have_items?: string[] | null
          season: string
          updated_at?: string
          year: number
        }
        Update: {
          color_palette?: Json | null
          confidence_score?: number
          created_at?: string
          description?: string | null
          id?: string
          influencing_factors?: string[] | null
          key_trends?: string[] | null
          must_have_items?: string[] | null
          season?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      shopping_items: {
        Row: {
          affiliate_url: string | null
          brand: string | null
          category: string
          colors: string[] | null
          created_at: string
          description: string | null
          external_id: string | null
          id: string
          image_url: string | null
          in_stock: boolean | null
          name: string
          price: number | null
          rental_price: number | null
          retailer_name: string | null
          retailer_url: string | null
          sizes: string[] | null
          updated_at: string
        }
        Insert: {
          affiliate_url?: string | null
          brand?: string | null
          category: string
          colors?: string[] | null
          created_at?: string
          description?: string | null
          external_id?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          name: string
          price?: number | null
          rental_price?: number | null
          retailer_name?: string | null
          retailer_url?: string | null
          sizes?: string[] | null
          updated_at?: string
        }
        Update: {
          affiliate_url?: string | null
          brand?: string | null
          category?: string
          colors?: string[] | null
          created_at?: string
          description?: string | null
          external_id?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          name?: string
          price?: number | null
          rental_price?: number | null
          retailer_name?: string | null
          retailer_url?: string | null
          sizes?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      social_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          followers_count: number | null
          following_count: number | null
          id: string
          posts_count: number | null
          style_tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          posts_count?: number | null
          style_tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          posts_count?: number | null
          style_tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      synced_calendar_events: {
        Row: {
          created_at: string
          description: string | null
          dress_code: string | null
          end_time: string
          event_type: string | null
          external_event_id: string
          id: string
          location: string | null
          provider: string
          start_time: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          dress_code?: string | null
          end_time: string
          event_type?: string | null
          external_event_id: string
          id?: string
          location?: string | null
          provider?: string
          start_time: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          dress_code?: string | null
          end_time?: string
          event_type?: string | null
          external_event_id?: string
          id?: string
          location?: string | null
          provider?: string
          start_time?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trend_analytics: {
        Row: {
          action_type: string
          created_at: string
          id: string
          metadata: Json | null
          trend_id: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          trend_id?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          trend_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trend_analytics_trend_id_fkey"
            columns: ["trend_id"]
            isOneToOne: false
            referencedRelation: "fashion_trends"
            referencedColumns: ["id"]
          },
        ]
      }
      trend_predictions: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          key_drivers: string[] | null
          probability: number
          risk_level: string | null
          timeframe: string | null
          trend_name: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          key_drivers?: string[] | null
          probability?: number
          risk_level?: string | null
          timeframe?: string | null
          trend_name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key_drivers?: string[] | null
          probability?: number
          risk_level?: string | null
          timeframe?: string | null
          trend_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_admin_roles: {
        Row: {
          created_at: string | null
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          role: Database["public"]["Enums"]["admin_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_description: string | null
          badge_name: string
          badge_type: string
          earned_at: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          badge_description?: string | null
          badge_name: string
          badge_type: string
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          badge_description?: string | null
          badge_name?: string
          badge_type?: string
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_behavior_analytics: {
        Row: {
          event_data: Json | null
          event_type: string
          id: string
          outfit_id: string | null
          shopping_item_id: string | null
          timestamp: string
          user_id: string
        }
        Insert: {
          event_data?: Json | null
          event_type: string
          id?: string
          outfit_id?: string | null
          shopping_item_id?: string | null
          timestamp?: string
          user_id: string
        }
        Update: {
          event_data?: Json | null
          event_type?: string
          id?: string
          outfit_id?: string | null
          shopping_item_id?: string | null
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_behavior_analytics_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfit_combinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_behavior_analytics_shopping_item_id_fkey"
            columns: ["shopping_item_id"]
            isOneToOne: false
            referencedRelation: "shopping_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_calendar_connections: {
        Row: {
          access_token: string | null
          created_at: string
          encrypted_access_token: string | null
          encrypted_refresh_token: string | null
          encryption_key_id: string | null
          id: string
          is_active: boolean | null
          provider: string
          provider_account_id: string
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          encrypted_access_token?: string | null
          encrypted_refresh_token?: string | null
          encryption_key_id?: string | null
          id?: string
          is_active?: boolean | null
          provider?: string
          provider_account_id: string
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          encrypted_access_token?: string | null
          encrypted_refresh_token?: string | null
          encryption_key_id?: string | null
          id?: string
          is_active?: boolean | null
          provider?: string
          provider_account_id?: string
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          shopping_item_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          shopping_item_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          shopping_item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_shopping_item_id_fkey"
            columns: ["shopping_item_id"]
            isOneToOne: false
            referencedRelation: "shopping_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_oauth_connections: {
        Row: {
          access_token: string | null
          created_at: string
          encrypted_access_token: string | null
          encrypted_refresh_token: string | null
          encryption_key_id: string | null
          id: string
          is_active: boolean | null
          provider: string
          provider_user_id: string
          refresh_token: string | null
          scope: string[] | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          encrypted_access_token?: string | null
          encrypted_refresh_token?: string | null
          encryption_key_id?: string | null
          id?: string
          is_active?: boolean | null
          provider: string
          provider_user_id: string
          refresh_token?: string | null
          scope?: string[] | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          encrypted_access_token?: string | null
          encrypted_refresh_token?: string | null
          encryption_key_id?: string | null
          id?: string
          is_active?: boolean | null
          provider?: string
          provider_user_id?: string
          refresh_token?: string | null
          scope?: string[] | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preference_insights: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          insight_data: Json
          insight_type: string
          last_confirmed: string | null
          source_recommendations: string[] | null
          times_confirmed: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          insight_data: Json
          insight_type: string
          last_confirmed?: string | null
          source_recommendations?: string[] | null
          times_confirmed?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          insight_data?: Json
          insight_type?: string
          last_confirmed?: string | null
          source_recommendations?: string[] | null
          times_confirmed?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_purchases: {
        Row: {
          affiliate_commission: number | null
          created_at: string
          id: string
          order_reference: string | null
          purchase_date: string
          purchase_price: number | null
          retailer: string | null
          shopping_item_id: string | null
          user_id: string
        }
        Insert: {
          affiliate_commission?: number | null
          created_at?: string
          id?: string
          order_reference?: string | null
          purchase_date: string
          purchase_price?: number | null
          retailer?: string | null
          shopping_item_id?: string | null
          user_id: string
        }
        Update: {
          affiliate_commission?: number | null
          created_at?: string
          id?: string
          order_reference?: string | null
          purchase_date?: string
          purchase_price?: number | null
          retailer?: string | null
          shopping_item_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_purchases_shopping_item_id_fkey"
            columns: ["shopping_item_id"]
            isOneToOne: false
            referencedRelation: "shopping_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sizes: {
        Row: {
          brand: string | null
          category: string
          created_at: string
          id: string
          notes: string | null
          size_value: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          category: string
          created_at?: string
          id?: string
          notes?: string | null
          size_value: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string | null
          category?: string
          created_at?: string
          id?: string
          notes?: string | null
          size_value?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_style_profiles: {
        Row: {
          analysis_image_url: string | null
          body_type: string | null
          budget_max: number | null
          budget_min: number | null
          color_analysis: Json | null
          created_at: string
          data_export_requested: boolean | null
          disliked_colors: string[] | null
          disliked_styles: string[] | null
          display_name: string | null
          face_shape: string | null
          fit_preference: string | null
          gdpr_consent_date: string | null
          height_cm: number | null
          id: string
          notification_preferences: Json | null
          preferred_brands: string[] | null
          preferred_colors: string[] | null
          preferred_fabrics: string[] | null
          preferred_patterns: string[] | null
          preferred_retailers: string[] | null
          profile_photo_url: string | null
          public_profile_enabled: boolean | null
          skin_tone: string | null
          standard_size_bottom: string | null
          standard_size_shoes: string | null
          standard_size_top: string | null
          style_confidence_score: number | null
          style_personality: string[] | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          analysis_image_url?: string | null
          body_type?: string | null
          budget_max?: number | null
          budget_min?: number | null
          color_analysis?: Json | null
          created_at?: string
          data_export_requested?: boolean | null
          disliked_colors?: string[] | null
          disliked_styles?: string[] | null
          display_name?: string | null
          face_shape?: string | null
          fit_preference?: string | null
          gdpr_consent_date?: string | null
          height_cm?: number | null
          id?: string
          notification_preferences?: Json | null
          preferred_brands?: string[] | null
          preferred_colors?: string[] | null
          preferred_fabrics?: string[] | null
          preferred_patterns?: string[] | null
          preferred_retailers?: string[] | null
          profile_photo_url?: string | null
          public_profile_enabled?: boolean | null
          skin_tone?: string | null
          standard_size_bottom?: string | null
          standard_size_shoes?: string | null
          standard_size_top?: string | null
          style_confidence_score?: number | null
          style_personality?: string[] | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          analysis_image_url?: string | null
          body_type?: string | null
          budget_max?: number | null
          budget_min?: number | null
          color_analysis?: Json | null
          created_at?: string
          data_export_requested?: boolean | null
          disliked_colors?: string[] | null
          disliked_styles?: string[] | null
          display_name?: string | null
          face_shape?: string | null
          fit_preference?: string | null
          gdpr_consent_date?: string | null
          height_cm?: number | null
          id?: string
          notification_preferences?: Json | null
          preferred_brands?: string[] | null
          preferred_colors?: string[] | null
          preferred_fabrics?: string[] | null
          preferred_patterns?: string[] | null
          preferred_retailers?: string[] | null
          profile_photo_url?: string | null
          public_profile_enabled?: boolean | null
          skin_tone?: string | null
          standard_size_bottom?: string | null
          standard_size_shoes?: string | null
          standard_size_top?: string | null
          style_confidence_score?: number | null
          style_personality?: string[] | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      user_wishlist: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          priority: number | null
          shopping_item_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          priority?: number | null
          shopping_item_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          priority?: number | null
          shopping_item_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_wishlist_shopping_item_id_fkey"
            columns: ["shopping_item_id"]
            isOneToOne: false
            referencedRelation: "shopping_items"
            referencedColumns: ["id"]
          },
        ]
      }
      wardrobe_items: {
        Row: {
          brand: string | null
          category: string
          color: string | null
          created_at: string
          id: string
          image_url: string | null
          name: string
          notes: string | null
          purchase_date: string | null
          purchase_price: number | null
          size: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          category: string
          color?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          size?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string | null
          category?: string
          color?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          size?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      style_leaderboard: {
        Row: {
          avatar_url: string | null
          badge_count: number | null
          display_name: string | null
          posts_count: number | null
          style_score: number | null
          total_likes: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_ai_rate_limit: {
        Args: { user_email: string; target_user_id?: string }
        Returns: Json
      }
      check_rate_limit: {
        Args: {
          target_user_id: string
          operation: string
          max_requests?: number
          window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_expired_recommendations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_user_data: {
        Args: { target_user_id: string }
        Returns: Json
      }
      export_user_data: {
        Args: { target_user_id: string }
        Returns: Json
      }
      is_admin: {
        Args: {
          target_user_id?: string
          required_role?: Database["public"]["Enums"]["admin_role"]
        }
        Returns: boolean
      }
      sanitize_text: {
        Args: { input_text: string; max_length?: number }
        Returns: string
      }
      upgrade_user_subscription: {
        Args: { user_email: string; new_tier: string; target_user_id?: string }
        Returns: boolean
      }
      validate_email: {
        Args: { email_input: string }
        Returns: boolean
      }
    }
    Enums: {
      admin_role: "super_admin" | "admin" | "moderator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role: ["super_admin", "admin", "moderator"],
    },
  },
} as const
