
-- Create a function to safely get WhatsApp message status
CREATE OR REPLACE FUNCTION public.get_whatsapp_message_status(message_sid_param TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT json_agg(status_data)::JSONB INTO result
  FROM (
    SELECT 
      id,
      message_sid,
      status,
      error_code,
      error_message,
      to_number,
      from_number,
      created_at
    FROM public.whatsapp_message_status 
    WHERE message_sid = message_sid_param
    ORDER BY created_at DESC
    LIMIT 1
  ) AS status_data;
  
  RETURN COALESCE(result, '[]'::JSONB);
END;
$$;

-- Grant access to the function for all users
GRANT EXECUTE ON FUNCTION public.get_whatsapp_message_status(TEXT) TO PUBLIC;
