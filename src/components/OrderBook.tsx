import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types';

interface OrderBookProps {
  movieId: string;
}

export function OrderBook({ movieId }: OrderBookProps) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();
    
    // Subscribe to order changes
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders', filter: `movie_id=eq.${movieId}` },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [movieId]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('movie_id', movieId)
      .eq('status', 'open')
      .order('price', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
      return;
    }
    
    setOrders((data || []) as Order[]);
  };

  const buyOrders = orders.filter(order => order.order_type === 'buy');
  const sellOrders = orders.filter(order => order.order_type === 'sell');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Book</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Buy Orders */}
          <div>
            <h4 className="font-semibold text-green-600 mb-3">Buy Orders</h4>
            <div className="space-y-2">
              {buyOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No buy orders</p>
              ) : (
                buyOrders.map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <div>
                      <div className="text-sm font-medium">₹{order.price.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">{order.quantity} units</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      ₹{(order.price * order.quantity).toFixed(2)}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sell Orders */}
          <div>
            <h4 className="font-semibold text-red-600 mb-3">Sell Orders</h4>
            <div className="space-y-2">
              {sellOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sell orders</p>
              ) : (
                sellOrders.map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <div>
                      <div className="text-sm font-medium">₹{order.price.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">{order.quantity} units</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      ₹{(order.price * order.quantity).toFixed(2)}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}