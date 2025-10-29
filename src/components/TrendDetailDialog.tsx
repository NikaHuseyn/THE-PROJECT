import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Calendar, TrendingUp, Eye, MapPin, ExternalLink } from 'lucide-react';
import { useTrendProducts } from '@/hooks/useTrendProducts';
import { Skeleton } from '@/components/ui/skeleton';

interface TrendDetailDialogProps {
  trend: {
    id: string;
    name: string;
    category: string;
    trend_score: number;
    growth_rate: string | null;
    popularity_rank: number | null;
    season: string | null;
    occasions: string[];
    colors: string[];
    description: string | null;
    image_url: string | null;
    source: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TrendDetailDialog = ({ trend, open, onOpenChange }: TrendDetailDialogProps) => {
  const { products, isLoading: productsLoading } = useTrendProducts(
    trend?.name || '',
    trend?.category || '',
    trend?.colors || []
  );

  if (!trend) return null;

  const getTrendScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const handleShopClick = (url: string | null) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const formatSource = (source: string | null) => {
    if (!source) return null;
    // Simplify source names
    return source
      .replace('Pinterest Business API', 'Pinterest')
      .replace(/\s+API$/i, '');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{trend.name}</DialogTitle>
        </DialogHeader>

        <TooltipProvider>
          <div className="space-y-4">
          {/* Image */}
          {trend.image_url ? (
            <img
              src={trend.image_url}
              alt={trend.name}
              className="w-full aspect-video object-cover rounded-lg"
            />
          ) : (
            <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <Eye className="h-12 w-12 text-gray-400" />
            </div>
          )}

          {/* Description */}
          {trend.description && (
            <p className="text-gray-700">{trend.description}</p>
          )}

          {/* Metrics Section */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            {/* Trend Score */}
            <div>
              <p className="text-sm text-gray-500 mb-1">Trend Score</p>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTrendScoreBg(trend.trend_score)} ${getTrendScoreColor(trend.trend_score)}`}>
                {Math.round(trend.trend_score)}/100
              </div>
            </div>

            {/* Popularity Rank */}
            {trend.popularity_rank && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Popularity Rank</p>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <div className="inline-block">
                      <Badge className="bg-amber-100 text-amber-800 cursor-help">
                        #{trend.popularity_rank}
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Ranking among all current trends based on search volume, engagement, and social mentions. 
                      Lower numbers indicate higher popularity.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            {/* Growth Rate */}
            {trend.growth_rate && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Growth Rate</p>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center text-green-600 font-medium cursor-help">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {trend.growth_rate}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Trend growth rate compared to the previous month. 
                      Shows how quickly this trend is gaining or losing popularity.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            {/* Season */}
            {trend.season && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Season</p>
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-4 w-4 mr-1" />
                  {trend.season}
                </div>
              </div>
            )}

            {/* Source */}
            {trend.source && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Source</p>
                <div className="flex items-center text-gray-700">
                  <MapPin className="h-4 w-4 mr-1" />
                  {formatSource(trend.source)}
                </div>
              </div>
            )}

            {/* Category */}
            <div>
              <p className="text-sm text-gray-500 mb-1">Category</p>
              <Badge variant="outline">{trend.category}</Badge>
            </div>
          </div>

          {/* Occasions */}
          {trend.occasions.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Perfect for:</h4>
              <div className="flex flex-wrap gap-2">
                {trend.occasions.map((occasion, idx) => (
                  <Badge key={idx} variant="outline">
                    {occasion}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {trend.colors.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Trending Colors:</h4>
              <div className="flex flex-wrap gap-2">
                {trend.colors.map((color, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: color.toLowerCase() }}
                    />
                    <span className="text-sm text-gray-700">{color}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shopping Section */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-xl font-semibold mb-4">Shop This Trend</h3>
            
            {productsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-0">
                      <Skeleton className="aspect-square w-full" />
                      <div className="p-3 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="aspect-square bg-gray-100 overflow-hidden">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Eye className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="p-3 space-y-2">
                        <div>
                          <p className="font-medium text-sm line-clamp-2">{product.name}</p>
                          {product.brand && (
                            <p className="text-xs text-gray-500">{product.brand}</p>
                          )}
                        </div>
                        
                        {product.price && (
                          <p className="font-semibold text-sm">
                            £{product.price.toFixed(2)}
                          </p>
                        )}
                        
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => handleShopClick(product.affiliate_url || product.retailer_url)}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Shop Now
                        </Button>
                        
                        {product.retailer_name && (
                          <p className="text-xs text-gray-500 text-center">
                            at {product.retailer_name}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No products found for this trend yet.</p>
                <p className="text-sm mt-2">Check back soon for curated items!</p>
              </div>
            )}
          </div>
          </div>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
};

export default TrendDetailDialog;
