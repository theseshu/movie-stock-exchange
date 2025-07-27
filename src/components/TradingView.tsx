
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Movie } from '@/types';
import { MovieCard } from './MovieCard';
import { OrderForm } from './OrderForm';
import { OrderBook } from './OrderBook';
import { TradeHistory } from './TradeHistory';
import { StockChart } from './StockChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function TradingView() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchMovies();
    
    // Subscribe to movie price changes
    const channel = supabase
      .channel('movie-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'movies' },
        () => fetchMovies()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMovies = async () => {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('market_price', { ascending: false });
    
    if (error) {
      console.error('Error fetching movies:', error);
      return;
    }
    
    setMovies(data || []);
  };

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setDialogOpen(true);
  };

  const handleOrderPlaced = () => {
    // Refresh movies to get updated prices
    fetchMovies();
  };

  return (
    <div className="space-y-6">
      {/* Movies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onClick={() => handleMovieClick(movie)}
          />
        ))}
      </div>

      {/* Trading Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedMovie?.title} ({selectedMovie?.symbol})
            </DialogTitle>
          </DialogHeader>
          
          {selectedMovie && (
            <Tabs defaultValue="chart" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chart">Price Chart</TabsTrigger>
                <TabsTrigger value="trade">Trade</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chart" className="mt-4">
                <StockChart movie={selectedMovie} />
              </TabsContent>
              
              <TabsContent value="trade" className="mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <OrderForm 
                      movie={selectedMovie}
                      onOrderPlaced={handleOrderPlaced}
                    />
                    <OrderBook movieId={selectedMovie.id} />
                  </div>
                  
                  <div>
                    <TradeHistory movieId={selectedMovie.id} />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="mt-4">
                <TradeHistory movieId={selectedMovie.id} />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
