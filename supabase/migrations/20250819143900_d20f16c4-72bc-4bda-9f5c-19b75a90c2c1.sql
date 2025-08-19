-- Clear existing starter words and add the fixed 5 words
DELETE FROM public.starter_words;

-- Insert the fixed 5 words with proper sentiment and formatting
INSERT INTO public.starter_words (word, pronunciation, definition, part_of_speech, example, memory_hook, category, is_active) VALUES 
('Inarticulate', 'in-ahr-TIK-yuh-lit', 'unable to speak distinctly or express oneself clearly', 'adjective', 'Nervousness made him inarticulate during the important presentation.', 'Think "in-ART-ick-you-late" - NOT making art with your words.', 'challenging', true),
('Eloquent', 'EL-uh-kwent', 'fluent or persuasive in speaking or writing', 'adjective', 'Her eloquent speech moved the entire audience to tears.', 'Think "ELLA-KWENT" - Ella went and spoke beautifully.', 'aspirational', true),
('Ignorant', 'IG-ner-uhnt', 'lacking knowledge or awareness in general; uneducated', 'adjective', 'He was completely ignorant of the basic facts about the subject.', 'Think "ignore-ANT" - like an ant that ignores knowledge.', 'challenging', true),
('Mediocre', 'mee-dee-OH-ker', 'of only moderate quality; not very good', 'adjective', 'The restaurant served mediocre food that left customers disappointed.', 'Think "MEDIA-OKRA" - media coverage that''s just okay, like bland okra.', 'challenging', true),
('Articulate', 'ahr-TIK-yuh-lit', 'having or showing the ability to speak fluently and coherently', 'adjective', 'The articulate speaker captivated the entire audience with her presentation.', 'Think "art-ick-you-late" - your words become art when you speak clearly.', 'aspirational', true);