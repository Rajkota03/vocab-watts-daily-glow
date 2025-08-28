-- Fix the pricing config where discount is enabled but no discounted price is set
-- Let's set a reasonable discount price of ₹199 (20% off from ₹249)
UPDATE pricing_config 
SET discounted_price = 199.00
WHERE plan_name = 'pro' AND discount_enabled = true AND discounted_price IS NULL;