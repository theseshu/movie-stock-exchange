-- Create demo users table
CREATE TABLE public.demo_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  wallet_balance DECIMAL(15,2) DEFAULT 10000.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create movies table
CREATE TABLE public.movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  total_supply BIGINT NOT NULL DEFAULT 1000000,
  market_price DECIMAL(10,2) NOT NULL DEFAULT 100.00,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.demo_users(id) ON DELETE CASCADE,
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  order_type TEXT NOT NULL CHECK (order_type IN ('buy', 'sell')),
  price DECIMAL(10,2) NOT NULL,
  quantity BIGINT NOT NULL,
  filled_quantity BIGINT DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'filled', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create trades table
CREATE TABLE public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES public.demo_users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES public.demo_users(id) ON DELETE CASCADE,
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  buy_order_id UUID REFERENCES public.orders(id),
  sell_order_id UUID REFERENCES public.orders(id),
  price DECIMAL(10,2) NOT NULL,
  quantity BIGINT NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create portfolios table
CREATE TABLE public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.demo_users(id) ON DELETE CASCADE,
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  quantity BIGINT DEFAULT 0,
  average_price DECIMAL(10,2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

-- Enable RLS on all tables
ALTER TABLE public.demo_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for demo purposes)
CREATE POLICY "Allow all operations on demo_users" ON public.demo_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on movies" ON public.movies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on trades" ON public.trades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on portfolios" ON public.portfolios FOR ALL USING (true) WITH CHECK (true);

-- Insert demo users
INSERT INTO public.demo_users (username, display_name, role, wallet_balance) VALUES
('user1', 'User 1', 'user', 10000.00),
('user2', 'User 2', 'user', 10000.00),
('admin', 'Admin', 'admin', 50000.00);

-- Insert sample movies
INSERT INTO public.movies (symbol, title, total_supply, market_price, description) VALUES
('PEDDI', 'Peddi', 1000000, 100.00, 'Telugu blockbuster movie'),
('BAHUBALI', 'Bahubali', 2000000, 250.00, 'Epic Telugu movie'),
('RRR', 'RRR', 1500000, 300.00, 'Period action drama');

-- Function to update movie market price after trade
CREATE OR REPLACE FUNCTION update_movie_market_price()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.movies 
  SET market_price = NEW.price, updated_at = now()
  WHERE id = NEW.movie_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update market price after each trade
CREATE TRIGGER update_market_price_trigger
  AFTER INSERT ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION update_movie_market_price();

-- Function to update portfolio after trade
CREATE OR REPLACE FUNCTION update_portfolio_after_trade()
RETURNS TRIGGER AS $$
BEGIN
  -- Update buyer's portfolio
  INSERT INTO public.portfolios (user_id, movie_id, quantity, average_price, updated_at)
  VALUES (NEW.buyer_id, NEW.movie_id, NEW.quantity, NEW.price, now())
  ON CONFLICT (user_id, movie_id)
  DO UPDATE SET
    quantity = portfolios.quantity + NEW.quantity,
    average_price = (portfolios.average_price * portfolios.quantity + NEW.price * NEW.quantity) / (portfolios.quantity + NEW.quantity),
    updated_at = now();

  -- Update seller's portfolio
  UPDATE public.portfolios
  SET quantity = quantity - NEW.quantity, updated_at = now()
  WHERE user_id = NEW.seller_id AND movie_id = NEW.movie_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update portfolios after trade
CREATE TRIGGER update_portfolio_trigger
  AFTER INSERT ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION update_portfolio_after_trade();

-- Function to update user wallet after trade
CREATE OR REPLACE FUNCTION update_wallet_after_trade()
RETURNS TRIGGER AS $$
DECLARE
  trade_value DECIMAL(15,2);
BEGIN
  trade_value := NEW.price * NEW.quantity;
  
  -- Deduct from buyer's wallet
  UPDATE public.demo_users
  SET wallet_balance = wallet_balance - trade_value
  WHERE id = NEW.buyer_id;
  
  -- Add to seller's wallet
  UPDATE public.demo_users
  SET wallet_balance = wallet_balance + trade_value
  WHERE id = NEW.seller_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update wallets after trade
CREATE TRIGGER update_wallet_trigger
  AFTER INSERT ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_after_trade();

-- Enable realtime for all tables
ALTER TABLE public.demo_users REPLICA IDENTITY FULL;
ALTER TABLE public.movies REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.trades REPLICA IDENTITY FULL;
ALTER TABLE public.portfolios REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.demo_users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.movies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;
ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolios;