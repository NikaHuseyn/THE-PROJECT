import React from 'react';
import { User, Sparkles, ExternalLink, ShoppingBag, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OutfitItem {
  name: string;
  reasoning?: string;
  source?: string;
  purchase_options?: {
    uk_retailers?: Array<{ store: string; url: string; price_range: string }>;
    rental_platforms?: Array<{ platform: string; url: string; price_range: string }>;
  };
}

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  recommendation?: any;
  isLoading?: boolean;
}

const ChatMessage = ({ role, content, recommendation, isLoading }: ChatMessageProps) => {
  const isUser = role === 'user';

  const renderOutfitItem = (category: string, item: OutfitItem | OutfitItem[]) => {
    if (Array.isArray(item)) {
      return (
        <div key={category} className="mb-4">
          <span className="text-sm font-medium text-muted-foreground capitalize">{category}</span>
          <div className="mt-1 space-y-2">
            {item.map((accessory, index) => (
              <div key={index} className="pl-4 border-l-2 border-border">
                <p className="text-foreground">{accessory.name}</p>
                {accessory.reasoning && (
                  <p className="text-sm text-muted-foreground mt-1">{accessory.reasoning}</p>
                )}
                {renderShoppingLinks(accessory.purchase_options)}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div key={category} className="mb-4">
        <span className="text-sm font-medium text-muted-foreground capitalize">{category}</span>
        <p className="text-foreground mt-1">{item.name}</p>
        {item.reasoning && (
          <p className="text-sm text-muted-foreground mt-1">{item.reasoning}</p>
        )}
        {renderShoppingLinks(item.purchase_options)}
      </div>
    );
  };

  const renderShoppingLinks = (options?: OutfitItem['purchase_options']) => {
    if (!options) return null;
    const hasLinks = (options.uk_retailers?.length || 0) > 0 || (options.rental_platforms?.length || 0) > 0;
    if (!hasLinks) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {options.uk_retailers?.slice(0, 2).map((retailer, idx) => (
          <Button key={idx} variant="outline" size="sm" className="text-xs h-7" asChild>
            <a href={retailer.url} target="_blank" rel="noopener noreferrer">
              <ShoppingBag className="h-3 w-3 mr-1" />
              {retailer.store} ({retailer.price_range})
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </Button>
        ))}
        {options.rental_platforms?.slice(0, 1).map((platform, idx) => (
          <Button key={idx} variant="outline" size="sm" className="text-xs h-7" asChild>
            <a href={platform.url} target="_blank" rel="noopener noreferrer">
              <Tag className="h-3 w-3 mr-1" />
              Rent: {platform.platform}
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </Button>
        ))}
      </div>
    );
  };

  const renderRecommendation = () => {
    if (!recommendation) return null;

    const items = recommendation.recommended_items;
    if (!items) return null;

    // Filter out non-outfit keys
    const outfitKeys = Object.keys(items).filter(
      key => !['character_suggestions', 'wardrobe_analysis'].includes(key)
    );

    return (
      <div className="mt-4 space-y-2">

        {/* Outfit items */}
        <div className="space-y-1">
          {outfitKeys.map(category => renderOutfitItem(category, items[category]))}
        </div>

        {/* Styling tips */}
        {recommendation.ai_insights?.styling_tips?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <span className="text-sm font-medium text-muted-foreground">Styling Tips</span>
            <ul className="mt-2 space-y-1">
              {recommendation.ai_insights.styling_tips.map((tip: string, idx: number) => (
                <li key={idx} className="text-sm text-foreground">• {tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Wardrobe analysis */}
        {recommendation.ai_insights?.wardrobe_analysis?.items_used?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <span className="text-sm font-medium text-muted-foreground">From Your Wardrobe</span>
            <ul className="mt-2 space-y-1">
              {recommendation.ai_insights.wardrobe_analysis.items_used.map((item: string, idx: number) => (
                <li key={idx} className="text-sm text-foreground">✓ {item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 py-6">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 pt-1">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-4 py-6 ${isUser ? '' : 'bg-muted/30'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-primary text-primary-foreground' : 'bg-primary/10'
      }`}>
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4 text-primary" />
        )}
      </div>
      <div className="flex-1 pt-1">
        <p className="text-foreground whitespace-pre-wrap">{content}</p>
        {renderRecommendation()}
      </div>
    </div>
  );
};

export default ChatMessage;
