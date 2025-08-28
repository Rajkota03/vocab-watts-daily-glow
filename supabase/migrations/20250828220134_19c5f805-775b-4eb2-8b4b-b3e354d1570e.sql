-- Create pricing configuration table
CREATE TABLE public.pricing_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_name TEXT NOT NULL UNIQUE,
  original_price DECIMAL(10,2) NOT NULL,
  discounted_price DECIMAL(10,2),
  discount_enabled BOOLEAN NOT NULL DEFAULT false,
  currency TEXT NOT NULL DEFAULT 'INR',
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pricing_config ENABLE ROW LEVEL SECURITY;

-- Allow public read access for pricing (needed for website display)
CREATE POLICY "Anyone can view pricing config" 
ON public.pricing_config 
FOR SELECT 
USING (true);

-- Only admins can manage pricing
CREATE POLICY "Admins can manage pricing config" 
ON public.pricing_config 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_pricing_config_updated_at
BEFORE UPDATE ON public.pricing_config
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert default pricing
INSERT INTO public.pricing_config (plan_name, original_price, currency, billing_cycle) 
VALUES ('pro', 249.00, 'INR', 'monthly');

-- Create function to get current pricing
CREATE OR REPLACE FUNCTION public.get_current_pricing(plan_name_param text DEFAULT 'pro')
RETURNS TABLE(
  original_price DECIMAL(10,2),
  discounted_price DECIMAL(10,2),
  discount_enabled BOOLEAN,
  currency TEXT,
  billing_cycle TEXT
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    pc.original_price,
    pc.discounted_price,
    pc.discount_enabled,
    pc.currency,
    pc.billing_cycle
  FROM public.pricing_config pc
  WHERE pc.plan_name = plan_name_param
  LIMIT 1;
$function$;