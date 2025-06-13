
import React from 'react';
import Header from '@/components/Header';
import WardrobeManager from '@/components/WardrobeManager';

const Wardrobe = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WardrobeManager />
      </main>
    </div>
  );
};

export default Wardrobe;
