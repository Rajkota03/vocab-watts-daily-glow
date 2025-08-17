-- Add new columns to vocabulary_words table for enhanced format
ALTER TABLE vocabulary_words 
ADD COLUMN IF NOT EXISTS pronunciation text,
ADD COLUMN IF NOT EXISTS part_of_speech text,
ADD COLUMN IF NOT EXISTS memory_hook text;

-- Update existing vocabulary_words to have default values for new fields
UPDATE vocabulary_words 
SET 
    pronunciation = COALESCE(pronunciation, ''),
    part_of_speech = COALESCE(part_of_speech, 'unknown'),
    memory_hook = COALESCE(memory_hook, '')
WHERE pronunciation IS NULL OR part_of_speech IS NULL OR memory_hook IS NULL;