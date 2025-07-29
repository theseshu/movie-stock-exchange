import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Movie } from '@/types';
import movieMatrix from '@/assets/peddi.jpg';
import movieDrama from '@/assets/bahubali.jpg';
import movieSpace from '@/assets/rrr.jpg';
import movieOcean from '@/assets/peddi.jpg';
import movieThriller from '@/assets/peddi.jpg';

interface MovieCardProps {
  movie: Movie;
  onClick?: () => void;
}

const moviePosters = [movieMatrix, movieDrama, movieSpace, movieOcean, movieThriller];

const getMoviePoster = (movieId: string) => {
  const hash = movieId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return moviePosters[hash % moviePosters.length];
};

export function MovieCard({ movie, onClick }: MovieCardProps) {
  const poster = getMoviePoster(movie.id);
  
  return (
    <Card className="group premium-card floating-card cursor-pointer border-border/30 overflow-hidden animate-fade-in" onClick={onClick}>
      <div className="relative aspect-[3/4] overflow-hidden">
        <img 
          src={poster} 
          alt={`${movie.title} poster`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <Badge className="absolute top-4 right-4 premium-button text-primary-foreground border-0 font-semibold tracking-wide">
          {movie.symbol}
        </Badge>
        
        <div className="absolute bottom-4 left-4 right-4">
          <CardTitle className="font-playfair text-white text-xl font-bold drop-shadow-2xl line-clamp-2 mb-2">
            {movie.title}
          </CardTitle>
          <div className="text-white/80 text-sm">
            <span className="premium-text font-semibold text-lg">₹{movie.market_price.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6 space-y-4 bg-gradient-to-br from-card via-card to-accent/5">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Market Price</span>
          <span className="text-2xl font-bold premium-text font-playfair">₹{movie.market_price.toFixed(2)}</span>
        </div>
        
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Total Supply</span>
          <span className="text-sm font-semibold text-foreground">{movie.total_supply.toLocaleString()} shares</span>
        </div>
        
        {movie.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {movie.description}
          </p>
        )}
        
        <div className="pt-4 border-t border-border/30">
          <div className="text-xs text-muted-foreground text-center font-medium tracking-wide uppercase">
            Click to Trade
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
