-- Fix negative portfolio quantities by removing entries with quantity <= 0
DELETE FROM public.portfolios WHERE quantity <= 0;