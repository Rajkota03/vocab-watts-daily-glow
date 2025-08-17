-- Update existing prompts to follow the new level-based guardrails

-- Update Daily Beginner prompt
UPDATE vocab_prompts 
SET prompt = 'Generate simple, practical, useful English words suitable for beginner learners.
GUARDRAILS:
✅ Simple words that are common in school, home, and casual conversations
✅ Words should feel like an upgrade from basic vocabulary
✅ Focus on words that add real value beyond ultra-basic terms
❌ Do NOT include babyish/ultra-basic words like: eat, run, big, happy, food, rain, friend, good, bad, nice, small, go, come, see, know
❌ Avoid overly simple baby words that feel obvious
✅ Examples of appropriate level: borrow, polite, confuse, promise, neighbor, proud, avoid, sudden, familiar, curious
Keep syllables mostly 1-3 for simplicity but ensure the word feels valuable to learn.'
WHERE category = 'daily' AND subcategory = 'beginner';

-- Update Daily Intermediate prompt  
UPDATE vocab_prompts 
SET prompt = 'Generate conversational upgrade vocabulary suitable for intermediate learners (teens, students, everyday professional use).
GUARDRAILS:
✅ One level above beginner - suitable for high school level and everyday professional conversations
✅ Words that enhance daily communication and feel sophisticated but not academic
❌ Do NOT include advanced/professional words like: meticulous, benevolent, eloquent, pragmatic
❌ Do NOT include beginner-level words that would feel too basic
✅ Examples of appropriate level: reluctant, generous, essential, regret, sincere, distract, predict, appreciate, responsibility, environment, opportunity
Focus on words with 2-4 syllables that educated adults use regularly in conversations.'
WHERE category = 'daily' AND subcategory = 'intermediate';

-- Update Daily Professional prompt
UPDATE vocab_prompts 
SET prompt = 'Generate sophisticated, professional vocabulary suitable for advanced daily communication.
GUARDRAILS:
✅ Polished and nuanced vocabulary for professional, academic, or formal conversations
✅ Words that sound impressive and educated without being pretentious
❌ Avoid rare/archaic/test-only words that are never used in real conversation
❌ Do NOT include intermediate-level words that would feel too basic for this level
✅ Examples of appropriate level: meticulous, eloquent, ambiguous, obsolete, pragmatic, serene, vulnerable, comprehensive, innovative, strategic
Focus on words that enhance professional communication and demonstrate sophistication.'
WHERE category = 'daily' AND subcategory = 'professional';

-- Add prompts for exam categories with mastery-level guardrails
INSERT INTO vocab_prompts (category, subcategory, prompt, difficulty_level) VALUES
('exam', 'gre', 'Generate academic/literary/test-prep level vocabulary for GRE preparation.
GUARDRAILS:
✅ Academic, literary, and standardized test level vocabulary
✅ Complex words that demonstrate high-level English proficiency
✅ Words commonly found in GRE exams and academic texts
❌ Do NOT include daily conversation words that would be too basic for test prep
✅ Examples of appropriate level: ubiquitous, ephemeral, magnanimous, anomaly, idiosyncrasy, erudite, perspicacious, sanguine, querulous, perfunctory
Focus on sophisticated vocabulary that enhances academic writing and reading comprehension.', 'mastery')
ON CONFLICT (category, subcategory) DO UPDATE SET 
prompt = EXCLUDED.prompt,
difficulty_level = EXCLUDED.difficulty_level;

INSERT INTO vocab_prompts (category, subcategory, prompt, difficulty_level) VALUES
('exam', 'ielts', 'Generate academic vocabulary suitable for IELTS exam preparation with clear, precise meanings.
GUARDRAILS:
✅ Academic and formal vocabulary suitable for IELTS exams
✅ Words that demonstrate advanced English proficiency for academic contexts
✅ Clear, precise meanings that work well in formal writing and speaking
❌ Avoid overly archaic or literary words that are impractical for IELTS
✅ Examples: substantial, comprehensive, Nevertheless, Furthermore, subsequent, preliminary, deteriorate, fluctuate, predominant
Focus on vocabulary that enhances academic communication and demonstrates language proficiency.', 'advanced')
ON CONFLICT (category, subcategory) DO UPDATE SET 
prompt = EXCLUDED.prompt,
difficulty_level = EXCLUDED.difficulty_level;