
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Calendar, ExternalLink } from 'lucide-react';
import type { OutfitRecommendation } from '@/services/shoppingService';

interface UKBrandOutfitCardProps {
  outfit: OutfitRecommendation;
}

const UKBrandOutfitCard = ({ outfit }: UKBrandOutfitCardProps) => {
  const handleBuyOutfit = () => {
    // In a real implementation, this would add all items to cart
    console.log('Adding outfit to cart:', outfit);
    outfit.items.forEach(item => {
      window.open(item.retailerUrl, '_blank');
    });
  };

  const handleRentOutfit = () => {
    console.log('Renting outfit:', outfit);
    // This would integrate with rental service
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{outfit.title}</h3>
          <p className="text-gray-600 text-sm mb-2">{outfit.description}</p>
          <div className="flex items-center space-x-2 mb-3">
            <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-medium">
              {outfit.dressCode}
            </span>
            <span className="text-xs text-gray-500">
              {outfit.items.length} pieces
            </span>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <h4 className="font-medium text-gray-700 text-sm">Outfit includes:</h4>
          {outfit.items.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-600">{item.brand}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">£{item.price}</span>
                  {item.rentalPrice && (
                    <span className="text-xs text-green-600">or rent £{item.rentalPrice}</span>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(item.retailerUrl, '_blank')}
                className="text-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View
              </Button>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-2xl font-bold text-gray-800">£{outfit.totalPrice}</span>
              <span className="text-sm text-gray-500 ml-2">to buy all</span>
            </div>
            {outfit.totalRentalPrice > 0 && (
              <div className="text-right">
                <span className="text-lg font-semibold text-green-600">£{outfit.totalRentalPrice}</span>
                <span className="text-sm text-gray-500 block">to rent all</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
              onClick={handleBuyOutfit}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Buy Outfit
            </Button>
            {outfit.totalRentalPrice > 0 && (
              <Button 
                variant="outline" 
                className="flex-1 border-green-300 text-green-600 hover:bg-green-50"
                onClick={handleRentOutfit}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Rent Outfit
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UKBrandOutfitCard;
