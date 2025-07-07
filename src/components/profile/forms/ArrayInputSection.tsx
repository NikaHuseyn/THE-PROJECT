
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

interface ArrayInputSectionProps {
  title: string;
  fieldName: string;
  placeholder: string;
  newValue: string;
  setNewValue: (value: string) => void;
  values: string[];
  addToArray: (fieldName: string, value: string, setState: (value: string) => void) => void;
  removeFromArray: (fieldName: string, index: number) => void;
}

const ArrayInputSection = ({ 
  title, 
  fieldName, 
  placeholder, 
  newValue, 
  setNewValue, 
  values,
  addToArray,
  removeFromArray
}: ArrayInputSectionProps) => (
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

export default ArrayInputSection;
