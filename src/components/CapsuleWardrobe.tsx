import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, Trash2, Eye, Calendar, MapPin, Palette, Shirt } from 'lucide-react';
import { useCapsuleWardrobes } from '@/hooks/useCapsuleWardrobes';

interface CapsuleWardrobeProps {
  capsule: {
    id: string;
    name: string;
    description?: string;
    season?: string;
    occasion?: string;
    wardrobe_item_ids: string[];
    max_items: number;
    created_at: string;
    updated_at: string;
  };
  onDelete: () => void;
}

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color?: string;
  brand?: string;
  image_url?: string;
  tags?: string[];
}

const CapsuleWardrobe = ({ capsule, onDelete }: CapsuleWardrobeProps) => {
  const { getCapsuleItems, generateOutfitCombinations } = useCapsuleWardrobes();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [showItems, setShowItems] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadItems();
  }, [capsule]);

  const loadItems = async () => {
    setLoading(true);
    const capsuleItems = await getCapsuleItems(capsule);
    setItems(capsuleItems);
    setLoading(false);
  };

  const outfitCount = generateOutfitCombinations(items);

  const getCategoryIcon = (category: string) => {
    return <Shirt className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Tops': 'bg-blue-100 text-blue-800',
      'Bottoms': 'bg-green-100 text-green-800',
      'Dresses': 'bg-pink-100 text-pink-800',
      'Outerwear': 'bg-purple-100 text-purple-800',
      'Shoes': 'bg-yellow-100 text-yellow-800',
      'Accessories': 'bg-red-100 text-red-800',
      'Activewear': 'bg-orange-100 text-orange-800',
      'Formal': 'bg-gray-100 text-gray-800',
      'Undergarments': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryBreakdown = () => {
    const breakdown = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(breakdown).map(([category, count]) => ({
      category,
      count
    }));
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-rose-500" />
              <CardTitle className="text-lg">{capsule.name}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {capsule.season && (
              <Badge variant="secondary" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {capsule.season}
              </Badge>
            )}
            {capsule.occasion && (
              <Badge variant="secondary" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {capsule.occasion}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {capsule.description && (
            <p className="text-sm text-gray-600">{capsule.description}</p>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-3 rounded-lg">
              <p className="font-medium text-gray-700">Items</p>
              <p className="text-lg font-bold text-rose-600">
                {capsule.wardrobe_item_ids.length}/{capsule.max_items}
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg">
              <p className="font-medium text-gray-700">Possible Outfits</p>
              <p className="text-lg font-bold text-blue-600">{outfitCount}+</p>
            </div>
          </div>

          {/* Category Preview */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Categories:</p>
            <div className="flex flex-wrap gap-1">
              {getCategoryBreakdown().slice(0, 3).map(({ category, count }) => (
                <Badge
                  key={category}
                  className={getCategoryColor(category)}
                >
                  {category} ({count})
                </Badge>
              ))}
              {getCategoryBreakdown().length > 3 && (
                <Badge variant="outline">
                  +{getCategoryBreakdown().length - 3} more
                </Badge>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowItems(true)}
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            View All Items
          </Button>
        </CardContent>
      </Card>

      {/* Items Dialog */}
      <Dialog open={showItems} onOpenChange={setShowItems}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-rose-500" />
              {capsule.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Capsule Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700">Total Items</h4>
                <p className="text-2xl font-bold text-rose-600">
                  {capsule.wardrobe_item_ids.length}
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700">Possible Outfits</h4>
                <p className="text-2xl font-bold text-blue-600">{outfitCount}+</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700">Categories</h4>
                <p className="text-2xl font-bold text-green-600">
                  {getCategoryBreakdown().length}
                </p>
              </div>
            </div>

            {/* Category Breakdown */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Category Breakdown</h4>
              <div className="flex flex-wrap gap-2">
                {getCategoryBreakdown().map(({ category, count }) => (
                  <Badge
                    key={category}
                    className={getCategoryColor(category)}
                  >
                    {category}: {count} items
                  </Badge>
                ))}
              </div>
            </div>

            {/* Items Grid */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">All Items</h4>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500/20 border-t-rose-500 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading items...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {items.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-24 object-cover rounded mb-2"
                          />
                        )}
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            {getCategoryIcon(item.category)}
                            <h5 className="font-medium text-sm truncate">{item.name}</h5>
                          </div>
                          <Badge className={getCategoryColor(item.category)}>
                            {item.category}
                          </Badge>
                          {item.brand && (
                            <p className="text-xs text-gray-500">{item.brand}</p>
                          )}
                          {item.color && (
                            <p className="text-xs text-gray-500">{item.color}</p>
                          )}
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CapsuleWardrobe;