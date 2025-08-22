-- Create a function to delete all vocabulary words (for admins only)
CREATE OR REPLACE FUNCTION public.delete_all_vocabulary_words()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Delete all vocabulary words and get count
  DELETE FROM public.vocabulary_words;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'deleted_count', deleted_count,
    'success', true,
    'message', format('Successfully deleted %s vocabulary words', deleted_count)
  );
END;
$function$;