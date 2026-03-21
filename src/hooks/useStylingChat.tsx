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
  eventContext?: any;
  timestamp: Date;
}

// Patterns that suggest a venue mention
const VENUE_INDICATORS = [
  /\b(?:at|going to|dinner at|lunch at|drinks at|visiting|booked|reservation at|table at|staying at|checked into)\s+(?:the\s+)?([A-Z][A-Za-z''&\-\s]{2,30}(?:Hotel|Restaurant|Bar|Club|Lounge|Grill|Bistro|Brasserie|Café|Tavern|Inn|House|Kitchen|Room|Rooms|Terrace|Rooftop))/i,
  /\b([A-Z][A-Za-z''&\-]{2,30}(?:'s)?)\s+(?:restaurant|bar|club|hotel|lounge|rooftop|bistro|brasserie|pub|cocktail bar|wine bar|speakeasy|supper club)/i,
  /\b(?:The\s+)?([A-Z][A-Za-z''&\-\s]{2,35})\s+(?:in\s+(?:London|Manchester|Birmingham|Edinburgh|Glasgow|Liverpool|Bristol|Leeds|Brighton|Soho|Mayfair|Shoreditch|Chelsea|Covent Garden|Knightsbridge|Notting Hill|Fitzrovia|Marylebone|Kensington|Westminster|Dalston|Hackney|Brixton|Peckham|Camden))/i,
];

// Patterns that suggest a named event mention
const EVENT_INDICATORS = [
  /\b(?:going to|attending|tickets? (?:for|to)|invited to|registered for|signed up for|heading to)\s+(?:the\s+)?([A-Z][A-Za-z''&\-\s]{3,50}(?:Festival|Fest|Gala|Ball|Awards?|Ceremony|Conference|Summit|Expo|Exhibition|Show|Concert|Premiere|Launch|Party|Benefit|Fundraiser|Marathon|Cup|Open|Prix|Week|Fashion Week))/i,
  /\b(?:the\s+)?([A-Z][A-Za-z''&\-\s]{3,40}(?:Festival|Fest|Gala|Ball|Awards?|Ceremony|Conference|Summit|Expo|Exhibition|Show|Concert|Premiere|Launch|Benefit|Fundraiser|Fashion Week))\b/i,
  /\b(?:going to|attending|tickets? (?:for|to)|invited to)\s+(?:the\s+)?([A-Z][A-Za-z''&\-\s]{3,50})\s+(?:festival|gala|ball|awards?|ceremony|conference|summit|expo|exhibition|concert|premiere|event)\b/i,
];

const FALSE_POSITIVE_NAMES = ['I', 'My', 'The', 'A', 'An', 'We', 'They', 'He', 'She', 'It', 'This', 'That', 'What', 'How', 'Going', 'Looking'];

function detectVenueName(message: string): string | null {
  for (const pattern of VENUE_INDICATORS) {
    const match = message.match(pattern);
    if (match?.[1]) {
      const name = match[1].trim();
      if (name.length > 2 && !FALSE_POSITIVE_NAMES.includes(name)) {
        return name;
      }
    }
  }
  return null;
}

function detectEventName(message: string): string | null {
  for (const pattern of EVENT_INDICATORS) {
    const match = message.match(pattern);
    if (match?.[1]) {
      const name = match[1].trim();
      if (name.length > 3 && !FALSE_POSITIVE_NAMES.includes(name)) {
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
        console.warn('Venue scrape error, falling back to name-only:', error);
        return { venue_name: venueName, source: 'name_only' };
      }

      if (data?.success && data?.venueContext) {
        const vc = data.venueContext;
        const hasUsefulInfo = vc.dress_code !== 'none_specified' || vc.atmosphere || vc.formality_level;
        if (hasUsefulInfo) {
          console.log('Venue context extracted:', vc);
          return { ...vc, source: 'scraped' };
        }
        console.log('Scraped venue but no useful dress code info, falling back to name-only');
        return { venue_name: vc.venue_name || venueName, venue_type: vc.venue_type, source: 'name_only' };
      }

      return { venue_name: venueName, source: 'name_only' };
    } catch (err) {
      console.warn('Venue scrape failed, falling back to name-only:', err);
      return { venue_name: venueName, source: 'name_only' };
    }
  }, []);

  const scrapeEvent = useCallback(async (eventName: string) => {
    try {
      console.log('Detecting event, scraping:', eventName);
      const { data, error } = await supabase.functions.invoke('scrape-event', {
        body: { eventName },
      });

      if (error) {
        console.warn('Event scrape error, falling back to name-only:', error);
        return { event_name: eventName, source: 'name_only' };
      }

      if (data?.success && data?.eventContext) {
        const ec = data.eventContext;
        const hasUsefulInfo = ec.dress_code !== 'none_specified' || ec.indoor_outdoor !== 'unknown' || ec.time_of_day !== 'unknown' || ec.style_guidance;
        if (hasUsefulInfo) {
          console.log('Event context extracted:', ec);
          return { ...ec, source: 'scraped' };
        }
        console.log('Scraped event but no useful info, falling back to name-only');
        return { event_name: ec.event_name || eventName, event_type: ec.event_type, source: 'name_only' };
      }

      return { event_name: eventName, source: 'name_only' };
    } catch (err) {
      console.warn('Event scrape failed, falling back to name-only:', err);
      return { event_name: eventName, source: 'name_only' };
    }
  }, []);

  const sendMessage = useCallback(async (userMessage: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Detect venue and event in parallel with weather fetch
      const detectedVenue = detectVenueName(userMessage);
      const detectedEvent = detectEventName(userMessage);
      
      const [weatherData, venueContext, eventContext] = await Promise.all([
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
        // Scrape event if detected
        detectedEvent ? scrapeEvent(detectedEvent) : Promise.resolve(null),
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

      // Call AI recommendations with venue and event context
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
          eventContext: eventContext || undefined,
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
      
      // Add venue context notice only if we scraped useful data
      if (venueContext?.source === 'scraped') {
        const dressCodeText = venueContext.dress_code !== 'none_specified' 
          ? `**Dress code:** ${venueContext.dress_code_details || venueContext.dress_code}`
          : '';
        const atmosphereText = venueContext.atmosphere ? `**Atmosphere:** ${venueContext.atmosphere}` : '';
        
        const venueInfo = [dressCodeText, atmosphereText].filter(Boolean).join('\n');
        if (venueInfo) {
          responseContent += `📍 I found info about **${venueContext.venue_name || detectedVenue}**:\n${venueInfo}\n\n`;
        }
      }

      // Add event context notice only if we scraped useful data
      if (eventContext?.source === 'scraped') {
        const parts: string[] = [];
        if (eventContext.dress_code && eventContext.dress_code !== 'none_specified') {
          parts.push(`**Dress code:** ${eventContext.dress_code_details || eventContext.dress_code}`);
        }
        if (eventContext.indoor_outdoor && eventContext.indoor_outdoor !== 'unknown') {
          parts.push(`**Setting:** ${eventContext.indoor_outdoor}`);
        }
        if (eventContext.time_of_day && eventContext.time_of_day !== 'unknown') {
          parts.push(`**Time:** ${eventContext.time_of_day}`);
        }
        if (eventContext.practical_notes) {
          parts.push(`**Note:** ${eventContext.practical_notes}`);
        }
        if (parts.length > 0) {
          responseContent += `🎫 I found info about **${eventContext.event_name || detectedEvent}**:\n${parts.join('\n')}\n\n`;
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
          ai_insights: data.ai_insights,
          missing_items: data.missing_items
        } : undefined,
        venueContext: venueContext || undefined,
        eventContext: eventContext || undefined,
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
  }, [messages, getLocation, scrapeVenue, scrapeEvent]);

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
