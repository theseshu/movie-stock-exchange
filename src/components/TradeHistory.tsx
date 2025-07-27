import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Trade } from '@/types';

interface TradeHistoryProps {
  movieId?: string;
}

export function TradeHistory({ movieId }: TradeHistoryProps) {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    fetchTrades();
    
    // Subscribe to trade changes
    const channel = supabase
      .channel('trades-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'trades' },
        () => fetchTrades()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [movieId]);

  const fetchTrades = async () => {
    let query = supabase
      .from('trades')
      .select(`
        *,
        movies(symbol, title),
        buyer:demo_users!trades_buyer_id_fkey(display_name),
        seller:demo_users!trades_seller_id_fkey(display_name)
      `)
      .order('executed_at', { ascending: false })
      .limit(20);

    if (movieId) {
      query = query.eq('movie_id', movieId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching trades:', error);
      return;
    }
    
    setTrades(data || []);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade History</CardTitle>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <p className="text-sm text-muted-foreground">No trades yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                {!movieId && <TableHead>Movie</TableHead>}
                <TableHead>Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Seller</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade: any) => (
                <TableRow key={trade.id}>
                  <TableCell className="text-xs">
                    {new Date(trade.executed_at).toLocaleTimeString()}
                  </TableCell>
                  {!movieId && (
                    <TableCell>
                      <div>
                        <div className="font-medium">{trade.movies?.title}</div>
                        <div className="text-xs text-muted-foreground">{trade.movies?.symbol}</div>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>${trade.price.toFixed(2)}</TableCell>
                  <TableCell>{trade.quantity}</TableCell>
                  <TableCell>${(trade.price * trade.quantity).toFixed(2)}</TableCell>
                  <TableCell>{trade.buyer?.display_name}</TableCell>
                  <TableCell>{trade.seller?.display_name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}