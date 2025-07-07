
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface BudgetSectionProps {
  budgetRange: number[];
  setBudgetRange: (range: number[]) => void;
  confidenceScore: number[];
  setConfidenceScore: (score: number[]) => void;
}

const BudgetSection = ({ 
  budgetRange, 
  setBudgetRange, 
  confidenceScore, 
  setConfidenceScore 
}: BudgetSectionProps) => {
  return (
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
  );
};

export default BudgetSection;
