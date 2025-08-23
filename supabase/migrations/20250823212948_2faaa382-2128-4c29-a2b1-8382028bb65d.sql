-- Update existing exam words to use specific exam types
UPDATE public.vocabulary_words 
SET category = 'exam-gre' 
WHERE category = 'exam-intermediate' 
AND id IN (
    SELECT id FROM public.vocabulary_words 
    WHERE category = 'exam-intermediate' 
    ORDER BY created_at 
    LIMIT (SELECT COUNT(*) / 4 FROM public.vocabulary_words WHERE category = 'exam-intermediate')
);

UPDATE public.vocabulary_words 
SET category = 'exam-gmat' 
WHERE category = 'exam-intermediate' 
AND id IN (
    SELECT id FROM public.vocabulary_words 
    WHERE category = 'exam-intermediate' 
    ORDER BY created_at 
    LIMIT (SELECT COUNT(*) / 3 FROM public.vocabulary_words WHERE category = 'exam-intermediate')
);

UPDATE public.vocabulary_words 
SET category = 'exam-toefl' 
WHERE category = 'exam-intermediate' 
AND id IN (
    SELECT id FROM public.vocabulary_words 
    WHERE category = 'exam-intermediate' 
    ORDER BY created_at 
    LIMIT (SELECT COUNT(*) / 2 FROM public.vocabulary_words WHERE category = 'exam-intermediate')
);

UPDATE public.vocabulary_words 
SET category = 'exam-ielts' 
WHERE category = 'exam-intermediate';

-- Update exam-advanced words similarly
UPDATE public.vocabulary_words 
SET category = 'exam-sat' 
WHERE category = 'exam-advanced' 
AND id IN (
    SELECT id FROM public.vocabulary_words 
    WHERE category = 'exam-advanced' 
    ORDER BY created_at 
    LIMIT (SELECT COUNT(*) / 2 FROM public.vocabulary_words WHERE category = 'exam-advanced')
);

UPDATE public.vocabulary_words 
SET category = 'exam-gre' 
WHERE category = 'exam-advanced';

-- Update user subscriptions that have generic exam categories
UPDATE public.user_subscriptions 
SET category = 'exam-gre' 
WHERE category = 'exam-intermediate';

UPDATE public.user_subscriptions 
SET category = 'exam-sat' 
WHERE category = 'exam-advanced';

-- Update sent_words table to match
UPDATE public.sent_words 
SET category = 'exam-gre' 
WHERE category = 'exam-intermediate';

UPDATE public.sent_words 
SET category = 'exam-sat' 
WHERE category = 'exam-advanced';

-- Update user_word_history table to match
UPDATE public.user_word_history 
SET category = 'exam-gre' 
WHERE category = 'exam-intermediate';

UPDATE public.user_word_history 
SET category = 'exam-sat' 
WHERE category = 'exam-advanced';