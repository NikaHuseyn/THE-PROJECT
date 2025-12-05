import React from 'react';

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

const SuggestionChips = ({ suggestions, onSelect }: SuggestionChipsProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion)}
          className="px-4 py-2 text-sm border border-border rounded-full text-foreground hover:bg-muted transition-colors"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

export default SuggestionChips;
