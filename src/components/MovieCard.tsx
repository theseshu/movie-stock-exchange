import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Movie } from '@/types';

interface MovieCardProps {
  movie: Movie;
  onClick?: () => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{movie.title}</CardTitle>
          <Badge variant="secondary">{movie.symbol}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Market Price:</span>
            <span className="font-semibold">${movie.market_price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Supply:</span>
            <span className="text-sm">{movie.total_supply.toLocaleString()}</span>
          </div>
          {movie.description && (
            <p className="text-sm text-muted-foreground mt-2">{movie.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}