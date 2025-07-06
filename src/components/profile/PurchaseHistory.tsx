
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Calendar, Store } from 'lucide-react';
import { format } from 'date-fns';

const PurchaseHistory = () => {
  const { data: purchaseHistory, isLoading } = useQuery({
    queryKey: ['purchaseHistory'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('user_purchases')
        .select(`
          *,
          shopping_items (
            id,
            name,
            brand,
            image_url,
            category
          )
        `)
        .eq('user_id', user.id)
        .order('purchase_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Purchase History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card - Only Total Purchases */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                <p className="text-2xl font-bold">{purchaseHistory?.length || 0}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-rose-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Purchase History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!purchaseHistory || purchaseHistory.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases yet</h3>
              <p className="text-gray-600">
                Your purchase history will appear here when you buy items through the app.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {purchaseHistory.map((purchase) => (
                <div key={purchase.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    {purchase.shopping_items?.image_url && (
                      <img
                        src={purchase.shopping_items.image_url}
                        alt={purchase.shopping_items.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {purchase.shopping_items?.name || 'Unknown Item'}
                          </h3>
                          {purchase.shopping_items?.brand && (
                            <p className="text-sm text-gray-600">{purchase.shopping_items.brand}</p>
                          )}
                          {purchase.shopping_items?.category && (
                            <Badge variant="outline" className="mt-1">
                              {purchase.shopping_items.category}
                            </Badge>
                          )}
                        </div>

                        <div className="text-right">
                          {purchase.purchase_price && (
                            <p className="text-lg font-semibold text-gray-900">
                              ${purchase.purchase_price}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(purchase.purchase_date), 'MMM d, yyyy')}
                        </div>

                        {purchase.retailer && (
                          <div className="flex items-center gap-1">
                            <Store className="h-4 w-4" />
                            {purchase.retailer}
                          </div>
                        )}

                        {purchase.order_reference && (
                          <div>
                            Order: {purchase.order_reference}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseHistory;
