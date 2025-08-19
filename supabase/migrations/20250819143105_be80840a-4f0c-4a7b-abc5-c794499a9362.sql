-- Create table to track preview word requests for rate limiting
CREATE TABLE public.preview_word_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  word_sent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index for efficient phone number lookups
CREATE INDEX idx_preview_word_requests_phone_created 
ON public.preview_word_requests (phone_number, created_at);

-- Enable RLS
ALTER TABLE public.preview_word_requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow the edge function to insert requests
CREATE POLICY "Allow function to insert preview requests" 
ON public.preview_word_requests 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Create policy to allow admins to view all requests
CREATE POLICY "Admins can view all preview requests" 
ON public.preview_word_requests 
FOR SELECT 
TO authenticated 
USING (has_role(auth.uid(), 'admin'));

-- Create curated starter words table
CREATE TABLE public.starter_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  pronunciation TEXT,
  definition TEXT NOT NULL,
  part_of_speech TEXT,
  example TEXT NOT NULL,
  memory_hook TEXT,
  category TEXT DEFAULT 'starter',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.starter_words ENABLE ROW LEVEL SECURITY;

-- Create policy to allow functions to read active words
CREATE POLICY "Allow functions to read active starter words" 
ON public.starter_words 
FOR SELECT 
TO anon 
USING (is_active = true);

-- Create policy to allow admins to manage starter words
CREATE POLICY "Admins can manage starter words" 
ON public.starter_words 
FOR ALL 
TO authenticated 
USING (has_role(auth.uid(), 'admin'));

-- Insert curated starter words
INSERT INTO public.starter_words (word, pronunciation, definition, part_of_speech, example, memory_hook) VALUES 
('oblivious', 'uh-BLIV-ee-uhs', 'unaware of or not concerned about what is happening around one', 'adjective', 'She walked through the party oblivious to the stares she was attracting.', 'Think "oh-LIVE-us" - living without awareness of your surroundings.'),
('articulate', 'ahr-TIK-yuh-lit', 'having or showing the ability to speak fluently and coherently', 'adjective', 'The articulate speaker captivated the entire audience with her presentation.', 'Think "art-ick-you-late" - your words become art when you speak clearly.'),
('naive', 'nah-EEV', 'showing a lack of experience, wisdom, or judgment', 'adjective', 'It was naive of him to trust the stranger with his life savings.', 'Think "nah-EASE" - saying "nah" to being at ease about dangers.'),
('perplexed', 'per-PLEKST', 'completely baffled; very puzzled', 'adjective', 'The professor looked perplexed by the student''s unusual question.', 'Think "per-FLEX-ed" - your brain is flexing too much trying to understand.'),
('empower', 'em-POW-er', 'give someone the authority or power to do something', 'verb', 'The training program aims to empower employees to make independent decisions.', 'Think "em-POWER" - putting power INTO someone.'),
('refine', 'ri-FAHYN', 'remove impurities or unwanted elements to improve something', 'verb', 'She spent years refining her painting technique to achieve perfection.', 'Think "re-FINE" - making something fine again and again.'),
('eloquent', 'EL-uh-kwent', 'fluent or persuasive in speaking or writing', 'adjective', 'His eloquent speech moved the audience to tears.', 'Think "ELLA-KWENT" - Ella went and spoke beautifully.'),
('inarticulate', 'in-ahr-TIK-yuh-lit', 'unable to speak distinctly or express oneself clearly', 'adjective', 'Nervousness made him inarticulate during the interview.', 'Think "in-ART-ick-you-late" - NOT making art with your words.'),
('illiterate', 'ih-LIT-er-it', 'unable to read or write', 'adjective', 'The literacy program helps illiterate adults learn basic reading skills.', 'Think "ill-LITTER-ate" - being ill at reading letters.'),
('inept', 'in-EPT', 'showing no skill; clumsy', 'adjective', 'His inept handling of the situation made everything worse.', 'Think "in-APT" - NOT apt or suitable for the task.'),
('astute', 'uh-STOOT', 'having or showing an ability to accurately assess situations', 'adjective', 'Her astute observation helped solve the mystery quickly.', 'Think "a-CUTE" - being cute about noticing details.'),
('verbose', 'ver-BOHS', 'using or expressed in more words than are needed', 'adjective', 'The verbose professor took an hour to explain a simple concept.', 'Think "VERB-OOZE" - words oozing out like verbs everywhere.'),
('coherent', 'koh-HEER-uhnt', 'logical and consistent; easy to understand', 'adjective', 'She gave a coherent explanation of the complex scientific theory.', 'Think "co-HERE-ent" - all ideas sticking together HERE.'),
('profound', 'pruh-FOUND', 'having deep insight or great knowledge', 'adjective', 'The philosopher shared profound thoughts about the meaning of life.', 'Think "pro-FOUND" - professionally found deep truths.'),
('superficial', 'soo-per-FISH-uhl', 'existing or occurring at or on the surface; not thorough', 'adjective', 'His superficial knowledge of the subject was quickly exposed.', 'Think "super-FISH-ial" - like a fish swimming only on the surface.');