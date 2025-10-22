
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, Plus, Grid3X3, Palette } from 'lucide-react';

const StyleInspiration = () => {
  const [selectedStyles, setSelectedStyles] = useState<number[]>([]);
  const [isGeneratingMoodboard, setIsGeneratingMoodboard] = useState(false);

  const inspirationImages = [
    {
      id: 1,
      title: "Minimalist Chic",
      description: "Clean lines, neutral tones",
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop",
      category: "Minimalist",
      colors: ["#F5F5F5", "#D4D4D4", "#A3A3A3"]
    },
    {
      id: 2,
      title: "Business Professional",
      description: "Power dressing with sophistication",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
      category: "Professional",
      colors: ["#1F2937", "#374151", "#6B7280"]
    },
    {
      id: 3,
      title: "Bohemian Vibes",
      description: "Free-spirited and artistic",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop",
      category: "Bohemian",
      colors: ["#92400E", "#B45309", "#D97706"]
    },
    {
      id: 4,
      title: "Casual Comfort",
      description: "Relaxed yet put-together",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=300&fit=crop",
      category: "Casual",
      colors: ["#065F46", "#047857", "#059669"]
    },
    {
      id: 5,
      title: "Vintage Romance",
      description: "Timeless elegance with a twist",
      image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=300&fit=crop",
      category: "Vintage",
      colors: ["#BE185D", "#DB2777", "#EC4899"]
    },
    {
      id: 6,
      title: "Modern Edge",
      description: "Contemporary with bold statements",
      image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop",
      category: "Modern",
      colors: ["#1E40AF", "#3B82F6", "#60A5FA"]
    }
  ];

  const toggleStyleSelection = (id: number) => {
    setSelectedStyles(prev => 
      prev.includes(id) 
        ? prev.filter(styleId => styleId !== id)
        : [...prev, id]
    );
  };

  const generateMoodboard = async () => {
    if (selectedStyles.length === 0) return;
    
    setIsGeneratingMoodboard(true);
    
    // Simulate mood board generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsGeneratingMoodboard(false);
    
    // Here you would typically create and display the mood board
    alert(`🎨 Mood board created with ${selectedStyles.length} style inspirations! Check your saved mood boards in your profile.`);
  };

  const getSelectedStyles = () => {
    return inspirationImages.filter(img => selectedStyles.includes(img.id));
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-2xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
            <Palette className="h-6 w-6 mr-2 text-purple-600" />
            Style Inspiration
          </h3>
          <p className="text-gray-600">
            Select styles you love and create a personalized mood board in one click
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {selectedStyles.length} selected
          </span>
          <Button 
            onClick={generateMoodboard}
            disabled={selectedStyles.length === 0 || isGeneratingMoodboard}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
          >
            {isGeneratingMoodboard ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Grid3X3 className="h-4 w-4 mr-2" />
                Create Mood Board
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {inspirationImages.map((image) => (
          <div 
            key={image.id} 
            className={`relative group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${
              selectedStyles.includes(image.id) 
                ? 'ring-4 ring-purple-400 scale-105 shadow-lg' 
                : 'hover:scale-102 hover:shadow-md'
            }`}
            onClick={() => toggleStyleSelection(image.id)}
          >
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
              <img 
                src={image.image} 
                alt={image.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            
            <div className="absolute top-3 right-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                selectedStyles.includes(image.id) 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}>
                {selectedStyles.includes(image.id) ? (
                  <Heart className="h-4 w-4 fill-current" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h4 className="font-semibold mb-1">{image.title}</h4>
              <p className="text-sm text-white/80 mb-2">{image.description}</p>
              <div className="flex items-center space-x-1">
                {image.colors.map((color, index) => (
                  <div 
                    key={index}
                    className="w-4 h-4 rounded-full border-2 border-white/50"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="absolute top-3 left-3">
              <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                {image.category}
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedStyles.length > 0 && (
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Ready to Create</p>
                <p className="text-sm text-gray-600">
                  {selectedStyles.length} style{selectedStyles.length !== 1 ? 's' : ''} selected for your mood board
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {getSelectedStyles().slice(0, 3).map((style, index) => (
                  <div 
                    key={style.id}
                    className="w-8 h-8 rounded-full border-2 border-white overflow-hidden"
                    style={{ zIndex: 3 - index }}
                  >
                    <img 
                      src={style.image} 
                      alt={style.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {selectedStyles.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-xs text-white font-medium">
                    +{selectedStyles.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StyleInspiration;
