import React, { useState } from 'react';
import { ShoppingBag, Tag, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MissingItem {
  item_type: string;
  style_descriptor: string;
  occasion_suitability: string;
  price_tier: string;
  retailer_results?: Array<{
    retailer: string;
    product_name: string;
    price: string | null;
    product_url: string;
    image_url: string | null;
  }>;
  rental_results?: Array<{
    platform: string;
    product_name: string;
    rental_price: string | null;
    product_url: string;
    image_url: string | null;
  }>;
}

interface CompleteYourLookProps {
  missingItems: MissingItem[];
}

const MissingItemCard = ({ item }: { item: MissingItem }) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'rent'>('buy');
  const hasBuy = (item.retailer_results?.length || 0) > 0;
  const hasRent = (item.rental_results?.length || 0) > 0;

  if (!hasBuy && !hasRent) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Item header */}
      <div className="px-4 pt-4 pb-3">
        <h4 className="text-sm font-semibold text-foreground">{item.item_type}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          {item.style_descriptor} · {item.occasion_suitability}
        </p>
      </div>

      {/* Tabs */}
      {(hasBuy && hasRent) && (
        <div className="flex border-b border-border mx-4">
          <button
            onClick={() => setActiveTab('buy')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'buy'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShoppingBag className="h-3 w-3" />
            Buy
          </button>
          <button
            onClick={() => setActiveTab('rent')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'rent'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Tag className="h-3 w-3" />
            Rent
          </button>
        </div>
      )}

      {/* Product cards */}
      <div className="p-3 space-y-2">
        {activeTab === 'buy' && hasBuy && item.retailer_results!.map((product, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 rounded-lg border border-border/60 bg-background p-2.5"
          >
            {product.image_url && (
              <img
                src={product.image_url}
                alt=""
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-muted"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug">
                {product.product_name}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[11px] text-muted-foreground">{product.retailer}</span>
                {product.price && (
                  <span className="text-xs font-semibold text-foreground">{product.price}</span>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-xs flex-shrink-0" asChild>
              <a href={product.product_url} target="_blank" rel="noopener noreferrer">
                View
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          </div>
        ))}

        {activeTab === 'rent' && hasRent && item.rental_results!.map((rental, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 rounded-lg border border-border/60 bg-background p-2.5"
          >
            {rental.image_url && (
              <img
                src={rental.image_url}
                alt=""
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-muted"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug">
                {rental.product_name}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[11px] text-muted-foreground">{rental.platform}</span>
                {rental.rental_price && (
                  <span className="text-xs font-semibold text-foreground">{rental.rental_price}</span>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-xs flex-shrink-0" asChild>
              <a href={rental.product_url} target="_blank" rel="noopener noreferrer">
                View
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          </div>
        ))}

        {/* If only one type exists, show it without tabs */}
        {!hasBuy && hasRent && activeTab === 'buy' && setActiveTab('rent') as unknown as null}
        {hasBuy && !hasRent && activeTab === 'rent' && setActiveTab('buy') as unknown as null}
      </div>
    </div>
  );
};

const CompleteYourLook = ({ missingItems }: CompleteYourLookProps) => {
  const itemsWithResults = missingItems.filter(
    (m) => (m.retailer_results?.length || 0) > 0 || (m.rental_results?.length || 0) > 0
  );

  if (itemsWithResults.length === 0) return null;

  return (
    <div className="mt-5 pt-5 border-t border-border">
      <div className="flex items-center gap-2 mb-3">
        <ShoppingBag className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Complete Your Look</h3>
      </div>
      <div className="space-y-3">
        {itemsWithResults.map((item, idx) => (
          <MissingItemCard key={idx} item={item} />
        ))}
      </div>
    </div>
  );
};

export default CompleteYourLook;
