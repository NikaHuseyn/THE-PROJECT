
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Clock, Calendar, Cloud, Zap, Settings } from 'lucide-react';
import { useDailyRecommendations } from '@/hooks/useDailyRecommendations';

const DailyRecommendationSettings = () => {
  const { settings, saveSettings, generateDailyRecommendations, shouldShowGenerateButton } = useDailyRecommendations();

  const handleSettingChange = (key: keyof typeof settings, value: boolean | string) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const timeOptions = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Daily Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable Daily Recommendations */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Enable Daily Recommendations</Label>
            <p className="text-xs text-gray-500">Get AI-powered outfit suggestions every day</p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) => handleSettingChange('enabled', checked)}
          />
        </div>

        {settings.enabled && (
          <>
            {/* Auto Generate */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Auto Generate</Label>
                <p className="text-xs text-gray-500">Automatically create recommendations at scheduled time</p>
              </div>
              <Switch
                checked={settings.autoGenerate}
                onCheckedChange={(checked) => handleSettingChange('autoGenerate', checked)}
              />
            </div>

            {/* Scheduled Time */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Daily Generation Time
              </Label>
              <select
                value={settings.time}
                onChange={(e) => handleSettingChange('time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            {/* Include Weather */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Cloud className="h-4 w-4" />
                  Include Weather
                </Label>
                <p className="text-xs text-gray-500">Factor in current weather conditions</p>
              </div>
              <Switch
                checked={settings.includeWeather}
                onCheckedChange={(checked) => handleSettingChange('includeWeather', checked)}
              />
            </div>

            {/* Include Calendar */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Include Calendar Events
                </Label>
                <p className="text-xs text-gray-500">Generate outfits for your scheduled events</p>
              </div>
              <Switch
                checked={settings.includeCalendar}
                onCheckedChange={(checked) => handleSettingChange('includeCalendar', checked)}
              />
            </div>
          </>
        )}

        {/* Manual Generate Button */}
        {shouldShowGenerateButton() && (
          <div className="pt-4 border-t">
            <Button
              onClick={generateDailyRecommendations}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600"
            >
              <Zap className="h-4 w-4 mr-2" />
              Generate Today's Recommendations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyRecommendationSettings;
