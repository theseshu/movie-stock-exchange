import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useUserStore } from '@/hooks/useUser';
import { Movie } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface OrderFormProps {
  movie: Movie;
  onOrderPlaced?: () => void;
  selectedPrice?: number | null;
  selectedOrderType?: 'buy' | 'sell' | null;
  onPriceUsed?: () => void;
}

export function OrderForm({ movie, onOrderPlaced, selectedPrice, selectedOrderType, onPriceUsed }: OrderFormProps) {
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState(movie.market_price.toString());
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useUserStore();
  const { toast } = useToast();

  // Handle price selection from market depth
  useEffect(() => {
    if (selectedPrice && selectedOrderType) {
      setPrice(selectedPrice.toString());
      setOrderType(selectedOrderType);
      onPriceUsed?.();
    }
  }, [selectedPrice, selectedOrderType, onPriceUsed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Error",
        description: "Please select a user first",
        variant: "destructive"
      });
      return;
    }

    if (!quantity || !price) {
      toast({
        title: "Error", 
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('orders')
        .insert({
          user_id: currentUser.id,
          movie_id: movie.id,
          order_type: orderType,
          price: parseFloat(price),
          quantity: parseInt(quantity)
        });

      if (error) throw error;

      // Trigger order matching
      await supabase.functions.invoke('match-orders', {
        body: { movieId: movie.id }
      });

      toast({
        title: "Success",
        description: `${orderType === 'buy' ? 'Buy' : 'Sell'} order placed successfully`
      });

      setQuantity('');
      onOrderPlaced?.();
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: "Failed to place order",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const totalValue = parseFloat(price || '0') * parseInt(quantity || '0');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Place Order - {movie.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={orderType} onValueChange={(value) => setOrderType(value as 'buy' | 'sell')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>
          
          <TabsContent value={orderType} className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="price">Price per unit (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                />
              </div>

              {totalValue > 0 && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex justify-between">
                    <span>Total Value:</span>
                    <span className="font-semibold">₹{totalValue.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
                variant={orderType === 'buy' ? 'default' : 'outline'}
              >
                {loading ? 'Placing...' : `Place ${orderType === 'buy' ? 'Buy' : 'Sell'} Order`}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}