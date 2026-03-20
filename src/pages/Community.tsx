
import React from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import CommunityFeed from '@/components/CommunityFeed';

const Community = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 pb-14">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Community</h1>
          <p className="text-gray-600">
            Connect with fellow style enthusiasts, share your outfits, and get inspired
          </p>
        </div>

        <CommunityFeed />
      </main>
      <BottomNav />
    </div>
  );
};

export default Community;
