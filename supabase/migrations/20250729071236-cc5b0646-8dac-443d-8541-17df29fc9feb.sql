-- Create storage bucket for movie images
INSERT INTO storage.buckets (id, name, public) VALUES ('movie-images', 'movie-images', true);

-- Add image_url column to movies table
ALTER TABLE public.movies ADD COLUMN image_url TEXT;

-- Create storage policies for movie images
CREATE POLICY "Movie images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'movie-images');

CREATE POLICY "Admins can upload movie images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'movie-images');

CREATE POLICY "Admins can update movie images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'movie-images');

CREATE POLICY "Admins can delete movie images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'movie-images');