
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Camera } from 'lucide-react';

interface StyleProfile {
  analysis_image_url?: string;
  color_analysis?: any;
}

interface ColorAnalysisSectionProps {
  profile: StyleProfile | null;
  analysisImage: File | null;
  onAnalysisImageChange: (file: File | null) => void;
}

const ColorAnalysisSection = ({ profile, analysisImage, onAnalysisImageChange }: ColorAnalysisSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Color Analysis <span className="text-sm text-gray-500 font-normal">(Optional)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="analysis_image">Upload Photo for Analysis</Label>
            <Input
              id="analysis_image"
              type="file"
              accept="image/*"
              onChange={(e) => onAnalysisImageChange(e.target.files?.[0] || null)}
              className="mt-1"
            />
          </div>
          {profile?.analysis_image_url && (
            <div>
              <Label>Current Analysis Image</Label>
              <img
                src={profile.analysis_image_url}
                alt="Color analysis"
                className="mt-2 max-w-xs rounded-lg"
              />
            </div>
          )}
          {profile?.color_analysis && (
            <div>
              <Label>Analysis Results</Label>
              <Textarea
                value={JSON.stringify(profile.color_analysis, null, 2)}
                readOnly
                rows={6}
                className="mt-1 font-mono text-sm"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ColorAnalysisSection;
