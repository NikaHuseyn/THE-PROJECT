import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { itemName, description, imageBase64, dominantColor, extractedColors }: CategorizationRequest = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!itemName && !description && !imageBase64) {
      throw new Error('At least item name, description, or image must be provided');
    }

    // Build the prompt for AI categorization
    let prompt = `You are a fashion expert AI that categorizes clothing items. Analyze the provided information and return a JSON response with the following structure:

{
  "category": "one of: Tops, Bottoms, Dresses, Outerwear, Shoes, Accessories, Activewear, Formal, Undergarments",
  "subcategory": "specific type like T-Shirt, Jeans, Sneakers, etc.",
  "suggestedBrand": "brand name if identifiable from description/name",
  "colors": ["array", "of", "color", "names"],
  "tags": ["relevant", "style", "tags"],
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation of categorization"
}

Available categories:
- Tops: T-shirts, Blouses, Sweaters, Tank tops, Shirts, Hoodies
- Bottoms: Jeans, Pants, Shorts, Skirts, Leggings
- Dresses: Casual dresses, Formal dresses, Maxi dresses, Mini dresses
- Outerwear: Jackets, Coats, Blazers, Cardigans, Vests
- Shoes: Sneakers, Boots, Heels, Flats, Sandals, Loafers
- Accessories: Bags, Jewelry, Belts, Hats, Scarves, Sunglasses
- Activewear: Gym clothes, Sports bras, Athletic shorts, Yoga pants
- Formal: Business attire, Evening wear, Suits
- Undergarments: Bras, Underwear, Shapewear, Socks

Information to analyze:`;

    if (itemName) {
      prompt += `\nItem Name: "${itemName}"`;
    }
    
    if (description) {
      prompt += `\nDescription: "${description}"`;
    }
    
    if (dominantColor) {
      prompt += `\nDominant Color: ${dominantColor}`;
    }
    
    if (extractedColors && extractedColors.length > 0) {
      prompt += `\nExtracted Colors: ${extractedColors.join(', ')}`;
    }

    prompt += `\n\nProvide accurate categorization with high confidence when the information is clear, lower confidence when ambiguous. Use descriptive color names (e.g., "Navy Blue" instead of just "Blue").`;

    const messages: any[] = [
      { 
        role: 'system', 
        content: 'You are a fashion categorization expert. Always respond with valid JSON only.' 
      },
      { 
        role: 'user', 
        content: prompt 
      }
    ];

    // Add image if provided
    if (imageBase64) {
      messages[1].content = [
        { type: 'text', text: prompt },
        {
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${imageBase64}`,
            detail: 'low'
          }
        }
      ];
    }

    console.log('Sending request to OpenAI for categorization');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: messages,
        max_completion_tokens: 500,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log('OpenAI response received:', JSON.stringify(data));

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from AI model');
    }

    let result: CategorizationResult;
    try {
      result = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', data.choices[0].message.content);
      throw new Error('Invalid response format from AI model');
    }

    // Validate the result
    const validCategories = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Activewear', 'Formal', 'Undergarments'];
    if (!validCategories.includes(result.category)) {
      result.category = 'Tops'; // Default fallback
      result.confidence = Math.max(0, (result.confidence || 0.5) - 0.3);
    }

    // Ensure confidence is within valid range
    result.confidence = Math.max(0, Math.min(1, result.confidence || 0.5));

    console.log('Categorization result:', JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in categorize-wardrobe-item function:', error);
    
    // Return a fallback result instead of an error
    const fallbackResult: CategorizationResult = {
      category: 'Tops',
      colors: [],
      tags: [],
      confidence: 0.1,
      reasoning: `Auto-categorization failed: ${error.message}. Using default category.`
    };

    return new Response(JSON.stringify(fallbackResult), {
      status: 200, // Return 200 with fallback instead of error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});