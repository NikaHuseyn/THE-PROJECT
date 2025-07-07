
import React from 'react';
import ArrayInputSection from './ArrayInputSection';

interface StylePreferencesGridProps {
  preferences: any;
  newValues: {
    preferredColors: string;
    dislikedColors: string;
    preferredPatterns: string;
    preferredFabrics: string;
    stylePersonality: string;
    dislikedStyles: string;
    preferredBrands: string;
    preferredRetailers: string;
  };
  setNewValues: {
    setNewPreferredColors: (value: string) => void;
    setNewDislikedColors: (value: string) => void;
    setNewPreferredPatterns: (value: string) => void;
    setNewPreferredFabrics: (value: string) => void;
    setNewStylePersonality: (value: string) => void;
    setNewDislikedStyles: (value: string) => void;
    setNewPreferredBrands: (value: string) => void;
    setNewPreferredRetailers: (value: string) => void;
  };
  addToArray: (fieldName: string, value: string, setState: (value: string) => void) => void;
  removeFromArray: (fieldName: string, index: number) => void;
}

const StylePreferencesGrid = ({
  preferences,
  newValues,
  setNewValues,
  addToArray,
  removeFromArray,
}: StylePreferencesGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ArrayInputSection
        title="Preferred Colors"
        placeholder="Add a color..."
        values={preferences.preferred_colors || []}
        onAdd={(value) => addToArray('preferred_colors', value, setNewValues.setNewPreferredColors)}
        onRemove={(index) => removeFromArray('preferred_colors', index)}
        maxItems={10}
      />

      <ArrayInputSection
        title="Disliked Colors"
        placeholder="Add a color..."
        values={preferences.disliked_colors || []}
        onAdd={(value) => addToArray('disliked_colors', value, setNewValues.setNewDislikedColors)}
        onRemove={(index) => removeFromArray('disliked_colors', index)}
        maxItems={10}
      />

      <ArrayInputSection
        title="Preferred Patterns"
        placeholder="Add a pattern..."
        values={preferences.preferred_patterns || []}
        onAdd={(value) => addToArray('preferred_patterns', value, setNewValues.setNewPreferredPatterns)}
        onRemove={(index) => removeFromArray('preferred_patterns', index)}
        maxItems={8}
      />

      <ArrayInputSection
        title="Preferred Fabrics"
        placeholder="Add a fabric..."
        values={preferences.preferred_fabrics || []}
        onAdd={(value) => addToArray('preferred_fabrics', value, setNewValues.setNewPreferredFabrics)}
        onRemove={(index) => removeFromArray('preferred_fabrics', index)}
        maxItems={10}
      />

      <ArrayInputSection
        title="Style Personality"
        placeholder="Add a style..."
        values={preferences.style_personality || []}
        onAdd={(value) => addToArray('style_personality', value, setNewValues.setNewStylePersonality)}
        onRemove={(index) => removeFromArray('style_personality', index)}
        maxItems={5}
      />

      <ArrayInputSection
        title="Disliked Styles"
        placeholder="Add a style..."
        values={preferences.disliked_styles || []}
        onAdd={(value) => addToArray('disliked_styles', value, setNewValues.setNewDislikedStyles)}
        onRemove={(index) => removeFromArray('disliked_styles', index)}
        maxItems={8}
      />

      <ArrayInputSection
        title="Preferred Brands"
        placeholder="Add a brand..."
        values={preferences.preferred_brands || []}
        onAdd={(value) => addToArray('preferred_brands', value, setNewValues.setNewPreferredBrands)}
        onRemove={(index) => removeFromArray('preferred_brands', index)}
        maxItems={15}
      />

      <ArrayInputSection
        title="Preferred Retailers"
        placeholder="Add a retailer..."
        values={preferences.preferred_retailers || []}
        onAdd={(value) => addToArray('preferred_retailers', value, setNewValues.setNewPreferredRetailers)}
        onRemove={(index) => removeFromArray('preferred_retailers', index)}
        maxItems={10}
      />
    </div>
  );
};

export default StylePreferencesGrid;
