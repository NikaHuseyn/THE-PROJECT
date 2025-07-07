
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseStylePreferencesFormProps {
  profile: any;
  onUpdate: () => void;
}

export const useStylePreferencesForm = ({ profile, onUpdate }: UseStylePreferencesFormProps) => {
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
      const currentArray = watchedValues[fieldName as keyof typeof watchedValues] as string[] || [];
      if (!currentArray.includes(value.trim())) {
        setValue(fieldName as any, [...currentArray, value.trim()]);
        setState('');
      }
    }
  };

  const removeFromArray = (fieldName: string, index: number) => {
    const currentArray = watchedValues[fieldName as keyof typeof watchedValues] as string[] || [];
    setValue(fieldName as any, currentArray.filter((_, i) => i !== index));
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

  return {
    register,
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
  };
};
