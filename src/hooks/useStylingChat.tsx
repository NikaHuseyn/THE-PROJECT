import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from '@/hooks/useLocation';
import { toast } from 'sonner';
import { detectVenue, detectEvent, VenueDetectionResult } from './styling-chat/venueEventDetection';
import { extractLocation, extractFutureDate, formatDateLabel } from './styling-chat/weatherExtraction';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendation?: any;
  venueContext?: any;
  eventContext?: any;
  culturalContext?: {
    country: string;
    norms: Array<{ context_type: string; guidance: string }>;
  } | null;
  /** When set, the UI should render tappable city chips for venue disambiguation */
  cityClarificationChips?: string[];
  timestamp: Date;
}

export const useStylingChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getLocation } = useLocation({ showToasts: false });

  // Tracks a pending venue that needs city clarification before we can scrape
  const [pendingVenue, setPendingVenue] = useState<{
    originalMessage: string;
    venueName: string;
    possibleCities: string[];
  } | null>(null);

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

  /**
   * Core recommendation flow — called after venue/event detection is resolved.
   */
  const executeRecommendation = useCallback(async (
    userMessage: string,
    resolvedVenueName: string | null,
    detectedEventName: string | null,
  ) => {
    try {
      const [weatherData, venueContext, eventContext] = await Promise.all([
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
        resolvedVenueName ? scrapeVenue(resolvedVenueName) : Promise.resolve(null),
        detectedEventName ? scrapeEvent(detectedEventName) : Promise.resolve(null),
      ]);

      const { data: { session } } = await supabase.auth.getSession();
      const headers = session ? { Authorization: `Bearer ${session.access_token}` } : {};

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

      const { data, error } = await supabase.functions.invoke('generate-ai-recommendations', {
        body: {
          recommendationType: 'event_outfit',
          weatherData,
          occasion: userMessage,
          eventDetails: { name: userMessage, type: 'event' },
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

      let responseContent = '';

      if (venueContext?.source === 'scraped') {
        const dressCodeText = venueContext.dress_code !== 'none_specified'
          ? `**Dress code:** ${venueContext.dress_code_details || venueContext.dress_code}`
          : '';
        const atmosphereText = venueContext.atmosphere ? `**Atmosphere:** ${venueContext.atmosphere}` : '';
        const venueInfo = [dressCodeText, atmosphereText].filter(Boolean).join('\n');
        if (venueInfo) {
          responseContent += `📍 I found info about **${venueContext.venue_name || resolvedVenueName}**:\n${venueInfo}\n\n`;
        }
      }

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
          responseContent += `🎫 I found info about **${eventContext.event_name || detectedEventName}**:\n${parts.join('\n')}\n\n`;
        }
      }

      if (data?.recommendation?.reasoning) {
        responseContent += data.recommendation.reasoning;
      } else if (data?.recommendation?.recommended_items) {
        responseContent += "Here's what I recommend for you:";
      } else {
        responseContent += "I've put together some styling suggestions based on your request.";
      }

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
        culturalContext: data?.cultural_context || undefined,
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
    }
  }, [messages, getLocation, scrapeVenue, scrapeEvent]);

  const sendMessage = useCallback(async (userMessage: string) => {
    // --- Handle pending venue city clarification ---
    if (pendingVenue) {
      const selectedCity = userMessage.trim();
      const resolvedName = `${pendingVenue.venueName} ${selectedCity}`;

      // Add user's city selection as a message
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: selectedCity,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMsg]);
      setIsLoading(true);

      const originalMessage = pendingVenue.originalMessage;
      setPendingVenue(null);

      try {
        const detectedEvent = detectEvent(originalMessage);
        await executeRecommendation(originalMessage, resolvedName, detectedEvent);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // --- Normal message flow ---
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const venueResult: VenueDetectionResult | null = detectVenue(userMessage);
      const detectedEvent = detectEvent(userMessage);

      // If venue is ambiguous (multi-city, no city specified), ask the user
      if (venueResult?.isMultiCity) {
        setPendingVenue({
          originalMessage: userMessage,
          venueName: venueResult.venueName,
          possibleCities: venueResult.possibleCities,
        });

        const clarificationMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: `I found a few **${venueResult.venueName}** locations around the world — which city are you heading to?`,
          cityClarificationChips: venueResult.possibleCities,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, clarificationMsg]);
        setIsLoading(false);
        return;
      }

      // Resolve venue name (with city if detected)
      let resolvedVenueName: string | null = null;
      if (venueResult) {
        resolvedVenueName = venueResult.city
          ? `${venueResult.venueName} ${venueResult.city}`
          : venueResult.venueName;
      }

      await executeRecommendation(userMessage, resolvedVenueName, detectedEvent);
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
  }, [messages, pendingVenue, executeRecommendation]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setPendingVenue(null);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
  };
};
