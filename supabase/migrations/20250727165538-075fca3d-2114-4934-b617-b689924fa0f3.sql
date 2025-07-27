-- Create trigger to update movie market price after trade execution
CREATE TRIGGER update_movie_price_after_trade
  AFTER INSERT ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_movie_market_price();