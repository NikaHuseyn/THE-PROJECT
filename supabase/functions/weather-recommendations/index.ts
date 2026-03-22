import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getClothingRecommendations(temp: number, condition: string, windSpeed: number, humidity: number): string[] {
  const lower = condition.toLowerCase();
  const isRainy = lower.includes('rain') || lower.includes('drizzle') || lower.includes('thunderstorm');
  const isSnowy = lower.includes('snow');
  const isWindy = windSpeed > 8;

  if (temp >= 28) {
    const recs = ['Light linen shirt', 'Breathable cotton shorts', 'Comfortable sandals', 'Sunglasses', 'Sun hat'];
    if (humidity > 70) recs.push('Moisture-wicking fabrics');
    if (isRainy) recs.push('Compact umbrella');
    return recs;
  } else if (temp >= 20) {
    const recs = ['Light cotton top', 'Chinos or light trousers', 'Casual trainers', 'Light cardigan for evenings'];
    if (isRainy) recs.push('Waterproof jacket');
    if (isWindy) recs.push('Windbreaker');
    return recs;
  } else if (temp >= 12) {
    const recs = ['Layered outfit', 'Light jacket or blazer', 'Jeans or trousers', 'Closed-toe shoes', 'Light scarf'];
    if (isRainy) recs.push('Waterproof coat');
    if (isWindy) recs.push('Wind-resistant layer');
    return recs;
  } else if (temp >= 5) {
    const recs = ['Warm coat', 'Jumper or sweater', 'Warm trousers', 'Boots', 'Scarf & gloves'];
    if (isRainy) recs.push('Waterproof outer layer');
    return recs;
  } else {
    const recs = ['Heavy winter coat', 'Thermal layers', 'Warm boots', 'Thick scarf', 'Insulated gloves', 'Warm hat'];
    if (isSnowy) recs.push('Waterproof snow boots');
    return recs;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lon } = await req.json();
    
    const openWeatherApiKey = Deno.env.get('OPENWEATHER_API_KEY');
    
    if (!openWeatherApiKey) {
      throw new Error('Missing OPENWEATHER_API_KEY');
    }

    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`
    );
    
    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }
    
    const weatherData = await weatherResponse.json();
    
    const temperature = Math.round(weatherData.main.temp);
    const condition = weatherData.weather[0].main;
    const humidity = weatherData.main.humidity;
    const windSpeed = Math.round(weatherData.wind?.speed || 0);

    const result = {
      temperature,
      condition,
      humidity,
      windSpeed,
      location: `${weatherData.name}, ${weatherData.sys.country}`,
      description: weatherData.weather[0].description,
      feelsLike: Math.round(weatherData.main.feels_like),
      uvIndex: weatherData.uvi || undefined,
      clothingRecommendations: getClothingRecommendations(temperature, condition, windSpeed, humidity),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in weather-recommendations function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
