
import { supabase } from '@/integrations/supabase/client';
import { EncryptionService } from '@/utils/encryption';

export interface CalendarEvent {
  id: string;
  name: string;
  time: string;
  location: string;
  dressCode: string;
  type: string;
  start: string;
  end: string;
}

class GoogleCalendarService {
  private isGapiLoaded = false;
  private isGsiLoaded = false;
  private accessToken: string | null = null;
  private isDemoMode = false; // Demo mode disabled for security

  async initializeGoogleAPIs(): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkAPIs = () => {
        if (window.gapi && window.google) {
          this.isGapiLoaded = true;
          this.isGsiLoaded = true;
          resolve();
        } else {
          setTimeout(checkAPIs, 100);
        }
      };
      checkAPIs();
    });
  }

  async signInToGoogle(): Promise<boolean> {
    try {
      if (this.isDemoMode) {
        // Simulate successful connection in demo mode
        await this.simulateDemoConnection();
        return true;
      }

      await this.initializeGoogleAPIs();

      return new Promise((resolve) => {
        window.gapi.load('auth2', () => {
          window.gapi.auth2.init({
            client_id: '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com', // Demo client ID
            scope: 'https://www.googleapis.com/auth/calendar.readonly'
          }).then(() => {
            const authInstance = window.gapi.auth2.getAuthInstance();
            return authInstance.signIn();
          }).then(async (user: any) => {
            this.accessToken = user.getAuthResponse().access_token;
            await this.saveCalendarConnection(user.getBasicProfile().getEmail());
            resolve(true);
          }).catch((error: any) => {
            console.error('Google sign-in failed:', error);
            resolve(false);
          });
        });
      });
    } catch (error) {
      console.error('Google API initialization failed:', error);
      return false;
    }
  }

  private async simulateDemoConnection(): Promise<void> {
    throw new Error('Demo mode is disabled for security reasons. Please configure proper OAuth credentials.');
  }

  async saveCalendarConnection(email: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    if (!this.accessToken) {
      throw new Error('Access token is required for calendar connection');
    }

    try {
      // Encrypt the access token before storage
      const encryptedData = await EncryptionService.createSecureTokenStorage(this.accessToken);
      
      // Validate that encryption was successful
      if (!EncryptionService.validateEncryptedToken(encryptedData)) {
        throw new Error('Token encryption validation failed');
      }

      // Store the encrypted token
      const { error } = await supabase
        .from('user_oauth_connections')
        .upsert({
          user_id: user.id,
          provider: 'google',
          provider_user_id: email,
          encrypted_access_token: encryptedData.encrypted_token,
          encryption_key_id: encryptedData.encryption_key_id,
          scope: ['https://www.googleapis.com/auth/calendar.readonly'],
          is_active: true,
          token_expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw new Error(`Failed to save calendar connection: ${error.message}`);
      }
    } catch (error) {
      console.error('Error saving calendar connection:', error);
      throw error;
    }
  }

  async fetchTodaysEvents(): Promise<CalendarEvent[]> {
    try {
      if (this.isDemoMode) {
        return this.generateDemoEvents();
      }

      if (!this.accessToken) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data: connection } = await supabase
          .from('user_oauth_connections')
          .select('encrypted_access_token, encryption_key_id')
          .eq('provider_user_id', user.email)
          .eq('provider', 'google')
          .eq('is_active', true)
          .single();

        if (!connection?.encrypted_access_token) return [];
        // In a real implementation, decrypt the token here
        this.accessToken = 'decrypted_' + connection.encrypted_access_token;
      }

      const today = new Date();
      const timeMin = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const timeMax = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch calendar events');
      }

      const data = await response.json();
      const events = data.items || [];

      const transformedEvents: CalendarEvent[] = events.map((event: any) => ({
        id: event.id,
        name: event.summary || 'Untitled Event',
        time: this.formatEventTime(event.start),
        location: event.location || 'No location specified',
        dressCode: this.inferDressCode(event.summary, event.description),
        type: this.inferEventType(event.summary, event.description),
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date
      }));

      await this.saveSyncedEvents(transformedEvents);
      return transformedEvents;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      if (this.isDemoMode) {
        return this.generateDemoEvents();
      }
      return [];
    }
  }

  private generateDemoEvents(): CalendarEvent[] {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    return [
      {
        id: 'demo-1',
        name: 'Morning Team Meeting',
        time: '9:00 AM',
        location: 'Conference Room A',
        dressCode: 'Business Casual',
        type: 'work',
        start: `${today}T09:00:00Z`,
        end: `${today}T10:00:00Z`
      },
      {
        id: 'demo-2',
        name: 'Lunch with Sarah',
        time: '12:30 PM',
        location: 'Cafe Downtown',
        dressCode: 'Smart Casual',
        type: 'social',
        start: `${today}T12:30:00Z`,
        end: `${today}T13:30:00Z`
      },
      {
        id: 'demo-3',
        name: 'Evening Yoga Class',
        time: '6:00 PM',
        location: 'Wellness Studio',
        dressCode: 'Activewear',
        type: 'fitness',
        start: `${today}T18:00:00Z`,
        end: `${today}T19:00:00Z`
      }
    ];
  }

  private formatEventTime(start: any): string {
    if (start.dateTime) {
      return new Date(start.dateTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else if (start.date) {
      return 'All day';
    }
    return 'Time TBD';
  }

  private inferDressCode(title: string, description?: string): string {
    const text = (title + ' ' + (description || '')).toLowerCase();
    
    if (text.includes('formal') || text.includes('gala') || text.includes('wedding')) {
      return 'Formal';
    } else if (text.includes('business') || text.includes('meeting') || text.includes('work') || text.includes('office')) {
      return 'Business Casual';
    } else if (text.includes('gym') || text.includes('workout') || text.includes('yoga') || text.includes('fitness')) {
      return 'Activewear';
    } else if (text.includes('casual') || text.includes('coffee') || text.includes('lunch')) {
      return 'Smart Casual';
    }
    
    return 'Smart Casual';
  }

  private inferEventType(title: string, description?: string): string {
    const text = (title + ' ' + (description || '')).toLowerCase();
    
    if (text.includes('work') || text.includes('meeting') || text.includes('business')) {
      return 'work';
    } else if (text.includes('gym') || text.includes('workout') || text.includes('yoga') || text.includes('fitness')) {
      return 'fitness';
    } else {
      return 'social';
    }
  }

  private async saveSyncedEvents(events: CalendarEvent[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    await supabase
      .from('synced_calendar_events')
      .delete()
      .eq('user_id', user.id)
      .gte('start_time', today)
      .lt('start_time', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    if (events.length > 0) {
      const eventsToInsert = events.map(event => ({
        user_id: user.id,
        external_event_id: event.id,
        title: event.name,
        description: null,
        location: event.location,
        start_time: event.start,
        end_time: event.end,
        event_type: event.type,
        dress_code: event.dressCode,
        provider: 'google'
      }));

      const { error } = await supabase
        .from('synced_calendar_events')
        .insert(eventsToInsert);

      if (error) {
        console.error('Error saving synced events:', error);
      }
    }
  }

  async getSyncedEvents(): Promise<CalendarEvent[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const today = new Date().toISOString().split('T')[0];
    const { data: events, error } = await supabase
      .from('synced_calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_time', today)
      .lt('start_time', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('start_time');

    if (error) {
      console.error('Error fetching synced events:', error);
      return [];
    }

    return (events || []).map((event: any) => ({
      id: event.external_event_id || event.id,
      name: event.title,
      time: this.formatEventTime({ dateTime: event.start_time }),
      location: event.location || 'No location specified',
      dressCode: event.dress_code || 'Smart Casual',
      type: event.event_type || 'social',
      start: event.start_time,
      end: event.end_time
    }));
  }
}

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export const googleCalendarService = new GoogleCalendarService();
