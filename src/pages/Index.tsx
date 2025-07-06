
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import EventInput from '@/components/EventInput';
import OutfitCard from '@/components/OutfitCard';
import UKBrandOutfitCard from '@/components/UKBrandOutfitCard';
import AccessoriesSection from '@/components/AccessoriesSection';
import WeatherDisplay from '@/components/WeatherDisplay';
import DailyOutfitAssistant from '@/components/DailyOutfitAssistant';
import StyleInspiration from '@/components/StyleInspiration';
import TrendingNow from '@/components/TrendingNow';
import CalendarRecommendationsSection from '@/components/CalendarRecommendationsSection';
import { generateOutfitRecommendations } from '@/services/shoppingService';
import type { OutfitRecommendation } from '@/services/shoppingService';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [currentEvent, setCurrentEvent] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ukBrandOutfits, setUkBrandOutfits] = useState<OutfitRecommendation[]>([]);
  const [isLoadingOutfits, setIsLoadingOutfits] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const sampleOutfits = [
    {
      id: 1,
      title: "Professional Blazer Set",
      description: "Perfect for business meetings and interviews. Tailored fit with modern styling.",
      price: 189,
      rentalPrice: 45,
      image: "/placeholder-outfit-1.jpg",
      brand: "Banana Republic",
      category: "Business"
    },
    {
      id: 2,
      title: "Elegant Midi Dress",
      description: "Versatile dress perfect for dinner dates or cocktail events. Flattering silhouette.",
      price: 145,
      rentalPrice: 35,
      image: "/placeholder-outfit-2.jpg",
      brand: "& Other Stories",
      category: "Cocktail"
    },
    {
      id: 3,
      title: "Casual Chic Ensemble",
      description: "Comfortable yet stylish for brunch dates and casual outings with friends.",
      price: 98,
      rentalPrice: 28,
      image: "/placeholder-outfit-3.jpg",
      brand: "Madewell",
      category: "Casual"
    }
  ];

  const handleEventSubmit = async (event: string) => {
    setCurrentEvent(event);
    setIsLoadingOutfits(true);
    setShowRecommendations(true);
    
    try {
      console.log('Fetching UK brand recommendations for:', event);
      const recommendations = await generateOutfitRecommendations(event);
      setUkBrandOutfits(recommendations);
    } catch (error) {
      console.error('Error generating outfit recommendations:', error);
    } finally {
      setIsLoadingOutfits(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showRecommendations ? (
          <div className="min-h-[60vh] flex items-center">
            <div className="w-full">
              <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-6">
                  Your Personal Stylist
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Get perfectly curated outfits for any occasion from top UK brands. Buy or rent stunning pieces that arrive exactly when you need them.
                </p>
                {!isAuthenticated && (
                  <p className="text-sm text-gray-500 mt-4">
                    Sign in to access your personal wardrobe and get personalized recommendations!
                  </p>
                )}
              </div>
              <EventInput onEventSubmit={handleEventSubmit} />
              <WeatherDisplay />
              
              {/* Calendar Integration Section - shown after weather */}
              {isAuthenticated && <CalendarRecommendationsSection />}
              
              <StyleInspiration />
              <TrendingNow />
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <button 
                onClick={() => {
                  setShowRecommendations(false);
                  setUkBrandOutfits([]);
                }}
                className="text-rose-600 hover:text-rose-700 mb-4 font-medium"
              >
                ← Back to search
              </button>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Perfect Outfits for "{currentEvent}"
              </h2>
              <p className="text-gray-600">
                Curated from top UK brands, considering weather, dress code, and style preferences
              </p>
            </div>

            <WeatherDisplay />

            {isLoadingOutfits ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="ml-3 text-lg text-gray-600">Finding perfect outfits from UK brands...</span>
              </div>
            ) : (
              <>
                {ukBrandOutfits.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">
                      From Top UK Brands
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {ukBrandOutfits.map((outfit) => (
                        <UKBrandOutfitCard key={outfit.id} outfit={outfit} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    Additional Style Options
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sampleOutfits.map((outfit) => (
                      <OutfitCard key={outfit.id} outfit={outfit} />
                    ))}
                  </div>
                </div>
              </>
            )}

            <AccessoriesSection />

            <div className="mt-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                UK Brand Guarantee
              </h3>
              <p className="text-gray-700 max-w-2xl mx-auto">
                All recommendations feature authentic pieces from top UK retailers including ASOS, Next, John Lewis, and more. 
                Fast delivery across the UK with easy returns and rental options available.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
