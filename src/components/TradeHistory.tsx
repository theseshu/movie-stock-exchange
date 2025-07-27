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
        movies(symbol, title)
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
    <Card className="premium-card border-border/30">
      <CardHeader className="border-b border-border/30">
        <CardTitle className="text-2xl font-playfair font-bold premium-text flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-sm">📊</span>
          </div>
          Trade History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {trades.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl opacity-50">📈</span>
            </div>
            <p className="text-muted-foreground text-lg">No trades yet</p>
            <p className="text-muted-foreground text-sm mt-2">Be the first to make a trade!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground font-medium">
              Latest {trades.length} trades
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-border/30">
                  <TableHead className="font-semibold text-foreground">Time</TableHead>
                  {!movieId && <TableHead className="font-semibold text-foreground">Movie</TableHead>}
                  <TableHead className="font-semibold text-foreground">Price</TableHead>
                  <TableHead className="font-semibold text-foreground">Quantity</TableHead>
                  <TableHead className="font-semibold text-foreground">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((trade: any, index) => (
                  <TableRow 
                    key={trade.id} 
                    className="border-border/20 hover:bg-accent/5 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <TableCell className="text-sm font-mono">
                      {new Date(trade.executed_at).toLocaleTimeString()}
                    </TableCell>
                    {!movieId && (
                      <TableCell>
                        <div>
                          <div className="font-semibold text-foreground">{trade.movies?.title}</div>
                          <div className="text-xs text-muted-foreground font-mono">{trade.movies?.symbol}</div>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <span className="font-semibold premium-text text-lg">${trade.price.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{trade.quantity}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-lg">${(trade.price * trade.quantity).toFixed(2)}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}