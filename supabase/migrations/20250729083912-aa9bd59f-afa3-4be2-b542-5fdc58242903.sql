-- Update RLS policy for orders to work with demo users
DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;

-- Create new policy that allows demo users to create orders
CREATE POLICY "Demo users can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.demo_users 
    WHERE id = orders.user_id
  )
);

-- Also update the update policy to work with demo users
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

CREATE POLICY "Demo users can update their own orders" 
ON public.orders 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.demo_users 
    WHERE id = orders.user_id
  )
);