
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, X, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UserWishlist = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wishlistItems, isLoading } = useQuery({
    queryKey: ['userWishlist'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('user_wishlist')
        .select(`
          *,
          shopping_items (
            id,
            name,
            brand,
            price,
            image_url,
            retailer_name
          )
        `)
        .eq('user_id', user.id)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (wishlistId: string) => {
      const { error } = await supabase
        .from('user_wishlist')
        .delete()
        .eq('id', wishlistId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userWishlist'] });
      toast({
        title: "Success",
        description: "Item removed from wishlist!",
      });
    },
  });

  const updatePriorityMutation = useMutation({
    mutationFn: async ({ wishlistId, priority }: { wishlistId: string; priority: number }) => {
      const { error } = await supabase
        .from('user_wishlist')
        .update({ priority })
        .eq('id', wishlistId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userWishlist'] });
      toast({
        title: "Success",
        description: "Priority updated!",
      });
    },
  });

  const getPriorityBadgeColor = (priority: number) => {
    switch (priority) {
      case 5: return 'bg-red-500';
      case 4: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 2: return 'bg-blue-500';
      case 1: return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            My Wishlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-elegant animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg shimmer"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded shimmer"></div>
                  <div className="h-3 bg-muted rounded w-3/4 shimmer"></div>
                  <div className="h-6 bg-muted rounded w-1/2 shimmer"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          My Wishlist ({wishlistItems?.length || 0} items)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!wishlistItems || wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No wishlist items yet</h3>
            <p className="text-gray-600">
              Start browsing and add items you love to your wishlist!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="border rounded-lg overflow-hidden">
                <div className="relative">
                  {item.shopping_items?.image_url && (
                    <img
                      src={item.shopping_items.image_url}
                      alt={item.shopping_items.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <button
                    onClick={() => removeFromWishlistMutation.mutate(item.id)}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>
                  <div className="absolute top-2 left-2">
                    <Badge className={`${getPriorityBadgeColor(item.priority)} text-white`}>
                      <Star className="h-3 w-3 mr-1" />
                      {item.priority}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-medium text-gray-900 line-clamp-2">
                      {item.shopping_items?.name}
                    </h3>
                    {item.shopping_items?.brand && (
                      <p className="text-sm text-gray-600">{item.shopping_items.brand}</p>
                    )}
                    {item.shopping_items?.price && (
                      <p className="text-lg font-semibold text-rose-600">
                        ${item.shopping_items.price}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Select
                      value={item.priority.toString()}
                      onValueChange={(value) => 
                        updatePriorityMutation.mutate({
                          wishlistId: item.id,
                          priority: parseInt(value)
                        })
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">High Priority</SelectItem>
                        <SelectItem value="4">Medium-High</SelectItem>
                        <SelectItem value="3">Medium</SelectItem>
                        <SelectItem value="2">Low-Medium</SelectItem>
                        <SelectItem value="1">Low Priority</SelectItem>
                      </SelectContent>
                    </Select>

                    {item.notes && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {item.notes}
                      </div>
                    )}
                  </div>

                  {item.shopping_items?.retailer_name && (
                    <div className="text-xs text-gray-500">
                      Available at {item.shopping_items.retailer_name}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserWishlist;
