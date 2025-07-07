
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

interface ArrayInputSectionProps {
  title: string;
  placeholder: string;
  values: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  maxItems?: number;
  disabled?: boolean;
  className?: string;
}

const ArrayInputSection = ({ 
  title, 
  placeholder, 
  values = [],
  onAdd,
  onRemove,
  maxItems,
  disabled = false,
  className = ''
}: ArrayInputSectionProps) => {
  const [inputValue, setInputValue] = React.useState('');

  const handleAdd = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !values.includes(trimmedValue)) {
      if (!maxItems || values.length < maxItems) {
        onAdd(trimmedValue);
        setInputValue('');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const canAddMore = !maxItems || values.length < maxItems;
  const isAddDisabled = disabled || !inputValue.trim() || !canAddMore;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <Label>{title}</Label>
        {maxItems && (
          <span className="text-xs text-gray-500">
            {values.length}/{maxItems}
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-2 min-h-[2rem]">
        {values.map((item, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-2">
            {item}
            <button
              type="button"
              onClick={() => onRemove(index)}
              disabled={disabled}
              className="hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Remove ${item}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled || !canAddMore}
        />
        <Button
          type="button"
          onClick={handleAdd}
          disabled={isAddDisabled}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {maxItems && values.length >= maxItems && (
        <p className="text-xs text-amber-600">
          Maximum {maxItems} items allowed
        </p>
      )}
    </div>
  );
};

export default ArrayInputSection;
