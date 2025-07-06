
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette } from 'lucide-react';
import ArrayInputField from './ArrayInputField';

interface StyleProfile {
  preferred_colors?: string[];
  preferred_patterns?: string[];
  preferred_fabrics?: string[];
  style_personality?: string[];
}

interface StylePreferencesSectionProps {
  profile: StyleProfile | null;
  onProfileChange: (updates: Partial<StyleProfile>) => void;
}

const StylePreferencesSection = ({ profile, onProfileChange }: StylePreferencesSectionProps) => {
  const addToArray = (arrayName: keyof StyleProfile, value: string) => {
    if (profile) {
      const currentArray = (profile[arrayName] as string[]) || [];
      if (!currentArray.includes(value)) {
        onProfileChange({
          [arrayName]: [...currentArray, value],
        });
      }
    }
  };

  const removeFromArray = (arrayName: keyof StyleProfile, index: number) => {
    if (profile) {
      const currentArray = (profile[arrayName] as string[]) || [];
      onProfileChange({
        [arrayName]: currentArray.filter((_, i) => i !== index),
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Style Preferences <span className="text-sm text-gray-500 font-normal">(Optional)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ArrayInputField
          label="Preferred Colors"
          items={profile?.preferred_colors}
          placeholder="Add a preferred color"
          onAdd={(item) => addToArray('preferred_colors', item)}
          onRemove={(index) => removeFromArray('preferred_colors', index)}
        />

        <ArrayInputField
          label="Preferred Patterns"
          items={profile?.preferred_patterns}
          placeholder="Add a preferred pattern"
          onAdd={(item) => addToArray('preferred_patterns', item)}
          onRemove={(index) => removeFromArray('preferred_patterns', index)}
        />

        <ArrayInputField
          label="Preferred Fabrics"
          items={profile?.preferred_fabrics}
          placeholder="Add a preferred fabric"
          onAdd={(item) => addToArray('preferred_fabrics', item)}
          onRemove={(index) => removeFromArray('preferred_fabrics', index)}
        />

        <ArrayInputField
          label="Style Personality"
          items={profile?.style_personality}
          placeholder="Add a style personality trait"
          onAdd={(item) => addToArray('style_personality', item)}
          onRemove={(index) => removeFromArray('style_personality', index)}
        />
      </CardContent>
    </Card>
  );
};

export default StylePreferencesSection;
