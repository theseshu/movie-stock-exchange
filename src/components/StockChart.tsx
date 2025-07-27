
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Movie } from '@/types';

interface StockChartProps {
  movie: Movie;
}

interface PricePoint {
  date: string;
  price: number;
  volume: number;
}

export function StockChart({ movie }: StockChartProps) {
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPriceHistory();
  }, [movie.id]);

  const fetchPriceHistory = async () => {
    setLoading(true);
    
    // Fetch trades for this movie to build price history
    const { data: trades, error } = await supabase
      .from('trades')
      .select('price, quantity, executed_at')
      .eq('movie_id', movie.id)
      .order('executed_at', { ascending: true });

    if (error) {
      console.error('Error fetching price history:', error);
      setLoading(false);
      return;
    }

    if (!trades || trades.length === 0) {
      // If no trades, show current price as single point
      setPriceHistory([{
        date: new Date().toISOString().split('T')[0],
        price: movie.market_price,
        volume: 0
      }]);
      setLoading(false);
      return;
    }

    // Group trades by date and calculate average price and total volume
    const groupedByDate = trades.reduce((acc: Record<string, { totalValue: number, totalVolume: number }>, trade) => {
      const date = new Date(trade.executed_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { totalValue: 0, totalVolume: 0 };
      }
      acc[date].totalValue += trade.price * trade.quantity;
      acc[date].totalVolume += trade.quantity;
      return acc;
    }, {});

    const history = Object.entries(groupedByDate).map(([date, data]) => ({
      date,
      price: data.totalValue / data.totalVolume,
      volume: data.totalVolume
    }));

    // Add current price as the latest point if it's a different day
    const lastTradeDate = history[history.length - 1]?.date;
    const today = new Date().toISOString().split('T')[0];
    
    if (lastTradeDate !== today) {
      history.push({
        date: today,
        price: movie.market_price,
        volume: 0
      });
    }

    setPriceHistory(history);
    setLoading(false);
  };

  const formatPrice = (value: number) => `₹${value.toFixed(2)}`;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price History - {movie.symbol}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                tickFormatter={formatPrice}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip 
                formatter={(value: number) => [formatPrice(value), 'Price']}
                labelFormatter={(label) => `Date: ${formatDate(label)}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {priceHistory.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Current Price: </span>
              <span className="font-semibold">{formatPrice(movie.market_price)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Data Points: </span>
              <span className="font-semibold">{priceHistory.length}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
