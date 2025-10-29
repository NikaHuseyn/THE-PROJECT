import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, Eye, MapPin } from 'lucide-react';

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{trend.name}</DialogTitle>
        </DialogHeader>

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
                <Badge className="bg-amber-100 text-amber-800">
                  #{trend.popularity_rank}
                </Badge>
              </div>
            )}

            {/* Growth Rate */}
            {trend.growth_rate && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Growth Rate</p>
                <div className="flex items-center text-green-600 font-medium">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {trend.growth_rate}
                </div>
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
                  {trend.source}
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

          {/* Action Button */}
          <div className="flex justify-end pt-4">
            <Button className="bg-gradient-to-r from-rose-500 to-pink-600">
              Shop This Trend
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrendDetailDialog;
