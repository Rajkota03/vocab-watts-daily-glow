-- Insert default prompts for better vocabulary difficulty classification
INSERT INTO public.vocab_prompts (category, subcategory, prompt, difficulty_level) VALUES 
  ('daily', 'beginner', 'basic, simple everyday words suitable for elementary to middle school level (grades 3-8). Focus on common, high-frequency words with 1-3 syllables that appear in daily conversations. Examples: "happy", "kitchen", "friend", "weather". Avoid complex vocabulary or specialized terms', 'beginner'),
  
  ('daily', 'intermediate', 'moderate, practical everyday words suitable for high school level (grades 9-12). Include words with 2-4 syllables that are useful but not overly complex. Examples: "appreciate", "responsibility", "environment", "opportunity". Focus on words that educated adults use regularly', 'intermediate'),
  
  ('daily', 'advanced', 'sophisticated everyday vocabulary suitable for college level and professional settings. Include complex words with 3+ syllables and nuanced meanings. Examples: "articulate", "comprehensive", "facilitate", "perspectives". These should be words that demonstrate advanced language proficiency', 'advanced'),
  
  ('business', 'beginner', 'basic business vocabulary suitable for entry-level professionals. Focus on common workplace terms with 1-3 syllables. Examples: "meeting", "project", "client", "budget". Include fundamental business concepts that any office worker would encounter', 'beginner'),
  
  ('business', 'intermediate', 'moderate business vocabulary suitable for mid-level professionals. Include terms with 2-4 syllables used in professional communications. Examples: "strategy", "analysis", "implement", "collaborate". Focus on vocabulary that demonstrates business competency', 'intermediate'),
  
  ('business', 'professional', 'advanced business vocabulary suitable for senior professionals and executives. Include sophisticated terms with 3+ syllables and complex business concepts. Examples: "synergistic", "infrastructure", "optimization", "stakeholder". These should demonstrate executive-level communication skills', 'advanced'),
  
  ('exam', 'gre', 'complex, high-difficulty words commonly found in GRE exams with 3+ syllables and sophisticated meanings. Focus on academic vocabulary that tests advanced verbal reasoning. Examples: "ubiquitous", "cacophony", "obfuscate", "perspicacious". Include words that require deep understanding of nuanced meanings', 'advanced'),
  
  ('exam', 'ielts', 'academic and formal vocabulary suitable for IELTS exams, focusing on clear, precise meanings. Include words used in academic writing and formal communication. Examples: "substantial", "elaborate", "fundamental", "comprehensive". Focus on vocabulary that demonstrates academic English proficiency', 'intermediate'),
  
  ('interview', 'beginner', 'impressive but accessible vocabulary that entry-level candidates can use confidently in job interviews. Focus on 1-3 syllable words that demonstrate professionalism. Examples: "dedicated", "reliable", "teamwork", "goals". Avoid overly complex terms that might sound forced', 'beginner'),
  
  ('interview', 'intermediate', 'professional vocabulary that mid-level candidates can use to stand out in job interviews. Include 2-4 syllable words that demonstrate competence. Examples: "adaptable", "innovative", "analytical", "proactive". Focus on terms that showcase professional skills and mindset', 'intermediate'),
  
  ('interview', 'advanced', 'sophisticated vocabulary that senior-level candidates can use to demonstrate executive presence in interviews. Include complex terms with 3+ syllables. Examples: "strategic", "transformational", "exemplary", "multifaceted". These should convey leadership and advanced expertise', 'advanced');

-- Update the updated_at column trigger for vocab_prompts table
CREATE OR REPLACE TRIGGER set_vocab_prompts_updated_at
BEFORE UPDATE ON public.vocab_prompts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();