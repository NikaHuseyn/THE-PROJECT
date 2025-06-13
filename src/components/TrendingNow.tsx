
import React from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, ShoppingCart, Heart, Star } from 'lucide-react';

const TrendingNow = () => {
  const trendingItems = [
    {
      id: 1,
      name: "Classic Silk Blouse",
      brand: "Everlane",
      price: 118,
      originalPrice: 145,
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop",
      rating: 4.8,
      reviews: 234,
      outfitCompatibility: ["Business", "Casual", "Date Night"],
      trending: true,
      colors: ["White", "Navy", "Blush"]
    },
    {
      id: 2,
      name: "High-Waisted Trousers",
      brand: "& Other Stories",
      price: 89,
      originalPrice: 120,
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop",
      rating: 4.6,
      reviews: 156,
      outfitCompatibility: ["Business", "Smart Casual", "Evening"],
      trending: true,
      colors: ["Black", "Camel", "Navy"]
    },
    {
      id: 3,
      name: "Minimalist Blazer",
      brand: "COS",
      price: 225,
      originalPrice: 280,
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop",
      rating: 4.9,
      reviews: 89,
      outfitCompatibility: ["Business", "Smart Casual", "Date Night"],
      trending: true,
      colors: ["Black", "Beige", "Charcoal"]
    },
    {
      id: 4,
      name: "Midi Wrap Dress",
      brand: "Ganni",
      price: 195,
      originalPrice: 245,
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop",
      rating: 4.7,
      reviews: 178,
      outfitCompatibility: ["Casual", "Date Night", "Brunch"],
      trending: true,
      colors: ["Floral", "Solid Black", "Navy"]
    },
    {
      id: 5,
      name: "Statement Earrings",
      brand: "Mejuri",
      price: 78,
      originalPrice: 95,
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop",
      rating: 4.8,
      reviews: 267,
      outfitCompatibility: ["Business", "Date Night", "Evening"],
      trending: true,
      colors: ["Gold", "Silver", "Rose Gold"]
    },
    {
      id: 6,
      name: "Versatile Ankle Boots",
      brand: "Veja",
      price: 165,
      originalPrice: 200,
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop",
      rating: 4.6,
      reviews: 143,
      outfitCompatibility: ["Casual", "Smart Casual", "Weekend"],
      trending: true,
      colors: ["Black", "Brown", "White"]
    }
  ];

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-amber-600" />
            Trending Now
          </h3>
          <p className="text-gray-600">
            Popular pieces from our partner brands that work with multiple outfits
          </p>
        </div>
        <Button 
          variant="outline" 
          className="border-amber-300 text-amber-700 hover:bg-amber-50"
        >
          View All Trends
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trendingItems.map((item) => (
          <div 
            key={item.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group border border-amber-100"
          >
            <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
              {/* Placeholder for product image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{item.name[0]}</span>
                  </div>
                  <p className="text-xs">{item.name}</p>
                </div>
              </div>
              
              <div className="absolute top-3 left-3 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </div>
              
              <div className="absolute top-3 right-3">
                <button className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <Heart className="h-4 w-4 text-gray-600 hover:text-rose-500" />
                </button>
              </div>

              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                {item.brand}
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-800 text-sm leading-tight">{item.name}</h4>
                <div className="flex items-center text-xs text-amber-600 ml-2">
                  <Star className="h-3 w-3 fill-current mr-1" />
                  {item.rating}
                </div>
              </div>

              <div className="flex items-center mb-3">
                <span className="text-lg font-bold text-gray-800">${item.price}</span>
                <span className="text-sm text-gray-500 line-through ml-2">${item.originalPrice}</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full ml-2">
                  {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% off
                </span>
              </div>

              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Works with:</p>
                <div className="flex flex-wrap gap-1">
                  {item.outfitCompatibility.slice(0, 3).map((style, index) => (
                    <span 
                      key={index}
                      className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Available colors:</p>
                <div className="flex space-x-1">
                  {item.colors.slice(0, 3).map((color, index) => (
                    <div 
                      key={index}
                      className="w-4 h-4 rounded-full border-2 border-gray-200"
                      style={{ 
                        backgroundColor: color.toLowerCase() === 'white' ? '#ffffff' : 
                                       color.toLowerCase() === 'black' ? '#000000' :
                                       color.toLowerCase() === 'navy' ? '#1e3a8a' :
                                       color.toLowerCase() === 'beige' ? '#f5f5dc' :
                                       color.toLowerCase() === 'camel' ? '#c19a6b' :
                                       color.toLowerCase() === 'blush' ? '#ffc0cb' :
                                       color.toLowerCase() === 'charcoal' ? '#36454f' :
                                       color.toLowerCase() === 'brown' ? '#8b4513' :
                                       color.toLowerCase() === 'gold' ? '#ffd700' :
                                       color.toLowerCase() === 'silver' ? '#c0c0c0' :
                                       color.toLowerCase() === 'rose gold' ? '#e8b4a0' :
                                       '#ddd' 
                      }}
                    />
                  ))}
                  {item.colors.length > 3 && (
                    <span className="text-xs text-gray-500 ml-1">+{item.colors.length - 3}</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs"
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Add to Cart
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-amber-300 text-amber-700 hover:bg-amber-50 text-xs"
                >
                  Quick View
                </Button>
              </div>

              <div className="mt-2 text-center">
                <span className="text-xs text-gray-500">{item.reviews} reviews</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-amber-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Partner Brand Spotlight</h4>
          <p className="text-gray-600 text-sm mb-4">
            Discover exclusive pieces from our curated selection of sustainable and ethical fashion brands
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-600">
            <span className="font-medium">Everlane</span>
            <span className="font-medium">& Other Stories</span>
            <span className="font-medium">COS</span>
            <span className="font-medium">Ganni</span>
            <span className="font-medium">Mejuri</span>
            <span className="font-medium">Veja</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingNow;
