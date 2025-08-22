-- Update the delete function to handle foreign key constraints and WHERE clause requirement
CREATE OR REPLACE FUNCTION public.delete_all_vocabulary_words()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count INTEGER;
  history_deleted_count INTEGER;
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- First delete all user_word_history records that reference vocabulary_words
  DELETE FROM public.user_word_history WHERE word_id IS NOT NULL;
  GET DIAGNOSTICS history_deleted_count = ROW_COUNT;
  
  -- Then delete all sent_words records that reference vocabulary_words
  DELETE FROM public.sent_words WHERE word_id IS NOT NULL;

  -- Now delete all vocabulary words with a proper WHERE clause
  DELETE FROM public.vocabulary_words WHERE id IS NOT NULL;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'deleted_count', deleted_count,
    'history_records_deleted', history_deleted_count,
    'success', true,
    'message', format('Successfully deleted %s vocabulary words and %s history records', deleted_count, history_deleted_count)
  );
END;
$function$;