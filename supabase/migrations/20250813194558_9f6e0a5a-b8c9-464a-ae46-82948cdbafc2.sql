-- Drop existing tables to implement the new schema
DROP TABLE IF EXISTS public.word_schedules CASCADE;
DROP TABLE IF EXISTS public.scheduled_word_sends CASCADE;

-- Create user_delivery_settings table
CREATE TABLE public.user_delivery_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  words_per_day INTEGER NOT NULL DEFAULT 3 CHECK (words_per_day >= 1 AND words_per_day <= 5),
  mode TEXT NOT NULL DEFAULT 'auto' CHECK (mode IN ('auto', 'custom')),
  auto_window_start TIME NOT NULL DEFAULT '09:00',
  auto_window_end TIME NOT NULL DEFAULT '21:00',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_custom_times table
CREATE TABLE public.user_custom_times (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position >= 1 AND position <= 5),
  time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, position)
);

-- Create outbox_messages table
CREATE TABLE public.outbox_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  send_at TIMESTAMP WITH TIME ZONE NOT NULL,
  template TEXT NOT NULL DEFAULT 'glintup_vocab_fulfilment',
  variables JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sending', 'sent', 'failed', 'skipped')),
  retries INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_outbox_messages_send_at_status ON public.outbox_messages(send_at, status);
CREATE INDEX idx_outbox_messages_user_id ON public.outbox_messages(user_id);
CREATE UNIQUE INDEX idx_outbox_messages_unique_send ON public.outbox_messages(user_id, send_at, template);

-- Enable RLS
ALTER TABLE public.user_delivery_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_custom_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbox_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_delivery_settings
CREATE POLICY "Users can manage their own delivery settings"
ON public.user_delivery_settings
FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for user_custom_times
CREATE POLICY "Users can manage their own custom times"
ON public.user_custom_times
FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for outbox_messages
CREATE POLICY "Users can view their own outbox messages"
ON public.outbox_messages
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage outbox messages"
ON public.outbox_messages
FOR ALL
USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_user_delivery_settings_updated_at
  BEFORE UPDATE ON public.user_delivery_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_outbox_messages_updated_at
  BEFORE UPDATE ON public.outbox_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();