
import React from 'react';
import ArrayInputSection from './ArrayInputSection';

interface StylePreferencesGridProps {
  watchedValues: any;
  addToArray: (fieldName: string, value: string, setState: (value: string) => void) => void;
  removeFromArray: (fieldName: string, index: number) => void;
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
}

const StylePreferencesGrid = ({
  watchedValues,
  addToArray,
  removeFromArray,
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
}: StylePreferencesGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <ArrayInputSection
        title="Preferred Colors"
        fieldName="preferred_colors"
        placeholder="Add a color you love"
        newValue={newPreferredColor}
        setNewValue={setNewPreferredColor}
        values={watchedValues.preferred_colors}
        addToArray={addToArray}
        removeFromArray={removeFromArray}
      />

      <ArrayInputSection
        title="Disliked Colors"
        fieldName="disliked_colors"
        placeholder="Add a color you avoid"
        newValue={newDislikedColor}
        setNewValue={setNewDislikedColor}
        values={watchedValues.disliked_colors}
        addToArray={addToArray}
        removeFromArray={removeFromArray}
      />

      <ArrayInputSection
        title="Preferred Patterns"
        fieldName="preferred_patterns"
        placeholder="e.g., Stripes, Floral, Geometric"
        newValue={newPreferredPattern}
        setNewValue={setNewPreferredPattern}
        values={watchedValues.preferred_patterns}
        addToArray={addToArray}
        removeFromArray={removeFromArray}
      />

      <ArrayInputSection
        title="Preferred Fabrics"
        fieldName="preferred_fabrics"
        placeholder="e.g., Cotton, Silk, Denim"
        newValue={newPreferredFabric}
        setNewValue={setNewPreferredFabric}
        values={watchedValues.preferred_fabrics}
        addToArray={addToArray}
        removeFromArray={removeFromArray}
      />

      <ArrayInputSection
        title="Style Personality"
        fieldName="style_personality"
        placeholder="e.g., Minimalist, Bohemian, Classic"
        newValue={newStylePersonality}
        setNewValue={setNewStylePersonality}
        values={watchedValues.style_personality}
        addToArray={addToArray}
        removeFromArray={removeFromArray}
      />

      <ArrayInputSection
        title="Disliked Styles"
        fieldName="disliked_styles"
        placeholder="Styles you prefer to avoid"
        newValue={newDislikedStyle}
        setNewValue={setNewDislikedStyle}
        values={watchedValues.disliked_styles}
        addToArray={addToArray}
        removeFromArray={removeFromArray}
      />

      <ArrayInputSection
        title="Preferred Brands"
        fieldName="preferred_brands"
        placeholder="Your favorite fashion brands"
        newValue={newPreferredBrand}
        setNewValue={setNewPreferredBrand}
        values={watchedValues.preferred_brands}
        addToArray={addToArray}
        removeFromArray={removeFromArray}
      />

      <ArrayInputSection
        title="Preferred Retailers"
        fieldName="preferred_retailers"
        placeholder="Where you like to shop"
        newValue={newPreferredRetailer}
        setNewValue={setNewPreferredRetailer}
        values={watchedValues.preferred_retailers}
        addToArray={addToArray}
        removeFromArray={removeFromArray}
      />
    </div>
  );
};

export default StylePreferencesGrid;
