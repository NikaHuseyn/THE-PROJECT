
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStylePreferencesForm } from './forms/useStylePreferencesForm';
import StylePreferencesGrid from './forms/StylePreferencesGrid';
import BudgetSection from './forms/BudgetSection';

interface StylePreferencesFormProps {
  profile: any;
  onUpdate: () => void;
}

const StylePreferencesForm = ({ profile, onUpdate }: StylePreferencesFormProps) => {
  const {
    handleSubmit,
    isSubmitting,
    watchedValues,
    addToArray,
    removeFromArray,
    onSubmit,
    budgetRange,
    setBudgetRange,
    confidenceScore,
    setConfidenceScore,
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
  } = useStylePreferencesForm({ profile, onUpdate });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Style Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <StylePreferencesGrid
            watchedValues={watchedValues}
            addToArray={addToArray}
            removeFromArray={removeFromArray}
            newPreferredColor={newPreferredColor}
            setNewPreferredColor={setNewPreferredColor}
            newDislikedColor={newDislikedColor}
            setNewDislikedColor={setNewDislikedColor}
            newPreferredPattern={newPreferredPattern}
            setNewPreferredPattern={setNewPreferredPattern}
            newPreferredFabric={newPreferredFabric}
            setNewPreferredFabric={setNewPreferredFabric}
            newStylePersonality={newStylePersonality}
            setNewStylePersonality={setNewStylePersonality}
            newDislikedStyle={newDislikedStyle}
            setNewDislikedStyle={setNewDislikedStyle}
            newPreferredBrand={newPreferredBrand}
            setNewPreferredBrand={setNewPreferredBrand}
            newPreferredRetailer={newPreferredRetailer}
            setNewPreferredRetailer={setNewPreferredRetailer}
          />

          <BudgetSection
            budgetRange={budgetRange}
            setBudgetRange={setBudgetRange}
            confidenceScore={confidenceScore}
            setConfidenceScore={setConfidenceScore}
          />

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Updating...' : 'Update Style Preferences'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StylePreferencesForm;
