import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Movie } from '@/types';
import { TradeHistory } from './TradeHistory';
import { ImageUpload } from './ImageUpload';

export function AdminPanel() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [newMovie, setNewMovie] = useState({
    symbol: '',
    title: '',
    total_supply: '',
    market_price: '',
    description: '',
    image_url: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching movies:', error);
      return;
    }
    
    setMovies(data || []);
  };

  const handleCreateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('movies')
        .insert({
          symbol: newMovie.symbol.toUpperCase(),
          title: newMovie.title,
          total_supply: parseInt(newMovie.total_supply),
          market_price: parseFloat(newMovie.market_price),
          description: newMovie.description || null,
          image_url: newMovie.image_url || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Movie created successfully"
      });

      setNewMovie({
        symbol: '',
        title: '',
        total_supply: '',
        market_price: '',
        description: '',
        image_url: ''
      });

      fetchMovies();
    } catch (error) {
      console.error('Error creating movie:', error);
      toast({
        title: "Error",
        description: "Failed to create movie",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMarketPrice = async (movieId: string, newPrice: number) => {
    try {
      const { error } = await supabase
        .from('movies')
        .update({ 
          market_price: newPrice,
          updated_at: new Date().toISOString()
        })
        .eq('id', movieId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Market price updated"
      });

      fetchMovies();
    } catch (error) {
      console.error('Error updating price:', error);
      toast({
        title: "Error",
        description: "Failed to update price",
        variant: "destructive"
      });
    }
  };

  const updateMovieImage = async (movieId: string, imageUrl: string) => {
    try {
      const { error } = await supabase
        .from('movies')
        .update({ 
          image_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', movieId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Movie image updated"
      });

      fetchMovies();
    } catch (error) {
      console.error('Error updating image:', error);
      toast({
        title: "Error",
        description: "Failed to update image",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="movies" className="w-full">
        <TabsList>
          <TabsTrigger value="movies">Manage Movies</TabsTrigger>
          <TabsTrigger value="trades">All Trades</TabsTrigger>
        </TabsList>
        
        <TabsContent value="movies">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create New Movie */}
            <Card>
              <CardHeader>
                <CardTitle>Create New Movie</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateMovie} className="space-y-4">
                  <div>
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input
                      id="symbol"
                      value={newMovie.symbol}
                      onChange={(e) => setNewMovie({...newMovie, symbol: e.target.value})}
                      placeholder="PEDDI"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newMovie.title}
                      onChange={(e) => setNewMovie({...newMovie, title: e.target.value})}
                      placeholder="Peddi"
                      required
                    />
                  </div>

                  <ImageUpload
                    currentImageUrl={newMovie.image_url}
                    onImageUploaded={(url) => setNewMovie({...newMovie, image_url: url})}
                    onImageRemoved={() => setNewMovie({...newMovie, image_url: ''})}
                    disabled={loading}
                  />
                  
                  <div>
                    <Label htmlFor="total_supply">Total Supply</Label>
                    <Input
                      id="total_supply"
                      type="number"
                      value={newMovie.total_supply}
                      onChange={(e) => setNewMovie({...newMovie, total_supply: e.target.value})}
                      placeholder="1000000"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="market_price">Initial Market Price (₹)</Label>
                    <Input
                      id="market_price"
                      type="number"
                      step="0.01"
                      value={newMovie.market_price}
                      onChange={(e) => setNewMovie({...newMovie, market_price: e.target.value})}
                      placeholder="100.00"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newMovie.description}
                      onChange={(e) => setNewMovie({...newMovie, description: e.target.value})}
                      placeholder="Movie description..."
                    />
                  </div>
                  
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Creating...' : 'Create Movie'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Existing Movies */}
            <Card>
              <CardHeader>
                <CardTitle>Existing Movies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {movies.map((movie) => (
                    <div key={movie.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex gap-4">
                        {/* Movie Image */}
                        <div className="w-24 h-32 flex-shrink-0">
                          {movie.image_url ? (
                            <img 
                              src={movie.image_url} 
                              alt={movie.title}
                              className="w-full h-full object-cover rounded border"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground">
                              No Image
                            </div>
                          )}
                        </div>

                        {/* Movie Details */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold">{movie.title}</h4>
                              <p className="text-sm text-muted-foreground">{movie.symbol}</p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">₹{movie.market_price.toFixed(2)}</div>
                              <div className="text-xs text-muted-foreground">
                                Supply: {movie.total_supply.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          {/* Image Upload */}
                          <div className="mb-3">
                            <ImageUpload
                              currentImageUrl={movie.image_url || undefined}
                              onImageUploaded={(url) => updateMovieImage(movie.id, url)}
                              onImageRemoved={() => updateMovieImage(movie.id, '')}
                            />
                          </div>
                          
                          {/* Price Update */}
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="New price"
                              className="flex-1"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  const target = e.target as HTMLInputElement;
                                  const newPrice = parseFloat(target.value);
                                  if (newPrice > 0) {
                                    updateMarketPrice(movie.id, newPrice);
                                    target.value = '';
                                  }
                                }
                              }}
                            />
                            <Button 
                              size="sm"
                              onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                const newPrice = parseFloat(input.value);
                                if (newPrice > 0) {
                                  updateMarketPrice(movie.id, newPrice);
                                  input.value = '';
                                }
                              }}
                            >
                              Update Price
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trades">
          <TradeHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
