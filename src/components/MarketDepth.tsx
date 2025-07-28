import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import type { Order } from '@/types';

interface MarketDepthProps {
  movieId: string;
  onPriceClick?: (price: number, type: 'buy' | 'sell') => void;
}

interface DepthLevel {
  price: number;
  quantity: number;
  cumulative: number;
  orders: number;
}

export const MarketDepth: React.FC<MarketDepthProps> = ({ movieId, onPriceClick }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();
    
    const channel = supabase
      .channel('market-depth-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `movie_id=eq.${movieId}`
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [movieId]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('movie_id', movieId)
      .eq('status', 'open');
    
    if (data) {
      setOrders(data as Order[]);
    }
  };

  const aggregateOrdersByPrice = (orders: Order[], type: 'buy' | 'sell'): DepthLevel[] => {
    const filteredOrders = orders.filter(order => order.order_type === type);
    const priceMap = new Map<number, { quantity: number; orders: number }>();

    filteredOrders.forEach(order => {
      const remainingQuantity = order.quantity - order.filled_quantity;
      if (remainingQuantity > 0) {
        const existing = priceMap.get(order.price) || { quantity: 0, orders: 0 };
        priceMap.set(order.price, {
          quantity: existing.quantity + remainingQuantity,
          orders: existing.orders + 1
        });
      }
    });

    const levels = Array.from(priceMap.entries()).map(([price, data]) => ({
      price,
      quantity: data.quantity,
      orders: data.orders,
      cumulative: 0
    }));

    // Sort buy orders by price descending, sell orders by price ascending
    levels.sort((a, b) => type === 'buy' ? b.price - a.price : a.price - b.price);

    // Calculate cumulative quantities
    let cumulative = 0;
    levels.forEach(level => {
      cumulative += level.quantity;
      level.cumulative = cumulative;
    });

    return levels.slice(0, 10); // Show top 10 levels
  };

  const buyLevels = aggregateOrdersByPrice(orders, 'buy');
  const sellLevels = aggregateOrdersByPrice(orders, 'sell');
  const maxCumulative = Math.max(
    ...buyLevels.map(l => l.cumulative),
    ...sellLevels.map(l => l.cumulative),
    1
  );

  const DepthRow: React.FC<{
    level: DepthLevel;
    type: 'buy' | 'sell';
    maxCumulative: number;
  }> = ({ level, type, maxCumulative }) => {
    const barWidth = (level.cumulative / maxCumulative) * 100;
    
    return (
      <div
        className="relative flex items-center justify-between p-2 hover:bg-muted/50 cursor-pointer transition-colors text-sm"
        onClick={() => onPriceClick?.(level.price, type)}
      >
        <div
          className={`absolute inset-0 ${
            type === 'buy' 
              ? 'bg-emerald-500/10 border-r-2 border-emerald-500/20' 
              : 'bg-red-500/10 border-l-2 border-red-500/20'
          }`}
          style={{ 
            width: `${barWidth}%`,
            [type === 'buy' ? 'right' : 'left']: 0
          }}
        />
        <div className="relative z-10 flex items-center justify-between w-full">
          {type === 'buy' ? (
            <>
              <span className="text-emerald-600 font-medium">₹{level.price.toFixed(2)}</span>
              <span className="text-muted-foreground">{level.quantity}</span>
              <span className="text-xs text-muted-foreground">{level.cumulative}</span>
            </>
          ) : (
            <>
              <span className="text-xs text-muted-foreground">{level.cumulative}</span>
              <span className="text-muted-foreground">{level.quantity}</span>
              <span className="text-red-600 font-medium">₹{level.price.toFixed(2)}</span>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Market Depth</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 gap-4">
          {/* Buy Orders */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 py-2 bg-muted/30 text-xs font-medium text-muted-foreground">
              <span>Price</span>
              <span>Qty</span>
              <span>Total</span>
            </div>
            <div className="space-y-0.5">
              {buyLevels.length > 0 ? (
                buyLevels.map((level, index) => (
                  <DepthRow 
                    key={`buy-${level.price}-${index}`}
                    level={level} 
                    type="buy" 
                    maxCumulative={maxCumulative}
                  />
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No buy orders
                </div>
              )}
            </div>
          </div>

          {/* Sell Orders */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 py-2 bg-muted/30 text-xs font-medium text-muted-foreground">
              <span>Total</span>
              <span>Qty</span>
              <span>Price</span>
            </div>
            <div className="space-y-0.5">
              {sellLevels.length > 0 ? (
                sellLevels.map((level, index) => (
                  <DepthRow 
                    key={`sell-${level.price}-${index}`}
                    level={level} 
                    type="sell" 
                    maxCumulative={maxCumulative}
                  />
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No sell orders
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};