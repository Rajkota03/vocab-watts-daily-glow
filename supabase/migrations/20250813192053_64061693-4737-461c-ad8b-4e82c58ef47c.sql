-- Create table for storing user word scheduling preferences
CREATE TABLE public.word_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  is_scheduled BOOLEAN DEFAULT false,
  schedule_times JSONB DEFAULT '["09:00", "12:00", "15:00", "18:00", "21:00"]'::jsonb,
  words_per_slot INTEGER DEFAULT 1,
  total_daily_words INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.word_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own schedules" 
ON public.word_schedules 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own schedules" 
ON public.word_schedules 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules" 
ON public.word_schedules 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules" 
ON public.word_schedules 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_word_schedules_updated_at
BEFORE UPDATE ON public.word_schedules
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create table for tracking individual word sends
CREATE TABLE public.scheduled_word_sends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  category TEXT NOT NULL,
  scheduled_time TIME NOT NULL,
  scheduled_date DATE NOT NULL,
  word_batch_number INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  message_id TEXT,
  error_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scheduled_word_sends ENABLE ROW LEVEL SECURITY;

-- Create policies for user access  
CREATE POLICY "Users can view their own scheduled sends" 
ON public.scheduled_word_sends 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scheduled sends" 
ON public.scheduled_word_sends 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled sends" 
ON public.scheduled_word_sends 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_scheduled_word_sends_updated_at
BEFORE UPDATE ON public.scheduled_word_sends
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for performance
CREATE INDEX idx_word_schedules_user_id ON public.word_schedules(user_id);
CREATE INDEX idx_scheduled_word_sends_user_id ON public.scheduled_word_sends(user_id);
CREATE INDEX idx_scheduled_word_sends_date_time ON public.scheduled_word_sends(scheduled_date, scheduled_time);
CREATE INDEX idx_scheduled_word_sends_status ON public.scheduled_word_sends(status);