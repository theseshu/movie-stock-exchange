import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useUserStore } from '@/hooks/useUser';
import { Portfolio as PortfolioType } from '@/types';

interface PortfolioProps {
  userId?: string;
}

export function Portfolio({ userId }: PortfolioProps) {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const { currentUser } = useUserStore();
  
  const activeUserId = userId || currentUser?.id;

  useEffect(() => {
    if (activeUserId) {
      fetchPortfolio();
      
      // Subscribe to portfolio changes
      const portfolioChannel = supabase
        .channel('portfolio-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'portfolios', filter: `user_id=eq.${activeUserId}` },
          () => fetchPortfolio()
        )
        .subscribe();

      // Also subscribe to trades to get real-time updates when new trades happen
      const tradesChannel = supabase
        .channel('trades-changes')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'trades' },
          (payload) => {
            // Refresh portfolio if this trade involves the current user
            if (payload.new.buyer_id === activeUserId || payload.new.seller_id === activeUserId) {
              fetchPortfolio();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(portfolioChannel);
        supabase.removeChannel(tradesChannel);
      };
    }
  }, [activeUserId]);

  const fetchPortfolio = async () => {
    if (!activeUserId) return;

    const { data, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        movies(symbol, title, market_price)
      `)
      .eq('user_id', activeUserId)
      .gt('quantity', 0);
    
    if (error) {
      console.error('Error fetching portfolio:', error);
      return;
    }
    
    setPortfolios(data || []);
    
    // Calculate total portfolio value
    const total = (data || []).reduce((sum, item: any) => {
      return sum + (item.quantity * item.movies.market_price);
    }, 0);
    setTotalValue(total);
  };

  if (!activeUserId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Please select a user to view portfolio</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Portfolio</CardTitle>
          <Badge variant="outline" className="text-lg px-3 py-1">
            Total: ${totalValue.toFixed(2)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {portfolios.length === 0 ? (
          <p className="text-sm text-muted-foreground">No holdings yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Movie</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Avg. Price</TableHead>
                <TableHead>Market Price</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>P&L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {portfolios.map((portfolio: any) => {
                const currentValue = portfolio.quantity * portfolio.movies.market_price;
                const costBasis = portfolio.quantity * portfolio.average_price;
                const pnl = currentValue - costBasis;
                const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
                
                return (
                  <TableRow key={portfolio.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{portfolio.movies.title}</div>
                        <div className="text-xs text-muted-foreground">{portfolio.movies.symbol}</div>
                      </div>
                    </TableCell>
                    <TableCell>{portfolio.quantity}</TableCell>
                    <TableCell>${portfolio.average_price.toFixed(2)}</TableCell>
                    <TableCell>${portfolio.movies.market_price.toFixed(2)}</TableCell>
                    <TableCell>${currentValue.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className={`${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${pnl.toFixed(2)}
                        <div className="text-xs">
                          ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%)
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}