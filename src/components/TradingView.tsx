import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Movie } from '@/types';
import { MovieCard } from './MovieCard';
import { OrderForm } from './OrderForm';
import { OrderBook } from './OrderBook';
import { MarketDepth } from './MarketDepth';
import { TradeHistory } from './TradeHistory';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function TradingView() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [selectedOrderType, setSelectedOrderType] = useState<'buy' | 'sell' | null>(null);

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

  const handlePriceClick = (price: number, type: 'buy' | 'sell') => {
    setSelectedPrice(price);
    setSelectedOrderType(type);
  };

  return (
    <div className="space-y-8">
      {/* Movies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {movies.map((movie, index) => (
          <div 
            key={movie.id} 
            className="animate-fade-in" 
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <MovieCard
              movie={movie}
              onClick={() => handleMovieClick(movie)}
            />
          </div>
        ))}
      </div>

      {/* Trading Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto premium-card border-border/50">
          <DialogHeader className="border-b border-border/30 pb-6">
            <DialogTitle className="text-3xl font-playfair font-bold premium-text">
              Trade {selectedMovie?.title} ({selectedMovie?.symbol})
            </DialogTitle>
            <p className="text-muted-foreground text-lg">
              Current Price: <span className="premium-text font-semibold text-xl">${selectedMovie?.market_price.toFixed(2)}</span>
            </p>
          </DialogHeader>
          
          {selectedMovie && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pt-6">
              <div className="space-y-8">
                <OrderForm 
                  movie={selectedMovie}
                  onOrderPlaced={handleOrderPlaced}
                  selectedPrice={selectedPrice}
                  selectedOrderType={selectedOrderType}
                  onPriceUsed={() => {
                    setSelectedPrice(null);
                    setSelectedOrderType(null);
                  }}
                />
              </div>
              
              <div className="space-y-6">
                <MarketDepth 
                  movieId={selectedMovie.id} 
                  onPriceClick={handlePriceClick}
                />
                <OrderBook movieId={selectedMovie.id} />
              </div>
              
              <div>
                <TradeHistory movieId={selectedMovie.id} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}