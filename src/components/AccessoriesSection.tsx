
import React from 'react';
import { Button } from '@/components/ui/button';

const AccessoriesSection = () => {
  const accessories = [
    { name: "Pearl Earrings", price: 45, type: "jewelry" },
    { name: "Leather Handbag", price: 120, type: "bag" },
    { name: "Classic Heels", price: 89, type: "shoes" },
    { name: "Silk Scarf", price: 35, type: "accessory" },
    { name: "Statement Necklace", price: 67, type: "jewelry" },
    { name: "Designer Watch", price: 200, type: "accessory" }
  ];

  return (
    <div className="mt-12 bg-white rounded-2xl p-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Complete Your Look
      </h3>
      <p className="text-gray-600 text-center mb-8">
        Perfect accessories to match your chosen outfit
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {accessories.map((accessory, index) => (
          <div key={index} className="text-center group cursor-pointer">
            <div className="h-24 w-24 bg-gradient-to-br from-rose-100 to-pink-200 rounded-full mx-auto mb-3 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <span className="text-lg font-bold text-rose-600">{accessory.name[0]}</span>
            </div>
            <h4 className="font-medium text-gray-800 text-sm mb-1">{accessory.name}</h4>
            <p className="text-rose-600 font-semibold text-sm">${accessory.price}</p>
            <Button size="sm" variant="outline" className="mt-2 text-xs border-rose-200 text-rose-600 hover:bg-rose-50">
              Add
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccessoriesSection;
