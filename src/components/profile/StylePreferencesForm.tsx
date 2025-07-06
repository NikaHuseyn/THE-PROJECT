
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StylePreferencesFormProps {
  profile: any;
  onUpdate: () => void;
}

const StylePreferencesForm = ({ profile, onUpdate }: StylePreferencesFormProps) => {
  const { toast } = useToast();
  const [newPreferredColor, setNewPreferredColor] = useState('');
  const [newDislikedColor, setNewDislikedColor] = useState('');
  const [newPreferredPattern, setNewPreferredPattern] = useState('');
  const [newPreferredFabric, setNewPreferredFabric] = useState('');
  const [newStylePersonality, setNewStylePersonality] = useState('');
  const [newDislikedStyle, setNewDislikedStyle] = useState('');
  const [newPreferredBrand, setNewPreferredBrand] = useState('');
  const [newPreferredRetailer, setNewPreferredRetailer] = useState('');
  const [budgetRange, setBudgetRange] = useState([
    profile?.budget_min || 0,
    profile?.budget_max || 1000
  ]);
  const [confidenceScore, setConfidenceScore] = useState([
    (profile?.style_confidence_score || 0.5) * 100
  ]);

  const { register, handleSubmit, formState: { isSubmitting }, watch, setValue } = useForm({
    defaultValues: {
      preferred_colors: profile?.preferred_colors || [],
      disliked_colors: profile?.disliked_colors || [],
      preferred_patterns: profile?.preferred_patterns || [],
      preferred_fabrics: profile?.preferred_fabrics || [],
      style_personality: profile?.style_personality || [],
      disliked_styles: profile?.disliked_styles || [],
      preferred_brands: profile?.preferred_brands || [],
      preferred_retailers: profile?.preferred_retailers || [],
      budget_min: profile?.budget_min || 0,
      budget_max: profile?.budget_max || 1000,
      style_confidence_score: profile?.style_confidence_score || 0.5,
    }
  });

  const watchedValues = watch();

  const addToArray = (fieldName: string, value: string, setState: (value: string) => void) => {
    if (value.trim()) {
      const currentArray = watchedValues[fieldName] || [];
      if (!currentArray.includes(value.trim())) {
        setValue(fieldName, [...currentArray, value.trim()]);
        setState('');
      }
    }
  };

  const removeFromArray = (fieldName: string, index: number) => {
    const currentArray = watchedValues[fieldName] || [];
    setValue(fieldName, currentArray.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const profileData = {
        user_id: user.id,
        ...data,
        budget_min: budgetRange[0],
        budget_max: budgetRange[1],
        style_confidence_score: confidenceScore[0] / 100,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('user_style_profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Style preferences updated successfully!",
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update style preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  const ArrayInputSection = ({ 
    title, 
    fieldName, 
    placeholder, 
    newValue, 
    setNewValue, 
    values 
  }: {
    title: string;
    fieldName: string;
    placeholder: string;
    newValue: string;
    setNewValue: (value: string) => void;
    values: string[];
  }) => (
    <div className="space-y-3">
      <Label>{title}</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {values?.map((item, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-2">
            {item}
            <button
              type="button"
              onClick={() => removeFromArray(fieldName, index)}
              className="hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addToArray(fieldName, newValue, setNewValue);
            }
          }}
        />
        <Button
          type="button"
          onClick={() => addToArray(fieldName, newValue, setNewValue)}
          disabled={!newValue.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Style Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ArrayInputSection
              title="Preferred Colors"
              fieldName="preferred_colors"
              placeholder="Add a color you love"
              newValue={newPreferredColor}
              setNewValue={setNewPreferredColor}
              values={watchedValues.preferred_colors}
            />

            <ArrayInputSection
              title="Disliked Colors"
              fieldName="disliked_colors"
              placeholder="Add a color you avoid"
              newValue={newDislikedColor}
              setNewValue={setNewDislikedColor}
              values={watchedValues.disliked_colors}
            />

            <ArrayInputSection
              title="Preferred Patterns"
              fieldName="preferred_patterns"
              placeholder="e.g., Stripes, Floral, Geometric"
              newValue={newPreferredPattern}
              setNewValue={setNewPreferredPattern}
              values={watchedValues.preferred_patterns}
            />

            <ArrayInputSection
              title="Preferred Fabrics"
              fieldName="preferred_fabrics"
              placeholder="e.g., Cotton, Silk, Denim"
              newValue={newPreferredFabric}
              setNewValue={setNewPreferredFabric}
              values={watchedValues.preferred_fabrics}
            />

            <ArrayInputSection
              title="Style Personality"
              fieldName="style_personality"
              placeholder="e.g., Minimalist, Bohemian, Classic"
              newValue={newStylePersonality}
              setNewValue={setNewStylePersonality}
              values={watchedValues.style_personality}
            />

            <ArrayInputSection
              title="Disliked Styles"
              fieldName="disliked_styles"
              placeholder="Styles you prefer to avoid"
              newValue={newDislikedStyle}
              setNewValue={setNewDislikedStyle}
              values={watchedValues.disliked_styles}
            />

            <ArrayInputSection
              title="Preferred Brands"
              fieldName="preferred_brands"
              placeholder="Your favorite fashion brands"
              newValue={newPreferredBrand}
              setNewValue={setNewPreferredBrand}
              values={watchedValues.preferred_brands}
            />

            <ArrayInputSection
              title="Preferred Retailers"
              fieldName="preferred_retailers"
              placeholder="Where you like to shop"
              newValue={newPreferredRetailer}
              setNewValue={setNewPreferredRetailer}
              values={watchedValues.preferred_retailers}
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Budget Range (${budgetRange[0]} - ${budgetRange[1]})</Label>
              <Slider
                value={budgetRange}
                onValueChange={setBudgetRange}
                max={5000}
                min={0}
                step={50}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <Label>Style Confidence ({confidenceScore[0]}%)</Label>
              <Slider
                value={confidenceScore}
                onValueChange={setConfidenceScore}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Updating...' : 'Update Style Preferences'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StylePreferencesForm;
