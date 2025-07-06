
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { User, HelpCircle } from 'lucide-react';

interface StyleProfile {
  body_type?: string;
  style_confidence_score?: number;
}

interface BasicInfoSectionProps {
  profile: StyleProfile | null;
  onProfileChange: (updates: Partial<StyleProfile>) => void;
}

const BasicInfoSection = ({ profile, onProfileChange }: BasicInfoSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Basic Information <span className="text-sm text-gray-500 font-normal">(Optional)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="body_type">Body Type</Label>
            <Input
              id="body_type"
              value={profile?.body_type || ''}
              onChange={(e) => onProfileChange({ body_type: e.target.value })}
              placeholder="e.g., Apple, Pear, Hourglass"
            />
          </div>
          <div>
            <TooltipProvider>
              <div className="flex items-center gap-2">
                <Label htmlFor="style_confidence">Style Confidence (1-10)</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Style confidence refers to how comfortable and confident you feel about your personal style and fashion choices. It's a self-assessment score that helps the AI understand your current relationship with fashion and styling.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
            <Input
              id="style_confidence"
              type="number"
              min="1"
              max="10"
              value={profile?.style_confidence_score || ''}
              onChange={(e) => onProfileChange({ style_confidence_score: Number(e.target.value) })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfoSection;
