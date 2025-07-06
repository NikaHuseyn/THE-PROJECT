
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
  description: string;
  feelsLike: number;
  uvIndex?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lon } = await req.json();
    
    const openWeatherApiKey = Deno.env.get('OPENWEATHER_API_KEY');
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openWeatherApiKey || !openAIApiKey) {
      throw new Error('Missing required API keys');
    }

    // Fetch weather data from OpenWeatherMap
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=imperial`
    );
    
    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }
    
    const weatherData = await weatherResponse.json();
    
    // Transform weather data
    const weather: WeatherData = {
      temperature: Math.round(weatherData.main.temp),
      condition: weatherData.weather[0].main,
      humidity: weatherData.main.humidity,
      windSpeed: Math.round(weatherData.wind?.speed || 0),
      location: `${weatherData.name}, ${weatherData.sys.country}`,
      description: weatherData.weather[0].description,
      feelsLike: Math.round(weatherData.main.feels_like),
      uvIndex: weatherData.uvi || undefined
    };

    // Generate AI-powered clothing recommendations
    const prompt = `Based on the following weather conditions, provide 5-6 specific, practical clothing recommendations:

Weather Details:
- Temperature: ${weather.temperature}°F (feels like ${weather.feelsLike}°F)
- Condition: ${weather.condition} - ${weather.description}
- Humidity: ${weather.humidity}%
- Wind Speed: ${weather.windSpeed} mph
- Location: ${weather.location}

Please provide clothing recommendations that are:
1. Practical for the weather conditions
2. Suitable for different activities (work, casual, outdoor)
3. Consider comfort and style
4. Take into account temperature, humidity, and wind

Respond with a JSON array of 5-6 clothing recommendation strings, like:
["Light cotton shirt", "Breathable pants", "Comfortable sneakers", "Light cardigan for AC", "Sunglasses", "Lightweight scarf"]`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a fashion expert that provides practical clothing recommendations based on weather conditions. Always respond with a valid JSON array of clothing recommendation strings.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const aiData = await aiResponse.json();
    let clothingRecommendations: string[] = [];
    
    try {
      const recommendationsText = aiData.choices[0].message.content.trim();
      // Try to parse the JSON response
      clothingRecommendations = JSON.parse(recommendationsText);
    } catch (parseError) {
      console.error('Failed to parse AI recommendations:', parseError);
      // Fallback recommendations based on temperature
      if (weather.temperature >= 75) {
        clothingRecommendations = ['Light fabrics', 'Sundresses', 'Breathable cotton', 'Comfortable sandals', 'Sun hat'];
      } else if (weather.temperature >= 65) {
        clothingRecommendations = ['Light layers', 'Cardigans', 'Comfortable jeans', 'Casual flats', 'Light jacket'];
      } else if (weather.temperature >= 55) {
        clothingRecommendations = ['Warm sweaters', 'Jackets', 'Closed-toe shoes', 'Long pants', 'Layered outfits'];
      } else {
        clothingRecommendations = ['Warm coats', 'Boots', 'Scarves', 'Heavy fabrics', 'Gloves'];
      }
    }

    const result = {
      ...weather,
      clothingRecommendations
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in weather-recommendations function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
