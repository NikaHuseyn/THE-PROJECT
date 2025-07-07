
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check for authentication but don't require it
    const authHeader = req.headers.get('Authorization');
    let user = null;
    let styleProfile = null;
    let wardrobeItems = null;

    if (authHeader) {
      try {
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(
          authHeader.replace('Bearer ', '')
        );
        if (!userError && authUser) {
          user = authUser;
        }
      } catch (authError) {
        console.log('Auth failed, proceeding as anonymous user:', authError);
      }
    }

    const { 
      recommendationType = 'daily_outfit', 
      weatherData, 
      occasion, 
      eventDetails 
    } = await req.json();

    // Fetch user's style profile and wardrobe items if authenticated
    if (user) {
      const { data: userStyleProfile } = await supabase
        .from('user_style_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      styleProfile = userStyleProfile;

      const { data: userWardrobeItems } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', user.id)
        .limit(20);
      wardrobeItems = userWardrobeItems;
    }

    // Fetch recent shopping items for inspiration
    const { data: shoppingItems } = await supabase
      .from('shopping_items')
      .select('name, brand, category, price, colors, description')
      .eq('in_stock', true)
      .order('created_at', { ascending: false })
      .limit(15);

// Enhanced AI prompt with more context
    const prompt = `You are an expert fashion stylist and costume consultant with deep knowledge of fashion trends, literary characters, theatrical costume design, and themed party styling. Create a highly personalized outfit recommendation.

USER STYLE PROFILE:
- Body Type: ${styleProfile?.body_type || 'Not specified'}
- Preferred Colors: ${styleProfile?.preferred_colors?.join(', ') || 'None specified'}
- Disliked Colors: ${styleProfile?.disliked_colors?.join(', ') || 'None specified'}
- Style Personality: ${styleProfile?.style_personality?.join(', ') || 'None specified'}
- Preferred Patterns: ${styleProfile?.preferred_patterns?.join(', ') || 'None specified'}
- Preferred Fabrics: ${styleProfile?.preferred_fabrics?.join(', ') || 'None specified'}
- Preferred Brands: ${styleProfile?.preferred_brands?.join(', ') || 'None specified'}
- Budget Range: $${styleProfile?.budget_min || 0} - $${styleProfile?.budget_max || 1000}
- Style Confidence: ${styleProfile?.style_confidence_score ? Math.round(styleProfile.style_confidence_score * 100) + '%' : 'Not specified'}
- Height: ${styleProfile?.height_cm ? styleProfile.height_cm + 'cm' : 'Not specified'}
- Size Preferences: Top ${styleProfile?.standard_size_top || 'N/A'}, Bottom ${styleProfile?.standard_size_bottom || 'N/A'}, Shoes ${styleProfile?.standard_size_shoes || 'N/A'}

WARDROBE CONTEXT:
${wardrobeItems?.map(item => `- ${item.name} (${item.category}, ${item.color || 'color not specified'}, ${item.brand || 'brand not specified'})`).join('\n') || 'No wardrobe items available'}

AVAILABLE SHOPPING ITEMS FOR INSPIRATION:
${shoppingItems?.map(item => `- ${item.name} by ${item.brand || 'Unknown'} (${item.category}, $${item.price}, Available in: ${item.colors?.join(', ') || 'Various colors'})`).join('\n') || 'No shopping items available'}

OCCASION: ${occasion || 'Daily casual wear'}

${eventDetails ? `
EVENT DETAILS:
- Event: ${eventDetails.name}
- Location: ${eventDetails.location || 'Not specified'}
- Dress Code: ${eventDetails.dressCode || 'Smart Casual'}
- Event Type: ${eventDetails.type || 'General'}
` : ''}

WEATHER CONTEXT:
${weatherData ? `Temperature: ${weatherData.temperature}°F, Condition: ${weatherData.condition}, Humidity: ${weatherData.humidity}%, Location: ${weatherData.location}` : 'Weather not specified'}

STYLING BRIEF:
${recommendationType === 'event_outfit' ? 
  'Create an outfit specifically tailored for this event. If this is a themed party, suggest appropriate character inspirations and costume elements that work with the theme while considering the dress code, weather, and user preferences.' :
  'Create a versatile daily outfit that reflects the user\'s personal style while being practical for their lifestyle.'
}

SPECIAL INSTRUCTIONS FOR THEMED EVENTS:
If the occasion mentions a theme (like "literature and drama", "1920s", "Hollywood", etc.), you should:
1. Suggest 2-3 specific character inspirations that fit the theme
2. Explain how to achieve the look using both existing wardrobe items and shopping suggestions
3. Provide specific costume piece recommendations and where to find them (online stores, costume shops, etc.)
4. Consider the weather and dress code when adapting the character look
5. Offer both elaborate and subtle interpretations of the theme

Please provide a detailed outfit recommendation in the following JSON format:
{
  "character_suggestions": [
    {
      "name": "Character Name",
      "source": "Book/Play/Movie",
      "description": "Brief description of character and their style",
      "difficulty": "Easy/Medium/Hard",
      "why_perfect": "Why this character fits the theme and user"
    }
  ],
  "recommended_items": {
    "top": { 
      "name": "specific item name", 
      "confidence": 0.9, 
      "reasoning": "detailed explanation of why this works for the user's body type, style preferences, and occasion",
      "styling_tips": "how to wear this piece effectively",
      "alternatives": ["alternative option 1", "alternative option 2"],
      "character_connection": "how this relates to the suggested character if themed"
    },
    "bottom": { 
      "name": "specific item name", 
      "confidence": 0.85, 
      "reasoning": "detailed explanation",
      "styling_tips": "how to style this piece",
      "alternatives": ["alternative option 1", "alternative option 2"],
      "character_connection": "how this relates to the suggested character if themed"
    },
    "shoes": { 
      "name": "specific item name", 
      "confidence": 0.8, 
      "reasoning": "detailed explanation",
      "styling_tips": "how to choose and style shoes",
      "alternatives": ["alternative option 1", "alternative option 2"],
      "character_connection": "how this relates to the suggested character if themed"
    },
    "accessories": [
      { 
        "name": "specific accessory name", 
        "confidence": 0.7, 
        "reasoning": "why this accessory complements the outfit",
        "styling_tips": "how to incorporate this accessory",
        "character_connection": "how this relates to the suggested character if themed"
      }
    ],
    "outerwear": { 
      "name": "specific outerwear name", 
      "confidence": 0.75, 
      "reasoning": "weather and style considerations",
      "styling_tips": "layering advice",
      "alternatives": ["alternative option 1", "alternative option 2"],
      "character_connection": "how this relates to the suggested character if themed"
    }
  },
  "overall_confidence": 0.87,
  "style_reasoning": "Comprehensive explanation of the outfit's cohesiveness, how it flatters the user's body type, reflects their style preferences, suits the occasion, and works with the weather",
  "color_analysis": "Detailed explanation of color choices and how they work with the user's preferences and complexion",
  "fit_guidance": "Specific advice on fit and silhouette based on body type and preferences",
  "styling_tips": [
    "Professional tip 1 about proportions and silhouette",
    "Practical advice about comfort and functionality", 
    "Style enhancement tip about accessories or details",
    "Maintenance or care tip for the recommended pieces"
  ],
  "alternative_options": {
    "if_cooler": "Specific layering suggestions if temperature drops",
    "if_warmer": "Modifications for warmer weather",
    "dressy_version": "How to elevate this look for more formal occasions",
    "casual_version": "How to dress down for more relaxed settings",
    "budget_friendly": "More affordable alternatives that achieve similar look",
    "investment_pieces": "Key items worth investing in for long-term wardrobe building"
  },
  "shopping_suggestions": {
    "priority_items": ["item 1 to buy first", "item 2 to buy second"],
    "brands_to_consider": ["brand 1", "brand 2", "brand 3"],
    "costume_shops": ["specific UK costume rental shops", "online costume retailers"],
    "where_to_find": {
      "high_street": "Specific UK stores like Zara, H&M, ASOS for costume pieces",
      "vintage_shops": "Vintage stores for authentic period pieces",
      "online": "Specific websites for costume elements",
      "diy_tips": "How to modify existing pieces for the theme"
    },
    "price_ranges": {
      "budget": "Under $50 options",
      "mid_range": "$50-150 options", 
      "investment": "$150+ investment pieces"
    }
  }
}

Focus on creating a cohesive, stylish outfit that authentically represents the user's personal style while being appropriate for the occasion and weather. Consider current fashion trends but prioritize timeless style principles and the user's individual preferences.`;

    // Call OpenAI API with enhanced model
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Using more powerful model for better fashion advice
        messages: [
          {
            role: 'system',
            content: 'You are a world-class fashion stylist and personal shopping expert with extensive knowledge of fashion history, current trends, color theory, body types, and styling techniques. You have worked with celebrities, fashion magazines, and luxury brands. Your recommendations are always practical, stylish, and perfectly tailored to each individual client. Always respond with valid JSON in the exact format requested.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000, // Increased for more detailed responses
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const aiResponse = await openaiResponse.json();
    let recommendationData;

    try {
      const content = aiResponse.choices[0].message.content.trim();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendationData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Enhanced fallback recommendation
      recommendationData = {
        recommended_items: {
          top: { 
            name: 'Classic White Button-Down Shirt', 
            confidence: 0.8, 
            reasoning: 'Versatile and timeless piece that works for multiple occasions',
            styling_tips: 'Can be worn tucked in for professional look or loose for casual style'
          },
          bottom: { 
            name: 'Well-Fitted Dark Jeans or Tailored Trousers', 
            confidence: 0.85, 
            reasoning: 'Flattering and versatile bottom that pairs well with many tops',
            styling_tips: 'Choose high-waisted for elongating effect'
          },
          shoes: { 
            name: 'Clean White Sneakers or Leather Loafers', 
            confidence: 0.9, 
            reasoning: 'Comfortable yet stylish footwear suitable for multiple occasions',
            styling_tips: 'Keep shoes clean and in good condition for polished appearance'
          }
        },
        overall_confidence: 0.8,
        style_reasoning: 'A classic, versatile outfit foundation that works for most body types and occasions while allowing for personal expression through accessories.',
        styling_tips: ['Ensure proper fit across all pieces', 'Add personal accessories to make the look your own', 'Consider the specific occasion when styling']
      };
    }

    // Save recommendation to database only if user is authenticated
    let savedRecommendation = null;
    if (user) {
      const { data: dbRecommendation, error: saveError } = await supabase
        .from('ai_recommendations')
        .insert({
          user_id: user.id,
          recommendation_type: recommendationType,
          recommended_items: recommendationData.recommended_items,
          occasion,
          weather_context: weatherData,
          confidence_score: recommendationData.overall_confidence,
          reasoning: recommendationData.style_reasoning,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (saveError) {
        console.error('Error saving recommendation:', saveError);
        // Don't throw error, just log it and continue without saving
      } else {
        savedRecommendation = dbRecommendation;
      }
    }

    // Create recommendation response (with or without database record)
    const recommendationResponse = savedRecommendation || {
      id: 'anonymous-' + Date.now(),
      recommendation_type: recommendationType,
      recommended_items: recommendationData.recommended_items,
      occasion,
      weather_context: weatherData,
      confidence_score: recommendationData.overall_confidence,
      reasoning: recommendationData.style_reasoning,
      created_at: new Date().toISOString()
    };

    return new Response(JSON.stringify({
      recommendation: recommendationResponse,
      ai_insights: {
        styling_tips: recommendationData.styling_tips,
        alternative_options: recommendationData.alternative_options,
        color_analysis: recommendationData.color_analysis,
        fit_guidance: recommendationData.fit_guidance,
        shopping_suggestions: recommendationData.shopping_suggestions
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-ai-recommendations function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
