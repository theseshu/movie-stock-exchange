import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Movie } from '@/types';
import movieMatrix from '@/assets/movie-matrix.jpg';
import movieDrama from '@/assets/movie-drama.jpg';
import movieSpace from '@/assets/movie-space.jpg';
import movieOcean from '@/assets/movie-ocean.jpg';
import movieThriller from '@/assets/movie-thriller.jpg';

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
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden bg-card border border-border/50" onClick={onClick}>
      <div className="relative aspect-[3/4] overflow-hidden">
        <img 
          src={poster} 
          alt={`${movie.title} poster`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground border-0 font-semibold">
          {movie.symbol}
        </Badge>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <CardTitle className="text-white text-lg font-bold drop-shadow-lg line-clamp-2 mb-2">
            {movie.title}
          </CardTitle>
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm font-medium">Current Price</span>
            <span className="text-primary-foreground text-xl font-bold bg-primary px-2 py-1 rounded">
              ₹{(movie.market_price * 83).toFixed(0)}
            </span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3 bg-gradient-to-b from-background to-accent/5">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Market Cap</span>
          <span className="text-sm font-bold text-foreground">
            ₹{((movie.market_price * 83) * movie.total_supply / 10000).toLocaleString()}K
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Shares Outstanding</span>
          <span className="text-sm font-semibold text-muted-foreground">
            {movie.total_supply.toLocaleString()}
          </span>
        </div>
        
        {movie.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {movie.description}
          </p>
        )}
        
        <div className="pt-3 mt-4 border-t border-border/30">
          <div className="flex items-center justify-center">
            <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
              Click to Trade
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}