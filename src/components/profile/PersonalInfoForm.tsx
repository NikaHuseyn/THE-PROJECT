
import React from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface PersonalInfoFormProps {
  profile: any;
  onUpdate: () => void;
}

const PersonalInfoForm = ({ profile, onUpdate }: PersonalInfoFormProps) => {
  const { toast } = useToast();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      display_name: profile?.display_name || '',
      profile_photo_url: profile?.profile_photo_url || '',
      height_cm: profile?.height_cm || '',
      weight_kg: profile?.weight_kg || '',
      face_shape: profile?.face_shape || '',
      skin_tone: profile?.skin_tone || '',
      body_type: profile?.body_type || '',
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const profileData = {
        user_id: user.id,
        ...data,
        height_cm: data.height_cm ? parseInt(data.height_cm) : null,
        weight_kg: data.weight_kg ? parseFloat(data.weight_kg) : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('user_style_profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Personal information updated successfully!",
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update personal information. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                {...register('display_name')}
                placeholder="How should we call you?"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="profile_photo_url">Profile Photo URL</Label>
              <Input
                id="profile_photo_url"
                type="url"
                {...register('profile_photo_url')}
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height_cm">Height (cm)</Label>
              <Input
                id="height_cm"
                type="number"
                {...register('height_cm')}
                placeholder="170"
                min="100"
                max="250"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight_kg">Weight (kg)</Label>
              <Input
                id="weight_kg"
                type="number"
                step="0.1"
                {...register('weight_kg')}
                placeholder="70.5"
                min="30"
                max="200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="face_shape">Face Shape</Label>
              <Input
                id="face_shape"
                {...register('face_shape')}
                placeholder="Round, Oval, Square, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skin_tone">Skin Tone</Label>
              <Input
                id="skin_tone"
                {...register('skin_tone')}
                placeholder="Warm, Cool, Neutral"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="body_type">Body Type</Label>
            <Input
              id="body_type"
              {...register('body_type')}
              placeholder="Apple, Pear, Hourglass, Rectangle, etc."
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Updating...' : 'Update Personal Information'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoForm;
