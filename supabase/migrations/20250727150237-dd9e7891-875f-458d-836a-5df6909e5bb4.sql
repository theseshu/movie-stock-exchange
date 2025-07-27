-- Fix security warnings by setting search_path on functions

-- Update function to update movie market price after trade
CREATE OR REPLACE FUNCTION update_movie_market_price()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  UPDATE public.movies 
  SET market_price = NEW.price, updated_at = now()
  WHERE id = NEW.movie_id;
  RETURN NEW;
END;
$$;

-- Update function to update portfolio after trade
CREATE OR REPLACE FUNCTION update_portfolio_after_trade()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
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
$$;

-- Update function to update user wallet after trade
CREATE OR REPLACE FUNCTION update_wallet_after_trade()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
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
$$;