
import React from 'react';
import ArrayInputSection from './ArrayInputSection';

interface StylePreferencesGridProps {
  watchedValues: any;
  newPreferredColor: string;
  setNewPreferredColor: (value: string) => void;
  newDislikedColor: string;
  setNewDislikedColor: (value: string) => void;
  newPreferredPattern: string;
  setNewPreferredPattern: (value: string) => void;
  newPreferredFabric: string;
  setNewPreferredFabric: (value: string) => void;
  newStylePersonality: string;
  setNewStylePersonality: (value: string) => void;
  newDislikedStyle: string;
  setNewDislikedStyle: (value: string) => void;
  newPreferredBrand: string;
  setNewPreferredBrand: (value: string) => void;
  newPreferredRetailer: string;
  setNewPreferredRetailer: (value: string) => void;
  addToArray: (fieldName: string, value: string, setState: (value: string) => void) => void;
  removeFromArray: (fieldName: string, index: number) => void;
}

const StylePreferencesGrid = ({
  watchedValues,
  newPreferredColor,
  setNewPreferredColor,
  newDislikedColor,
  setNewDislikedColor,
  newPreferredPattern,
  setNewPreferredPattern,
  newPreferredFabric,
  setNewPreferredFabric,
  newStylePersonality,
  setNewStylePersonality,
  newDislikedStyle,
  setNewDislikedStyle,
  newPreferredBrand,
  setNewPreferredBrand,
  newPreferredRetailer,
  setNewPreferredRetailer,
  addToArray,
  removeFromArray,
}: StylePreferencesGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ArrayInputSection
        title="Preferred Colors"
        placeholder="Add a color..."
        values={watchedValues.preferred_colors || []}
        onAdd={(value) => addToArray('preferred_colors', value, setNewPreferredColor)}
        onRemove={(index) => removeFromArray('preferred_colors', index)}
        maxItems={10}
      />

      <ArrayInputSection
        title="Disliked Colors"
        placeholder="Add a color..."
        values={watchedValues.disliked_colors || []}
        onAdd={(value) => addToArray('disliked_colors', value, setNewDislikedColor)}
        onRemove={(index) => removeFromArray('disliked_colors', index)}
        maxItems={10}
      />

      <ArrayInputSection
        title="Preferred Patterns"
        placeholder="Add a pattern..."
        values={watchedValues.preferred_patterns || []}
        onAdd={(value) => addToArray('preferred_patterns', value, setNewPreferredPattern)}
        onRemove={(index) => removeFromArray('preferred_patterns', index)}
        maxItems={8}
      />

      <ArrayInputSection
        title="Preferred Fabrics"
        placeholder="Add a fabric..."
        values={watchedValues.preferred_fabrics || []}
        onAdd={(value) => addToArray('preferred_fabrics', value, setNewPreferredFabric)}
        onRemove={(index) => removeFromArray('preferred_fabrics', index)}
        maxItems={10}
      />

      <ArrayInputSection
        title="Style Personality"
        placeholder="Add a style..."
        values={watchedValues.style_personality || []}
        onAdd={(value) => addToArray('style_personality', value, setNewStylePersonality)}
        onRemove={(index) => removeFromArray('style_personality', index)}
        maxItems={5}
      />

      <ArrayInputSection
        title="Disliked Styles"
        placeholder="Add a style..."
        values={watchedValues.disliked_styles || []}
        onAdd={(value) => addToArray('disliked_styles', value, setNewDislikedStyle)}
        onRemove={(index) => removeFromArray('disliked_styles', index)}
        maxItems={8}
      />

      <ArrayInputSection
        title="Preferred Brands"
        placeholder="Add a brand..."
        values={watchedValues.preferred_brands || []}
        onAdd={(value) => addToArray('preferred_brands', value, setNewPreferredBrand)}
        onRemove={(index) => removeFromArray('preferred_brands', index)}
        maxItems={15}
      />

      <ArrayInputSection
        title="Preferred Retailers"
        placeholder="Add a retailer..."
        values={watchedValues.preferred_retailers || []}
        onAdd={(value) => addToArray('preferred_retailers', value, setNewPreferredRetailer)}
        onRemove={(index) => removeFromArray('preferred_retailers', index)}
        maxItems={10}
      />
    </div>
  );
};

export default StylePreferencesGrid;
