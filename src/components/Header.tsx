
import React from 'react';
import { Calendar, ShoppingBag, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-rose-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
              StyleSync
            </h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-rose-500 transition-colors">Discover</a>
            <a href="#" className="text-gray-700 hover:text-rose-500 transition-colors">My Closet</a>
            <a href="#" className="text-gray-700 hover:text-rose-500 transition-colors">Rentals</a>
          </nav>
          <div className="flex items-center space-x-4">
            <Calendar className="h-6 w-6 text-gray-600 hover:text-rose-500 cursor-pointer transition-colors" />
            <ShoppingBag className="h-6 w-6 text-gray-600 hover:text-rose-500 cursor-pointer transition-colors" />
            <User className="h-6 w-6 text-gray-600 hover:text-rose-500 cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
