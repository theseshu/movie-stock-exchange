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
    <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden bg-gradient-to-br from-background via-background to-muted/20" onClick={onClick}>
      <div className="relative aspect-[3/4] overflow-hidden">
        <img 
          src={poster} 
          alt={`${movie.title} poster`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <Badge className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm text-primary-foreground border-0">
          {movie.symbol}
        </Badge>
        <div className="absolute bottom-3 left-3 right-3">
          <CardTitle className="text-white text-lg font-bold drop-shadow-lg line-clamp-2">
            {movie.title}
          </CardTitle>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Market Price</span>
          <span className="text-lg font-bold text-primary">${movie.market_price.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Total Supply</span>
          <span className="text-sm font-semibold">{movie.total_supply.toLocaleString()} shares</span>
        </div>
        
        {movie.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {movie.description}
          </p>
        )}
        
        <div className="pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground text-center">
            Click to trade
          </div>
        </div>
      </CardContent>
    </Card>
  );
}