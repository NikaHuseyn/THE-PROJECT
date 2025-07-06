
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DailyRecommendationSettings {
  enabled: boolean;
  time: string;
  includeWeather: boolean;
  includeCalendar: boolean;
  autoGenerate: boolean;
}

export const useDailyRecommendations = () => {
  const [settings, setSettings] = useState<DailyRecommendationSettings>({
    enabled: false,
    time: '08:00',
    includeWeather: true,
    includeCalendar: true,
    autoGenerate: false
  });

  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    checkDailyGeneration();
  }, []);

  const loadSettings = () => {
    const saved = localStorage.getItem('dailyRecommendationSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
    
    const lastGen = localStorage.getItem('lastDailyRecommendation');
    setLastGenerated(lastGen);
  };

  const saveSettings = (newSettings: DailyRecommendationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('dailyRecommendationSettings', JSON.stringify(newSettings));
  };

  const checkDailyGeneration = () => {
    const today = new Date().toDateString();
    const lastGen = localStorage.getItem('lastDailyRecommendation');
    
    if (settings.enabled && settings.autoGenerate && lastGen !== today) {
      const now = new Date();
      const [hours, minutes] = settings.time.split(':').map(Number);
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      if (now >= scheduledTime) {
        generateDailyRecommendations();
      } else {
        const timeUntilScheduled = scheduledTime.getTime() - now.getTime();
        setTimeout(() => {
          generateDailyRecommendations();
        }, timeUntilScheduled);
      }
    }
  };

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      };

      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          console.error('Geolocation error:', error);
          reject(error);
        },
        options
      );
    });
  };

  const generateDailyRecommendations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session for daily recommendations');
        return;
      }

      let weatherData = null;
      if (settings.includeWeather) {
        try {
          const position = await getCurrentPosition();
          console.log('Got location:', position.coords.latitude, position.coords.longitude);
          
          const { data, error } = await supabase.functions.invoke('weather-recommendations', {
            body: { 
              lat: position.coords.latitude, 
              lon: position.coords.longitude 
            }
          });
          
          if (error) {
            console.error('Weather API error:', error);
          } else {
            weatherData = data;
            console.log('Weather data received:', weatherData);
          }
        } catch (error) {
          console.error('Weather fetch failed:', error);
          // Continue without weather data - don't fail the whole process
        }
      }

      // Generate general daily recommendation
      const { error: recError } = await supabase.functions.invoke('generate-ai-recommendations', {
        body: {
          recommendationType: 'daily_outfit',
          weatherData,
          occasion: 'Daily wear'
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (recError) {
        console.error('Error generating AI recommendation:', recError);
        throw recError;
      }

      // Generate calendar-based recommendations if enabled
      if (settings.includeCalendar) {
        try {
          const { data: events } = await supabase
            .from('synced_calendar_events')
            .select('*')
            .eq('user_id', session.user.id)
            .gte('start_time', new Date().toISOString().split('T')[0])
            .lt('start_time', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
            .limit(2);

          for (const event of events || []) {
            await supabase.functions.invoke('generate-ai-recommendations', {
              body: {
                recommendationType: 'event_outfit',
                weatherData,
                occasion: `${event.title} (${event.dress_code || 'Smart Casual'})`,
                eventDetails: {
                  name: event.title,
                  location: event.location,
                  dressCode: event.dress_code,
                  type: event.event_type
                }
              },
              headers: {
                Authorization: `Bearer ${session.access_token}`
              }
            });
          }
        } catch (error) {
          console.error('Calendar events processing failed:', error);
        }
      }

      const today = new Date().toDateString();
      localStorage.setItem('lastDailyRecommendation', today);
      setLastGenerated(today);

      toast.success('Daily style recommendations generated!');
    } catch (error) {
      console.error('Error generating daily recommendations:', error);
      toast.error('Failed to generate daily recommendations');
    }
  };

  const shouldShowGenerateButton = () => {
    const today = new Date().toDateString();
    return lastGenerated !== today;
  };

  return {
    settings,
    saveSettings,
    generateDailyRecommendations,
    shouldShowGenerateButton,
    lastGenerated
  };
};
