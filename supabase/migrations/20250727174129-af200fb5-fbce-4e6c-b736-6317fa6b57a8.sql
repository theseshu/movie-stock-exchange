-- Add unique constraint for user_id and movie_id combination to enable proper ON CONFLICT behavior
ALTER TABLE public.portfolios 
ADD CONSTRAINT portfolios_user_movie_unique UNIQUE (user_id, movie_id);