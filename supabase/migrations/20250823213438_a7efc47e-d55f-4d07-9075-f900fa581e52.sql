-- Consolidate professional and advanced levels
UPDATE public.vocabulary_words 
SET category = 'business-advanced' 
WHERE category = 'business-professional';

UPDATE public.user_subscriptions 
SET category = 'business-advanced' 
WHERE category = 'business-professional';

UPDATE public.sent_words 
SET category = 'business-advanced' 
WHERE category = 'business-professional';

UPDATE public.user_word_history 
SET category = 'business-advanced' 
WHERE category = 'business-professional';

-- Add missing beginner levels for academic and creative
-- We'll generate these through the admin interface later
-- Just noting the structure should be:
-- academic: beginner, intermediate, advanced
-- creative: beginner, intermediate, advanced  
-- interview: beginner, intermediate, advanced (missing advanced)
-- business: beginner, intermediate, advanced (was professional)
-- daily: beginner, intermediate, advanced
-- slang: beginner (missing), intermediate, advanced

-- The exam categories remain separate:
-- exam-gre, exam-gmat, exam-ielts, exam-sat, exam-toefl