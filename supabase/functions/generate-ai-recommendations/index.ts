
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
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user from JWT token
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid authentication');
    }

    const { recommendationType = 'daily_outfit', weatherData, occasion } = await req.json();

    // Fetch user's style profile
    const { data: styleProfile } = await supabase
      .from('user_style_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Fetch user's wardrobe items for context
    const { data: wardrobeItems } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', user.id)
      .limit(20);

    // Create AI prompt based on user data
    const prompt = `You are an expert fashion stylist. Create a personalized outfit recommendation based on the following information:

USER STYLE PROFILE:
- Body Type: ${styleProfile?.body_type || 'Not specified'}
- Preferred Colors: ${styleProfile?.preferred_colors?.join(', ') || 'None specified'}
- Disliked Colors: ${styleProfile?.disliked_colors?.join(', ') || 'None specified'}
- Style Personality: ${styleProfile?.style_personality?.join(', ') || 'None specified'}
- Preferred Patterns: ${styleProfile?.preferred_patterns?.join(', ') || 'None specified'}
- Preferred Fabrics: ${styleProfile?.preferred_fabrics?.join(', ') || 'None specified'}
- Budget Range: $${styleProfile?.budget_min || 0} - $${styleProfile?.budget_max || 1000}
- Style Confidence: ${styleProfile?.style_confidence_score ? Math.round(styleProfile.style_confidence_score * 100) + '%' : 'Not specified'}

WARDROBE CONTEXT:
${wardrobeItems?.map(item => `- ${item.name} (${item.category}, ${item.color || 'color not specified'})`).join('\n') || 'No wardrobe items available'}

OCCASION: ${occasion || 'Daily casual wear'}

WEATHER CONTEXT:
${weatherData ? `Temperature: ${weatherData.temperature}°F, Condition: ${weatherData.condition}, Humidity: ${weatherData.humidity}%` : 'Weather not specified'}

Please provide a detailed outfit recommendation in the following JSON format:
{
  "recommended_items": {
    "top": { "name": "item name", "confidence": 0.9, "reasoning": "why this works" },
    "bottom": { "name": "item name", "confidence": 0.85, "reasoning": "why this works" },
    "shoes": { "name": "item name", "confidence": 0.8, "reasoning": "why this works" },
    "accessories": [{ "name": "item name", "confidence": 0.7, "reasoning": "why this works" }],
    "outerwear": { "name": "item name", "confidence": 0.75, "reasoning": "why this works" }
  },
  "overall_confidence": 0.87,
  "style_reasoning": "Comprehensive explanation of why this outfit works for the user's body type, preferences, occasion, and weather",
  "styling_tips": ["tip 1", "tip 2", "tip 3"],
  "alternative_options": {
    "if_cooler": "Alternative suggestions if weather gets cooler",
    "if_warmer": "Alternative suggestions if weather gets warmer",
    "dressy_version": "How to dress this up for a more formal occasion",
    "casual_version": "How to dress this down for a more casual occasion"
  }
}

Focus on creating a cohesive, stylish outfit that matches the user's preferences, body type, and the occasion. Consider color coordination, proportion, and current fashion trends while staying true to their personal style.`;

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional fashion stylist with expertise in personal styling, color theory, body types, and current fashion trends. Always respond with valid JSON in the exact format requested.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
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
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendationData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback recommendation structure
      recommendationData = {
        recommended_items: {
          top: { name: 'Classic White Button-Down Shirt', confidence: 0.8, reasoning: 'Versatile and timeless piece' },
          bottom: { name: 'Well-Fitted Dark Jeans', confidence: 0.85, reasoning: 'Flattering and versatile' },
          shoes: { name: 'Clean White Sneakers', confidence: 0.9, reasoning: 'Comfortable and stylish' }
        },
        overall_confidence: 0.8,
        style_reasoning: 'A classic, versatile outfit that works for most body types and occasions.',
        styling_tips: ['Ensure proper fit', 'Add personal accessories', 'Consider the occasion']
      };
    }

    // Save recommendation to database
    const { data: savedRecommendation, error: saveError } = await supabase
      .from('ai_recommendations')
      .insert({
        user_id: user.id,
        recommendation_type: recommendationType,
        recommended_items: recommendationData.recommended_items,
        occasion,
        weather_context: weatherData,
        confidence_score: recommendationData.overall_confidence,
        reasoning: recommendationData.style_reasoning,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving recommendation:', saveError);
      throw new Error('Failed to save recommendation');
    }

    return new Response(JSON.stringify({
      recommendation: savedRecommendation,
      ai_insights: {
        styling_tips: recommendationData.styling_tips,
        alternative_options: recommendationData.alternative_options
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
