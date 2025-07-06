
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

interface ArrayInputFieldProps {
  label: string;
  items: string[] | undefined;
  placeholder: string;
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
}

const ArrayInputField = ({ label, items, placeholder, onAdd, onRemove }: ArrayInputFieldProps) => {
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (newItem.trim()) {
      onAdd(newItem.trim());
      setNewItem('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div>
      <Label className="text-base font-semibold">{label}</Label>
      <div className="flex flex-wrap gap-2 mt-2 mb-3">
        {items?.map((item, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-2">
            {item}
            <button
              onClick={() => onRemove(index)}
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
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button
          onClick={handleAdd}
          disabled={!newItem.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ArrayInputField;
