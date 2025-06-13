
import React, { useState } from 'react';
import Header from '@/components/Header';
import EventInput from '@/components/EventInput';
import OutfitCard from '@/components/OutfitCard';
import AccessoriesSection from '@/components/AccessoriesSection';
import WeatherBanner from '@/components/WeatherBanner';
import DailyOutfitAssistant from '@/components/DailyOutfitAssistant';

const Index = () => {
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [currentEvent, setCurrentEvent] = useState('');

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

  const handleEventSubmit = (event: string) => {
    setCurrentEvent(event);
    setShowRecommendations(true);
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
                  Get perfectly curated outfits for any occasion, considering weather, dress code, and your unique style. 
                  Buy or rent stunning pieces that arrive exactly when you need them.
                </p>
              </div>
              <EventInput onEventSubmit={handleEventSubmit} />
              <DailyOutfitAssistant />
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <button 
                onClick={() => setShowRecommendations(false)}
                className="text-rose-600 hover:text-rose-700 mb-4 font-medium"
              >
                ← Back to search
              </button>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Perfect Outfits for "{currentEvent}"
              </h2>
              <p className="text-gray-600">
                Curated just for you, considering weather, dress code, and style preferences
              </p>
            </div>

            <WeatherBanner />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {sampleOutfits.map((outfit) => (
                <OutfitCard key={outfit.id} outfit={outfit} />
              ))}
            </div>

            <AccessoriesSection />

            <div className="mt-12 bg-gradient-to-r from-rose-100 to-pink-100 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Delivery Guarantee
              </h3>
              <p className="text-gray-700 max-w-2xl mx-auto">
                All orders arrive 24-48 hours before your event. We track everything to ensure you're perfectly styled and on time. 
                Free styling consultations included with every rental.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
