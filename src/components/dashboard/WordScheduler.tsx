import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Calendar, Target, Info, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

interface WordSchedulerProps {
  userId: string;
  phoneNumber?: string;
  category: string;
  isPro: boolean;
}

interface DeliverySettings {
  wordsPerDay: number;
  mode: 'auto' | 'custom';
  autoWindowStart: string;
  autoWindowEnd: string;
  timezone: string;
  customTimes: string[];
}

const timeSlotEmojis = ['🌅', '☀️', '🌤️', '🌆', '🌙'];

const MotionButton = motion(Button);
const MotionCard = motion(Card);
const MotionDiv = motion.div;

const WordScheduler: React.FC<WordSchedulerProps> = ({ 
  userId, 
  phoneNumber, 
  category, 
  isPro 
}) => {
  const [settings, setSettings] = useState<DeliverySettings>({
    wordsPerDay: 3,
    mode: 'auto',
    autoWindowStart: '09:00',
    autoWindowEnd: '21:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    customTimes: ['09:00', '12:00', '15:00', '18:00', '21:00']
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserSettings();
  }, [userId]);

  const fetchUserSettings = async () => {
    try {
      const { data: deliverySettings, error: settingsError } = await supabase
        .from('user_delivery_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('Error fetching delivery settings:', settingsError);
        return;
      }

      if (deliverySettings) {
        const { data: customTimes, error: timesError } = await supabase
          .from('user_custom_times')
          .select('*')
          .eq('user_id', userId)
          .order('position');

        const times = customTimes?.map(ct => ct.time) || generateAutoTimes(deliverySettings.words_per_day);

        setSettings({
          wordsPerDay: deliverySettings.words_per_day,
          mode: deliverySettings.mode as 'auto' | 'custom',
          autoWindowStart: deliverySettings.auto_window_start,
          autoWindowEnd: deliverySettings.auto_window_end,
          timezone: deliverySettings.timezone,
          customTimes: times
        });
      }
    } catch (error) {
      console.error('Error fetching user settings:', error);
    }
  };

  const generateAutoTimes = (wordCount: number) => {
    const start = 9; // 9 AM
    const end = 21; // 9 PM
    const interval = (end - start) / Math.max(1, wordCount - 1);
    
    return Array.from({ length: wordCount }, (_, i) => {
      const hour = Math.round(start + (i * interval));
      return `${hour.toString().padStart(2, '0')}:00`;
    });
  };

  const getPreviewTimes = () => {
    if (settings.mode === 'auto') {
      return generateAutoTimes(settings.wordsPerDay);
    }
    return settings.customTimes.slice(0, settings.wordsPerDay);
  };

  const handleWordsPerDayChange = (value: number[]) => {
    const newCount = value[0];
    const newSettings = { 
      ...settings, 
      wordsPerDay: newCount,
      customTimes: settings.mode === 'auto' 
        ? generateAutoTimes(newCount)
        : settings.customTimes.slice(0, newCount)
    };
    setSettings(newSettings);
  };

  const handleModeToggle = (enabled: boolean) => {
    const newMode: 'auto' | 'custom' = enabled ? 'custom' : 'auto';
    const newSettings: DeliverySettings = { 
      ...settings, 
      mode: newMode,
      customTimes: newMode === 'auto' 
        ? generateAutoTimes(settings.wordsPerDay)
        : settings.customTimes
    };
    setSettings(newSettings);
  };

  const handleCustomTimeChange = (index: number, newTime: string) => {
    const newTimes = [...settings.customTimes];
    newTimes[index] = newTime;
    
    // Check for duplicates
    const uniqueTimes = new Set(newTimes.slice(0, settings.wordsPerDay));
    if (uniqueTimes.size !== settings.wordsPerDay) {
      toast({
        title: "Times must be different",
        description: "Please choose different times for each word delivery.",
        variant: "destructive"
      });
      return;
    }
    
    setSettings({ ...settings, customTimes: newTimes });
  };

  const saveSettings = async () => {
    if (!userId) return;
    
    setSaving(true);
    try {
      // Save delivery settings
      const { error: settingsError } = await supabase
        .from('user_delivery_settings')
        .upsert({
          user_id: userId,
          words_per_day: settings.wordsPerDay,
          mode: settings.mode,
          auto_window_start: settings.autoWindowStart,
          auto_window_end: settings.autoWindowEnd,
          timezone: settings.timezone
        });

      if (settingsError) throw settingsError;

      // Save custom times if in custom mode
      if (settings.mode === 'custom') {
        // Delete existing custom times
        await supabase
          .from('user_custom_times')
          .delete()
          .eq('user_id', userId);

        // Insert new custom times
        const customTimesData = settings.customTimes
          .slice(0, settings.wordsPerDay)
          .map((time, index) => ({
            user_id: userId,
            position: index + 1,
            time: time
          }));

        const { error: timesError } = await supabase
          .from('user_custom_times')
          .insert(customTimesData);

        if (timesError) throw timesError;
      }

      // Schedule today's words
      await scheduleToday();

      toast({
        title: "Schedule saved! 🎉",
        description: `Your ${settings.wordsPerDay} words will be spaced perfectly across the day.`
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Failed to save schedule",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const scheduleToday = async () => {
    if (!phoneNumber) return;
    
    try {
      const { error } = await supabase.functions.invoke('schedule-today', {
        body: {
          userId: userId,
          phoneNumber: phoneNumber,
          category: category
        }
      });

      if (error) {
        console.error('Error scheduling today\'s words:', error);
      }
    } catch (error) {
      console.error('Error calling schedule-today function:', error);
    }
  };

  const handleSendNow = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone Number Missing",
        description: "Your WhatsApp number is not configured.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-send', {
        body: {
          to: phoneNumber,
          category: category,
          isPro: isPro,
          sendImmediately: true,
          debugMode: true,
          message: `Here are your daily vocabulary words for ${category}. Enjoy learning!`
        }
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || "Failed to send words");
      }

      toast({
        title: "Words sent! 🚀",
        description: "Check your WhatsApp for today's vocabulary."
      });
    } catch (error: any) {
      toast({
        title: "Failed to send words",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const previewTimes = getPreviewTimes();

  return (
    <div className="pb-20 md:pb-0">
      {/* Hero Card */}
      <MotionCard 
        className="rounded-xl border border-slate-200 bg-white p-4 md:p-5 shadow-[0_1px_2px_rgba(0,0,0,.06)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-[20px] leading-7 font-semibold flex items-center gap-2">
            Words per day & schedule 📅
          </h3>
          <p className="text-[12px] leading-4 text-slate-500 mt-1">
            Each word lands at a different time. Tiny sips win.
          </p>
        </div>

        {/* Daily Word Count */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[14px] leading-5 font-medium">Daily words</span>
            <span className="px-2 py-1 bg-slate-100 rounded-full text-[12px] leading-4 font-semibold">
              {settings.wordsPerDay} words
            </span>
          </div>
          
          <input
            type="range"
            min={1}
            max={5}
            value={settings.wordsPerDay}
            onChange={(e) => handleWordsPerDayChange([parseInt(e.target.value)])}
            className="w-full h-3 accent-teal-600"
          />
          
          <div className="flex justify-between text-[12px] leading-4 text-slate-500 mt-1">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
          
          <p className="text-[12px] leading-4 text-teal-700 mt-1">
            Spaced drops beat big dumps. 📈
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-[14px] leading-5 font-medium flex items-center gap-2">
                Let me choose delivery times
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-slate-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-[12px] leading-4">
                        We distribute your words from morning to evening so your memory gets multiple small nudges.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <p className="text-[12px] leading-4 text-slate-500 mt-1">
                Else we'll auto-space your words.
              </p>
            </div>
            <motion.div
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              <Switch
                checked={settings.mode === 'custom'}
                onCheckedChange={handleModeToggle}
              />
            </motion.div>
          </div>
        </div>

        {/* Timeline Preview / Custom Times */}
        {settings.mode === 'auto' ? (
          <div className="mb-6">
            <Label className="text-[14px] leading-5 font-medium mb-3 block flex items-center gap-2">
              <Target className="h-4 w-4 text-teal-600" />
              Preview
            </Label>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hidden">
              {previewTimes.map((time, index) => (
                <MotionDiv
                  key={index}
                  className="min-w-[80px] flex flex-col items-center gap-1 flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.12 }}
                >
                  <span className="text-[12px] leading-4 text-slate-500 px-2 py-1 bg-slate-100 rounded-full">
                    Word {index + 1}
                  </span>
                  <motion.div 
                    className="w-3 h-3 bg-teal-600 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                  <span className="text-[12px] leading-4 font-medium">{time}</span>
                </MotionDiv>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <Label className="text-[14px] leading-5 font-medium mb-3 block flex items-center gap-2">
              <Clock className="h-4 w-4 text-teal-600" />
              Custom times
            </Label>
            <div className="space-y-2">
              {Array.from({ length: settings.wordsPerDay }, (_, index) => (
                <MotionDiv
                  key={index}
                  className="flex items-center gap-3 h-12 p-2 bg-slate-50 rounded-lg"
                  whileHover={{ backgroundColor: "rgb(248 250 252)" }}
                  transition={{ duration: 0.12 }}
                >
                  <div className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-[12px] leading-4 font-semibold">
                    {index + 1}
                  </div>
                  <span className="text-[14px] leading-5 font-medium flex-1">
                    Word {index + 1}
                  </span>
                  <Input
                    type="time"
                    value={settings.customTimes[index] || '09:00'}
                    onChange={(e) => handleCustomTimeChange(index, e.target.value)}
                    className="w-20 h-8 text-[12px] leading-4 border-slate-300"
                    min="06:00"
                    max="23:00"
                  />
                </MotionDiv>
              ))}
            </div>
          </div>
        )}

        {/* Timeline Chips */}
        <div>
          <Label className="text-[14px] leading-5 font-medium mb-3 block flex items-center gap-2">
            <Calendar className="h-4 w-4 text-teal-600" />
            Today's timeline
          </Label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hidden">
            {previewTimes.map((time, index) => (
              <MotionDiv
                key={index}
                className="flex-shrink-0 bg-slate-100 rounded-full px-3 py-1 text-[12px] leading-4 font-medium whitespace-nowrap"
                whileHover={{ scale: 1.05, backgroundColor: "rgb(226 232 240)" }}
                transition={{ duration: 0.12 }}
              >
                Word {index + 1} • {time}
              </MotionDiv>
            ))}
          </div>
          <p className="text-[12px] leading-4 text-teal-700 mt-2">
            We never drop two words at once.
          </p>
        </div>
      </MotionCard>

      {/* Sticky Apply Bar (Mobile) */}
      <motion.div 
        className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t px-4 h-14 flex items-center justify-between md:hidden z-50"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <span className="text-[12px] leading-4 text-slate-600">
          {settings.wordsPerDay} words • spaced today
        </span>
        <div className="flex gap-2">
          <MotionButton
            variant="ghost"
            size="sm"
            onClick={handleSendNow}
            disabled={loading || !phoneNumber}
            className="h-10 px-3 text-[12px] leading-4 border-slate-300 text-slate-800 hover:bg-slate-50"
            whileTap={{ scale: 0.98 }}
          >
            <Send className="h-3 w-3 mr-1" />
            {loading ? "Sending..." : "Send Now"}
          </MotionButton>
          <MotionButton
            onClick={saveSettings}
            disabled={saving}
            className="h-10 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[12px] leading-4"
            whileTap={{ scale: 0.98 }}
          >
            {saving ? "Saving..." : "Apply"}
          </MotionButton>
        </div>
      </motion.div>

      {/* Desktop Actions */}
      <div className="hidden md:flex md:gap-2 md:mt-4">
        <MotionButton
          onClick={saveSettings}
          disabled={saving}
          className="flex-1 h-10 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold"
          whileTap={{ scale: 0.98 }}
        >
          {saving ? "Saving..." : "Apply"}
        </MotionButton>
        <MotionButton
          variant="outline"
          onClick={handleSendNow}
          disabled={loading || !phoneNumber}
          className="h-10 px-4 border-slate-300 text-slate-800 hover:bg-slate-50"
          whileTap={{ scale: 0.98 }}
        >
          <Send className="h-4 w-4 mr-2" />
          {loading ? "Sending..." : "Send Now"}
        </MotionButton>
      </div>
    </div>
  );
};

export default WordScheduler;