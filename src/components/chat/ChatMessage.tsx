import React from 'react';
import { User, Sparkles, ExternalLink, ShoppingBag, Tag, MapPin, Ticket } from 'lucide-react';
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
  venueContext?: any;
  eventContext?: any;
  isLoading?: boolean;
}

const ChatMessage = ({ role, content, recommendation, venueContext, eventContext, isLoading }: ChatMessageProps) => {
  const isUser = role === 'user';

  const renderOutfitItem = (item: OutfitItem, index: number) => {
    return (
      <div key={index} className="mb-3 pl-4 border-l-2 border-border">
        <p className="text-foreground font-medium">{item.name}</p>
        {item.reasoning && (
          <p className="text-sm text-muted-foreground mt-1">{item.reasoning}</p>
        )}
        {renderShoppingLinks(item.purchase_options)}
      </div>
    );
  };

  const flattenItems = (items: Record<string, OutfitItem | OutfitItem[]>): OutfitItem[] => {
    const result: OutfitItem[] = [];
    const excludeKeys = ['character_suggestions', 'wardrobe_analysis'];
    
    Object.entries(items).forEach(([key, value]) => {
      if (excludeKeys.includes(key)) return;
      if (Array.isArray(value)) {
        result.push(...value);
      } else if (value && typeof value === 'object' && 'name' in value) {
        result.push(value);
      }
    });
    return result;
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

    const flatItems = flattenItems(items);

    return (
      <div className="mt-4 space-y-2">
        {/* Outfit items */}
        <div className="space-y-1">
          {flatItems.map((item, idx) => renderOutfitItem(item, idx))}
        </div>

        {/* Missing items - retailer results */}
        {recommendation.missing_items?.length > 0 && recommendation.missing_items.some((m: any) => m.retailer_results?.length > 0) && (
          <div className="mt-4 pt-4 border-t border-border">
            <span className="text-sm font-medium text-muted-foreground">🛍️ Shop Missing Items</span>
            {recommendation.missing_items.filter((m: any) => m.retailer_results?.length > 0).map((missing: any, mIdx: number) => (
              <div key={mIdx} className="mt-3">
                <p className="text-sm font-medium text-foreground">{missing.item_type}</p>
                <p className="text-xs text-muted-foreground mb-2">{missing.style_descriptor} · {missing.occasion_suitability}</p>
                <div className="grid gap-2">
                  {missing.retailer_results.map((product: any, pIdx: number) => (
                    <a
                      key={pIdx}
                      href={product.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-border bg-card p-2 hover:bg-accent/50 transition-colors"
                    >
                      {product.image_url && (
                        <img src={product.image_url} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{product.product_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{product.retailer}</span>
                          {product.price && <span className="font-medium text-foreground">{product.price}</span>}
                        </div>
                      </div>
                      <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

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
        {!isUser && (venueContext?.source === 'scraped' || eventContext?.source === 'scraped') && (
          <div className="flex flex-col gap-2 mb-3">
            {venueContext?.source === 'scraped' && (
              <div className="flex items-start gap-2 rounded-lg bg-accent/50 border border-border px-3 py-2 text-sm">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">
                  <span className="font-medium">{venueContext.venue_name}</span>
                  {venueContext.dress_code && venueContext.dress_code !== 'none_specified' && (
                    <span className="text-muted-foreground"> — {venueContext.dress_code_details || venueContext.dress_code}{venueContext.atmosphere ? `, ${venueContext.atmosphere.toLowerCase()}` : ''}</span>
                  )}
                </span>
              </div>
            )}
            {eventContext?.source === 'scraped' && (
              <div className="flex items-start gap-2 rounded-lg bg-accent/50 border border-border px-3 py-2 text-sm">
                <Ticket className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">
                  <span className="font-medium">{eventContext.event_name}</span>
                  <span className="text-muted-foreground"> — {
                    eventContext.dress_code && eventContext.dress_code !== 'none_specified'
                      ? (eventContext.dress_code_details || eventContext.dress_code)
                      : eventContext.style_guidance
                        ? eventContext.style_guidance
                        : eventContext.indoor_outdoor && eventContext.indoor_outdoor !== 'unknown'
                          ? `${eventContext.indoor_outdoor} event${eventContext.time_of_day && eventContext.time_of_day !== 'unknown' ? `, ${eventContext.time_of_day}` : ''}`
                          : 'Event details found'
                  }</span>
                </span>
              </div>
            )}
          </div>
        )}
        <p className="text-foreground whitespace-pre-wrap">{content}</p>
        {renderRecommendation()}
      </div>
    </div>
  );
};

export default ChatMessage;
