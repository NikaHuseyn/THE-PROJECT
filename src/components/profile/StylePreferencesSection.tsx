
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette } from 'lucide-react';
import ArrayInputSection from './forms/ArrayInputSection';

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
  const handleAddToArray = (arrayName: keyof StyleProfile, value: string) => {
    if (!profile) return;
    
    const currentArray = (profile[arrayName] as string[]) || [];
    if (!currentArray.includes(value)) {
      onProfileChange({
        [arrayName]: [...currentArray, value],
      });
    }
  };

  const handleRemoveFromArray = (arrayName: keyof StyleProfile, index: number) => {
    if (!profile) return;
    
    const currentArray = (profile[arrayName] as string[]) || [];
    onProfileChange({
      [arrayName]: currentArray.filter((_, i) => i !== index),
    });
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
        <ArrayInputSection
          title="Preferred Colors"
          placeholder="Add a preferred color"
          values={profile?.preferred_colors || []}
          onAdd={(value) => handleAddToArray('preferred_colors', value)}
          onRemove={(index) => handleRemoveFromArray('preferred_colors', index)}
          maxItems={10}
        />

        <ArrayInputSection
          title="Preferred Patterns"
          placeholder="Add a preferred pattern"
          values={profile?.preferred_patterns || []}
          onAdd={(value) => handleAddToArray('preferred_patterns', value)}
          onRemove={(index) => handleRemoveFromArray('preferred_patterns', index)}
          maxItems={8}
        />

        <ArrayInputSection
          title="Preferred Fabrics"
          placeholder="Add a preferred fabric"
          values={profile?.preferred_fabrics || []}
          onAdd={(value) => handleAddToArray('preferred_fabrics', value)}
          onRemove={(index) => handleRemoveFromArray('preferred_fabrics', index)}
          maxItems={8}
        />

        <ArrayInputSection
          title="Style Personality"
          placeholder="Add a style personality trait"
          values={profile?.style_personality || []}
          onAdd={(value) => handleAddToArray('style_personality', value)}
          onRemove={(index) => handleRemoveFromArray('style_personality', index)}
          maxItems={6}
        />
      </CardContent>
    </Card>
  );
};

export default StylePreferencesSection;
