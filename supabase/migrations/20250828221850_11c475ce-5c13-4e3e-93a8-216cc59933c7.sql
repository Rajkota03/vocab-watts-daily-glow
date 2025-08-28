-- Enable real-time updates for pricing_config table
ALTER TABLE public.pricing_config REPLICA IDENTITY FULL;

-- Add the pricing_config table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.pricing_config;