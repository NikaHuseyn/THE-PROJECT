
import React from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, ShoppingCart, Heart, Star, Loader2 } from 'lucide-react';
import { useFashionTrends } from '@/hooks/useFashionTrends';
import { LoadingState, LoadingGrid } from '@/components/ui/loading';
import { NoTrendsEmptyState } from '@/components/ui/empty-state';

const TrendingNow = () => {
  const { trends, isLoading, error } = useFashionTrends();

  // Transform fashion trends data to match component format
  const trendingItems = trends.slice(0, 6).map((trend) => ({
    id: trend.id,
    name: trend.name,
    brand: trend.source || "Partner Brand",
    price: Math.floor(Math.random() * 200) + 50, // Mock pricing for now
    originalPrice: Math.floor(Math.random() * 250) + 80,
    image: trend.image_url || "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop",
    rating: Math.round((trend.trend_score / 100) * 5 * 10) / 10, // Convert trend_score to rating
    reviews: Math.floor(Math.random() * 500) + 50,
    outfitCompatibility: trend.occasions?.slice(0, 3) || ["Casual", "Smart Casual"],
    trending: true,
    colors: trend.colors?.slice(0, 3) || ["Black", "White", "Navy"],
    trendScore: trend.trend_score,
    category: trend.category
  }));

  return (
    <div className="card-warm p-8 mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-3xl font-bold gradient-text mb-3 flex items-center">
            <TrendingUp className="h-7 w-7 mr-3 text-primary" />
            Trending Now
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Discover the latest fashion trends curated by our AI from top brands worldwide
          </p>
        </div>
        <Button 
          variant="outline" 
          className="btn-fashion border-primary/20 text-primary hover:bg-primary/5"
          onClick={() => window.location.href = '/fashion-trends'}
        >
          View All Trends
        </Button>
      </div>

      {isLoading ? (
        <LoadingState
          variant="fashion"
          title="Discovering Latest Trends"
          description="Our AI is analyzing the latest fashion data to bring you the most current styles..."
          icon="sparkles"
        />
      ) : error ? (
        <NoTrendsEmptyState onRefresh={() => window.location.reload()} />
      ) : trendingItems.length === 0 ? (
        <NoTrendsEmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trendingItems.map((item) => (
          <div 
            key={item.id}
            className="card-elegant interactive-scale overflow-hidden group animate-fade-in-up"
            style={{ animationDelay: `${trendingItems.indexOf(item) * 100}ms` }}
          >
            <div className="relative h-48 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full mx-auto mb-3 flex items-center justify-center animate-float">
                    <span className="text-xl font-bold text-white">{item.name[0]}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">{item.name}</p>
                </div>
              </div>
              
              <div className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-medium flex items-center animate-pulse-glow">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </div>
              
              <div className="absolute top-3 right-3">
                <button 
                  className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    const heart = e.currentTarget.querySelector('svg');
                    if (heart) {
                      heart.classList.toggle('text-red-500');
                      heart.classList.toggle('fill-red-500');
                    }
                  }}
                >
                  <Heart className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                </button>
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
                  onClick={() => {
                    window.open(`https://www.google.com/search?q=${encodeURIComponent(item.name + ' ' + item.brand + ' fashion buy online')}`, '_blank');
                  }}
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Shop Now
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-amber-300 text-amber-700 hover:bg-amber-50 text-xs"
                  onClick={() => {
                    alert(`${item.name}\n\nStyle: ${item.category}\nBrand: ${item.brand}\nTrend Score: ${item.trendScore}%\n\nThis trending piece works great with: ${item.outfitCompatibility.join(', ')}`);
                  }}
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
      )}

      {!isLoading && !error && trendingItems.length > 0 && (
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
      )}
    </div>
  );
};

export default TrendingNow;
