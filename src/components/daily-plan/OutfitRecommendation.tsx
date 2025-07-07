
import React from 'react';
import { Shirt, Footprints, Watch, Palette } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OutfitRecommendationProps {
  recommendation: {
    top: string;
    bottom: string;
    shoes: string;
    accessories: string[];
    colors: string[];
    notes: string;
  };
}

const OutfitRecommendation = ({ recommendation }: OutfitRecommendationProps) => {
  return (
    <div className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
      <div className="flex items-center mb-4">
        <Shirt className="h-5 w-5 text-indigo-600 mr-2" />
        <h4 className="text-lg font-semibold text-gray-800">Your AI-Styled Outfit</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Shirt className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h5 className="font-medium text-gray-800 mb-1">Top</h5>
              <p className="text-sm text-gray-600">{recommendation.top}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="h-5 w-5 bg-gray-600 rounded mt-1 flex-shrink-0"></div>
            <div>
              <h5 className="font-medium text-gray-800 mb-1">Bottom</h5>
              <p className="text-sm text-gray-600">{recommendation.bottom}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Footprints className="h-5 w-5 text-brown-600 mt-1 flex-shrink-0" />
            <div>
              <h5 className="font-medium text-gray-800 mb-1">Shoes</h5>
              <p className="text-sm text-gray-600">{recommendation.shoes}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Watch className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0" />
            <div>
              <h5 className="font-medium text-gray-800 mb-1">Accessories</h5>
              <div className="flex flex-wrap gap-1">
                {recommendation.accessories.map((accessory, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {accessory}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Palette className="h-5 w-5 text-pink-600 mt-1 flex-shrink-0" />
            <div>
              <h5 className="font-medium text-gray-800 mb-1">Color Palette</h5>
              <div className="flex flex-wrap gap-1">
                {recommendation.colors.map((color, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {recommendation.notes && (
        <div className="mt-4 p-4 bg-white/50 rounded-lg border border-white/50">
          <h5 className="font-medium text-gray-800 mb-2">Styling Notes</h5>
          <p className="text-sm text-gray-600 leading-relaxed">{recommendation.notes}</p>
        </div>
      )}
    </div>
  );
};

export default OutfitRecommendation;
