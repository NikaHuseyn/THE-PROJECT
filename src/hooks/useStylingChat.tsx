import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from '@/hooks/useLocation';
import { toast } from 'sonner';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendation?: any;
  timestamp: Date;
}

export const useStylingChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getLocation } = useLocation({ showToasts: false });

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
      // Get weather data
      let weatherData = null;
      try {
        const coordinates = await getLocation();
        if (coordinates) {
          const { data } = await supabase.functions.invoke('weather-recommendations', {
            body: { lat: coordinates.latitude, lon: coordinates.longitude }
          });
          weatherData = data;
        }
      } catch {
        weatherData = {
          temperature: 55,
          condition: 'Partly Cloudy',
          location: 'London, UK',
          humidity: 65
        };
      }

      // Get session for auth
      const { data: { session } } = await supabase.auth.getSession();
      const headers = session ? { Authorization: `Bearer ${session.access_token}` } : {};

      // Build conversation history for context
      const conversationContext = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Determine if this is a follow-up or new request
      const isFollowUp = messages.length > 0;

      // Call AI recommendations with conversation context
      const { data, error } = await supabase.functions.invoke('generate-ai-recommendations', {
        body: {
          recommendationType: 'event_outfit',
          weatherData,
          occasion: userMessage,
          eventDetails: {
            name: userMessage,
            type: 'event',
          },
          conversationHistory: isFollowUp ? conversationContext : [],
          guestEmail: session?.user?.email || `guest-${Date.now()}@temp.com`
        },
        headers
      });

      if (error) {
        throw new Error(error.message || 'Failed to get recommendation');
      }

      // Determine response content
      let responseContent = '';
      if (data?.recommendation?.reasoning) {
        responseContent = data.recommendation.reasoning;
      } else if (data?.recommendation?.recommended_items) {
        responseContent = "Here's what I recommend for you:";
      } else {
        responseContent = "I've put together some styling suggestions based on your request.";
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
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);

    } catch (error) {
      console.error('Error in styling chat:', error);
      toast.error('Something went wrong. Please try again.');
      
      // Add error response
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
  }, [messages, getLocation]);

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
