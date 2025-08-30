
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Calendar } from 'lucide-react';

interface OutfitCardProps {
  outfit: {
    id: number;
    title: string;
    description: string;
    price: number;
    rentalPrice: number;
    image: string;
    brand: string;
    category: string;
  };
}

const OutfitCard = ({ outfit }: OutfitCardProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative h-80 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-24 h-24 bg-gradient-to-br from-rose-200 to-pink-300 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{outfit.category[0]}</span>
            </div>
            <p className="text-sm">{outfit.category} Style</p>
          </div>
        </div>
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
          {outfit.brand}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{outfit.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{outfit.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-gray-800">${outfit.price}</span>
            <span className="text-sm text-gray-500 ml-2">to buy</span>
          </div>
          <div className="text-right">
            <span className="text-lg font-semibold text-rose-600">${outfit.rentalPrice}</span>
            <span className="text-sm text-gray-500 block">to rent</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
            onClick={() => {
              window.open(`https://www.google.com/search?q=${encodeURIComponent(outfit.title + ' ' + outfit.brand + ' buy online')}`, '_blank');
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Buy
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 border-rose-300 text-rose-600 hover:bg-rose-50"
            onClick={() => {
              alert(`🎯 Rent ${outfit.title}\n\n📦 3-day rental for $${outfit.rentalPrice}\n📅 Perfect for: ${outfit.category} events\n🚚 Free delivery & pickup\n\nContact us to book this item!`);
            }}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Rent
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OutfitCard;
