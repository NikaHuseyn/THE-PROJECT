import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Package, Trash2, Edit, Palette, Calendar, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useCapsuleWardrobes } from '@/hooks/useCapsuleWardrobes';
import { supabase } from '@/integrations/supabase/client';
import CapsuleWardrobe from '@/components/CapsuleWardrobe';

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color?: string;
  brand?: string;
  image_url?: string;
}

const CapsuleManager = () => {
  const { capsules, loading, createCapsule, deleteCapsule } = useCapsuleWardrobes();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [newCapsule, setNewCapsule] = useState({
    name: '',
    description: '',
    season: '',
    occasion: '',
    max_items: 30
  });

  const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
  const occasions = ['Work', 'Casual', 'Formal', 'Travel', 'Weekend', 'Special Events'];

  useEffect(() => {
    fetchWardrobeItems();
  }, []);

  const fetchWardrobeItems = async () => {
    try {
      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('id, name, category, color, brand, image_url')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWardrobeItems(data || []);
    } catch (error) {
      console.error('Error fetching wardrobe items:', error);
      toast.error('Failed to load wardrobe items');
    }
  };

  const handleCreateCapsule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCapsule.name.trim()) {
      toast.error('Please enter a capsule name');
      return;
    }

    if (selectedItems.length === 0) {
      toast.error('Please select at least one item for your capsule');
      return;
    }

    if (selectedItems.length > newCapsule.max_items) {
      toast.error(`Please select no more than ${newCapsule.max_items} items`);
      return;
    }

    try {
      await createCapsule({
        ...newCapsule,
        wardrobe_item_ids: selectedItems
      });

      // Reset form
      setNewCapsule({
        name: '',
        description: '',
        season: '',
        occasion: '',
        max_items: 30
      });
      setSelectedItems([]);
      setShowCreateDialog(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : prev.length < newCapsule.max_items 
          ? [...prev, itemId]
          : (toast.error(`Maximum ${newCapsule.max_items} items allowed`), prev)
    );
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="card-elegant p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-medium gradient-text mb-2">Loading your capsule wardrobes...</h3>
          <p className="text-muted-foreground">Organizing your curated collections</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Capsule Wardrobes</h2>
          <p className="text-gray-600">Create curated collections from your wardrobe</p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
          disabled={wardrobeItems.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Capsule
        </Button>
      </div>

      {wardrobeItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No wardrobe items found</h3>
            <p className="text-gray-500 mb-4">Add items to your wardrobe first to create capsule collections!</p>
          </CardContent>
        </Card>
      ) : capsules.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No capsule wardrobes yet</h3>
            <p className="text-gray-500 mb-4">Create your first capsule wardrobe to organise your favourite pieces!</p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-rose-500 to-pink-600"
            >
              Create Your First Capsule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capsules.map((capsule) => (
            <CapsuleWardrobe
              key={capsule.id}
              capsule={capsule}
              onDelete={() => deleteCapsule(capsule.id)}
            />
          ))}
        </div>
      )}

      {/* Create Capsule Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Capsule Wardrobe</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateCapsule} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Capsule Name *</label>
                <Input
                  value={newCapsule.name}
                  onChange={(e) => setNewCapsule({ ...newCapsule, name: e.target.value })}
                  placeholder="e.g., Summer Essentials"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Items</label>
                <Input
                  type="number"
                  value={newCapsule.max_items}
                  onChange={(e) => setNewCapsule({ ...newCapsule, max_items: parseInt(e.target.value) || 30 })}
                  min="5"
                  max="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Season</label>
                <select
                  value={newCapsule.season}
                  onChange={(e) => setNewCapsule({ ...newCapsule, season: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">Select season</option>
                  {seasons.map((season) => (
                    <option key={season} value={season}>{season}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Occasion</label>
                <select
                  value={newCapsule.occasion}
                  onChange={(e) => setNewCapsule({ ...newCapsule, occasion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">Select occasion</option>
                  {occasions.map((occasion) => (
                    <option key={occasion} value={occasion}>{occasion}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={newCapsule.description}
                onChange={(e) => setNewCapsule({ ...newCapsule, description: e.target.value })}
                placeholder="Describe your capsule wardrobe..."
                rows={3}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium">Select Items ({selectedItems.length}/{newCapsule.max_items})</label>
                <Badge variant="outline">{wardrobeItems.length} items available</Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2 border rounded-lg">
                {wardrobeItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedItems.includes(item.id)
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleItemSelection(item.id)}
                  >
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                    )}
                    <div className="space-y-1">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <Badge className={getCategoryColor(item.category)}>
                        {item.category}
                      </Badge>
                      {item.brand && (
                        <p className="text-xs text-gray-500">{item.brand}</p>
                      )}
                      {item.color && (
                        <p className="text-xs text-gray-500">{item.color}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-rose-500 to-pink-600"
                disabled={selectedItems.length === 0}
              >
                Create Capsule
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CapsuleManager;