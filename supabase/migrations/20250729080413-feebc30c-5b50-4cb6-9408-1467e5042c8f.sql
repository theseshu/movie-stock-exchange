-- Create the missing update function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  wallet_balance NUMERIC(15,2) NOT NULL DEFAULT 10000.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create profiles policies
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email),
    'user'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing table RLS policies to be user-specific

-- Fix orders table policies
DROP POLICY "Allow all operations on orders" ON public.orders;
CREATE POLICY "Users can view all orders" 
ON public.orders 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create orders" 
ON public.orders 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" 
ON public.orders 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Fix portfolios table policies  
DROP POLICY "Allow all operations on portfolios" ON public.portfolios;
CREATE POLICY "Users can view their own portfolio" 
ON public.portfolios 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage portfolios" 
ON public.portfolios 
FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);

-- Fix trades table policies
DROP POLICY "Allow all operations on trades" ON public.trades;
CREATE POLICY "Users can view trades they participated in" 
ON public.trades 
FOR SELECT 
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "System can create trades" 
ON public.trades 
FOR INSERT 
TO service_role 
WITH CHECK (true);

-- Fix demo_users table - this should be read-only for authenticated users
DROP POLICY "Allow all operations on demo_users" ON public.demo_users;
CREATE POLICY "Authenticated users can view demo users" 
ON public.demo_users 
FOR SELECT 
TO authenticated
USING (true);

-- Movies can remain publicly readable but only admins can modify
DROP POLICY "Allow all operations on movies" ON public.movies;
CREATE POLICY "Anyone can view movies" 
ON public.movies 
FOR SELECT 
USING (true);

CREATE POLICY "Only service role can modify movies" 
ON public.movies 
FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);

-- Create function to get current user's profile safely
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS public.profiles
LANGUAGE sql
SECURITY DEFINER STABLE
AS $$
  SELECT * FROM public.profiles WHERE id = auth.uid();
$$;

-- Update timestamp trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();