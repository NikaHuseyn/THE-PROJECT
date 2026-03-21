import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from '@/hooks/useLocation';
import { toast } from 'sonner';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendation?: any;
  venueContext?: any;
  timestamp: Date;
}

// Patterns that suggest a venue mention
const VENUE_INDICATORS = [
  /\b(?:at|going to|dinner at|lunch at|drinks at|visiting|booked|reservation at|table at|staying at|checked into)\s+([A-Z][A-Za-z''&\-\s]{2,40}(?:Restaurant|Bar|Club|Hotel|Lounge|Grill|Bistro|Brasserie|Café|Tavern|Inn|House|Kitchen|Room|Rooms|Terrace|Rooftop)?)/i,
  /\b([A-Z][A-Za-z''&\-]{2,30}(?:'s)?)\s+(?:restaurant|bar|club|hotel|lounge|rooftop|bistro|brasserie|pub|cocktail bar|wine bar|speakeasy|supper club)/i,
  /\b(?:The\s+)?([A-Z][A-Za-z''&\-\s]{2,35})\s+(?:in\s+(?:London|Manchester|Birmingham|Edinburgh|Glasgow|Liverpool|Bristol|Leeds|Brighton|Soho|Mayfair|Shoreditch|Chelsea|Covent Garden|Knightsbridge|Notting Hill|Fitzrovia|Marylebone|Kensington|Westminster|Dalston|Hackney|Brixton|Peckham|Camden))/i,
];

function detectVenueName(message: string): string | null {
  for (const pattern of VENUE_INDICATORS) {
    const match = message.match(pattern);
    if (match?.[1]) {
      const name = match[1].trim();
      // Filter out common false positives
      const falsePositives = ['I', 'My', 'The', 'A', 'An', 'We', 'They', 'He', 'She', 'It', 'This', 'That', 'What', 'How'];
      if (name.length > 2 && !falsePositives.includes(name)) {
        return name;
      }
    }
  }
  return null;
}

export const useStylingChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getLocation } = useLocation({ showToasts: false });

  const scrapeVenue = useCallback(async (venueName: string) => {
    try {
      console.log('Detecting venue, scraping:', venueName);
      const { data, error } = await supabase.functions.invoke('scrape-venue', {
        body: { venueName },
      });

      if (error) {
        console.warn('Venue scrape error:', error);
        return null;
      }

      if (data?.success && data?.venueContext) {
        console.log('Venue context extracted:', data.venueContext);
        return data.venueContext;
      }

      return null;
    } catch (err) {
      console.warn('Venue scrape failed:', err);
      return null;
    }
  }, []);

  const sendMessage = useCallback(async (userMessage: string) => {
    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Detect venue in parallel with weather fetch
      const detectedVenue = detectVenueName(userMessage);
      
      const [weatherData, venueContext] = await Promise.all([
        // Get weather data
        (async () => {
          try {
            const coordinates = await getLocation();
            if (coordinates) {
              const { data } = await supabase.functions.invoke('weather-recommendations', {
                body: { lat: coordinates.latitude, lon: coordinates.longitude }
              });
              return data;
            }
          } catch {
            return {
              temperature: 55,
              condition: 'Partly Cloudy',
              location: 'London, UK',
              humidity: 65
            };
          }
          return null;
        })(),
        // Scrape venue if detected
        detectedVenue ? scrapeVenue(detectedVenue) : Promise.resolve(null),
      ]);

      // Get session for auth
      const { data: { session } } = await supabase.auth.getSession();
      const headers = session ? { Authorization: `Bearer ${session.access_token}` } : {};

      // Build conversation history
      const conversationContext = messages.map(m => ({
        role: m.role,
        content: m.content,
        recommendationSummary: m.recommendation ? {
          items: m.recommendation.recommended_items ? Object.keys(m.recommendation.recommended_items) : [],
          occasion: m.recommendation.occasion,
        } : undefined,
      }));

      const isFollowUp = messages.length > 0;
      const originalRequest = messages.find(m => m.role === 'user')?.content || '';

      // Call AI recommendations with venue context
      const { data, error } = await supabase.functions.invoke('generate-ai-recommendations', {
        body: {
          recommendationType: 'event_outfit',
          weatherData,
          occasion: userMessage,
          eventDetails: {
            name: userMessage,
            type: 'event',
          },
          venueContext: venueContext || undefined,
          conversationHistory: isFollowUp ? conversationContext : [],
          originalRequest: isFollowUp ? originalRequest : null,
          guestEmail: session?.user?.email || `guest-${Date.now()}@temp.com`
        },
        headers
      });

      if (error) {
        throw new Error(error.message || 'Failed to get recommendation');
      }

      // Determine response content
      let responseContent = '';
      
      // Add venue context notice if found
      if (venueContext) {
        const dressCodeText = venueContext.dress_code !== 'none_specified' 
          ? `**Dress code:** ${venueContext.dress_code_details || venueContext.dress_code}`
          : '';
        const atmosphereText = venueContext.atmosphere ? `**Atmosphere:** ${venueContext.atmosphere}` : '';
        
        const venueInfo = [dressCodeText, atmosphereText].filter(Boolean).join('\n');
        if (venueInfo) {
          responseContent += `📍 I found info about **${venueContext.venue_name || detectedVenue}**:\n${venueInfo}\n\n`;
        }
      }

      if (data?.recommendation?.reasoning) {
        responseContent += data.recommendation.reasoning;
      } else if (data?.recommendation?.recommended_items) {
        responseContent += "Here's what I recommend for you:";
      } else {
        responseContent += "I've put together some styling suggestions based on your request.";
      }

      // Add assistant response
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: responseContent,
        recommendation: data?.recommendation ? {
          ...data.recommendation,
          ai_insights: data.ai_insights
        } : undefined,
        venueContext: venueContext || undefined,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);

    } catch (error) {
      console.error('Error in styling chat:', error);
      toast.error('Something went wrong. Please try again.');
      
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I couldn't process your request. Please try again or rephrase your question.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, getLocation, scrapeVenue]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
  };
};
