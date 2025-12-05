
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Calendar, ExternalLink, Clock } from 'lucide-react';
import type { OutfitRecommendation } from '@/services/shoppingService';

interface UKBrandOutfitCardProps {
  outfit: OutfitRecommendation;
  occasion?: string;
}

// Check if occasion is historical/themed
const isHistoricalEvent = (occasion?: string): boolean => {
  if (!occasion) return false;
  const lowerOccasion = occasion.toLowerCase();
  return /(1920|1930|1940|victorian|edwardian|regency|vintage|period|gatsby|flapper|wartime|art deco)/.test(lowerOccasion);
};

const UKBrandOutfitCard = ({ outfit, occasion }: UKBrandOutfitCardProps) => {
  const isHistorical = isHistoricalEvent(occasion);

  // For historical events, show vintage/costume sources instead
  if (isHistorical) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg overflow-hidden border border-amber-200">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-amber-900">Period Costume Sources</h3>
          </div>
          <p className="text-sm text-amber-700 mb-4">
            For historical events, we recommend these specialist UK sources for authentic period pieces:
          </p>
          
          <div className="space-y-3">
            <div className="bg-white/60 rounded-lg p-3">
              <h4 className="font-medium text-amber-900 text-sm mb-2">🎭 Costume Rental</h4>
              <div className="space-y-2">
                <a href="https://www.fancydress.com" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center justify-between text-sm hover:bg-amber-100 p-2 rounded transition-colors">
                  <span className="text-gray-700">Angels Fancy Dress</span>
                  <ExternalLink className="h-3 w-3 text-amber-600" />
                </a>
                <a href="https://www.escapade.co.uk" target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-between text-sm hover:bg-amber-100 p-2 rounded transition-colors">
                  <span className="text-gray-700">Escapade</span>
                  <ExternalLink className="h-3 w-3 text-amber-600" />
                </a>
              </div>
            </div>
            
            <div className="bg-white/60 rounded-lg p-3">
              <h4 className="font-medium text-amber-900 text-sm mb-2">👗 Vintage Shops</h4>
              <div className="space-y-2">
                <a href="https://www.beyondretro.com" target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-between text-sm hover:bg-amber-100 p-2 rounded transition-colors">
                  <span className="text-gray-700">Beyond Retro</span>
                  <ExternalLink className="h-3 w-3 text-amber-600" />
                </a>
                <a href="https://www.rokit.co.uk" target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-between text-sm hover:bg-amber-100 p-2 rounded transition-colors">
                  <span className="text-gray-700">Rokit Vintage</span>
                  <ExternalLink className="h-3 w-3 text-amber-600" />
                </a>
                <a href="https://www.etsy.com/uk/c/vintage" target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-between text-sm hover:bg-amber-100 p-2 rounded transition-colors">
                  <span className="text-gray-700">Etsy UK Vintage</span>
                  <ExternalLink className="h-3 w-3 text-amber-600" />
                </a>
              </div>
            </div>

            <div className="bg-white/60 rounded-lg p-3">
              <h4 className="font-medium text-amber-900 text-sm mb-2">💎 Luxury Period Rental</h4>
              <div className="space-y-2">
                <a href="https://www.hurrcollective.com" target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-between text-sm hover:bg-amber-100 p-2 rounded transition-colors">
                  <span className="text-gray-700">HURR Collective</span>
                  <ExternalLink className="h-3 w-3 text-amber-600" />
                </a>
                <a href="https://www.byrotation.com" target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-between text-sm hover:bg-amber-100 p-2 rounded transition-colors">
                  <span className="text-gray-700">By Rotation</span>
                  <ExternalLink className="h-3 w-3 text-amber-600" />
                </a>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-amber-600 mt-4 italic">
            Search for your specific era (e.g., "1930s dress") on these platforms for authentic pieces.
          </p>
        </div>
      </div>
    );
  }

  const handleBuyOutfit = () => {
    console.log('Adding outfit to cart:', outfit);
    outfit.items.forEach(item => {
      window.open(item.link, '_blank');
    });
  };

  const handleRentOutfit = () => {
    console.log('Renting outfit:', outfit);
    alert(`🎯 Rent Complete Outfit\n\n📦 ${outfit.items[0]?.rental?.duration || '4-day'} rental for £${outfit.totalRentalPrice}\n📅 Perfect for: ${outfit.dressCode} events\n\nIncludes:\n${outfit.items.map(item => `• ${item.name} (${item.brand})`).join('\n')}\n\n🚚 Free delivery & pickup\n📞 Contact us to book this complete look!`);
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
            {outfit.confidence_score && (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                {outfit.confidence_score}% match
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <h4 className="font-medium text-gray-700 text-sm">Outfit includes:</h4>
          {outfit.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-600">{item.brand}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">£{item.price}</span>
                  {item.rental && (
                    <span className="text-xs text-green-600">or rent £{item.rental.price}</span>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(item.link, '_blank')}
                className="text-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View
              </Button>
            </div>
          ))}
        </div>

        {outfit.styling_tips && outfit.styling_tips.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-sm text-blue-900 mb-2">💡 Styling Tips</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              {outfit.styling_tips.slice(0, 2).map((tip, index) => (
                <li key={index}>• {tip}</li>
              ))}
            </ul>
          </div>
        )}
        
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
