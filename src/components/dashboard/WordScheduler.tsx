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
  wordCount: number; // Added word count from learning settings
  scheduleMode: 'auto' | 'custom'; // Added schedule mode from learning settings
}

interface DeliverySettings {
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
  isPro,
  wordCount, // Use external word count
  scheduleMode // Use external schedule mode
}) => {
  const [settings, setSettings] = useState<DeliverySettings>({
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

  // Update custom times when word count changes
  useEffect(() => {
    if (scheduleMode === 'custom') {
      const newCustomTimes = [...settings.customTimes];
      // Extend or trim the custom times array to match word count
      while (newCustomTimes.length < wordCount) {
        newCustomTimes.push('09:00');
      }
      setSettings(prev => ({
        ...prev,
        customTimes: newCustomTimes
      }));
    } else {
      // For auto mode, regenerate times
      setSettings(prev => ({
        ...prev,
        customTimes: generateAutoTimes(wordCount)
      }));
    }
  }, [wordCount, scheduleMode]);

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

        const times = customTimes?.map(ct => ct.time) || generateAutoTimes(wordCount);

        setSettings({
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
    if (scheduleMode === 'auto') {
      return generateAutoTimes(wordCount);
    }
    return settings.customTimes.slice(0, wordCount);
  };


  const handleCustomTimeChange = (index: number, newTime: string) => {
    const newTimes = [...settings.customTimes];
    newTimes[index] = newTime;
    
    // Check for duplicates
    const uniqueTimes = new Set(newTimes.slice(0, wordCount));
    if (uniqueTimes.size !== wordCount) {
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
          words_per_day: wordCount, // Use external word count
          mode: scheduleMode, // Use external schedule mode
          auto_window_start: settings.autoWindowStart,
          auto_window_end: settings.autoWindowEnd,
          timezone: settings.timezone
        });

      if (settingsError) throw settingsError;

      // Save custom times if in custom mode
      if (scheduleMode === 'custom') {
        // Delete existing custom times
        await supabase
          .from('user_custom_times')
          .delete()
          .eq('user_id', userId);

        // Insert new custom times
        const customTimesData = settings.customTimes
          .slice(0, wordCount)
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
        description: `Your ${wordCount} words will be spaced perfectly across the day.`
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
    <div className="pb-20 md:pb-0 -mx-2 md:mx-0">
      {/* Sleek Schedule Card */}
      <MotionCard 
        className="rounded-xl border border-slate-200 bg-white p-4 md:p-5 mx-2 md:mx-0 shadow-[0_1px_2px_rgba(0,0,0,.06)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Sleek Timeline Preview / Modern Custom Times */}
        {scheduleMode === 'auto' ? (
          <div className="mb-6">
            <div className="text-[13px] leading-5 font-medium text-slate-600 mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-teal-500 rounded-full"></div>
              Smart spacing preview
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hidden">
              {previewTimes.map((time, index) => (
                <MotionDiv
                  key={index}
                  className="min-w-[70px] flex flex-col items-center gap-2 flex-shrink-0 p-2 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg border border-teal-200"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ duration: 0.15 }}
                >
                  <motion.div 
                    className="w-2 h-2 bg-teal-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.8, delay: index * 0.1, repeat: Infinity, repeatDelay: 2 }}
                  />
                  <span className="text-[11px] leading-4 font-semibold text-teal-700">{time}</span>
                  <span className="text-[10px] leading-3 text-teal-600">#{index + 1}</span>
                </MotionDiv>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="text-[13px] leading-5 font-medium text-slate-600 mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-slate-500 rounded-full"></div>
              Custom delivery times
            </div>
            <div className="space-y-2">
              {Array.from({ length: wordCount }, (_, index) => (
                <MotionDiv
                  key={index}
                  className="flex items-center gap-3 h-11 px-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="w-5 h-5 bg-gradient-to-br from-slate-600 to-slate-700 text-white rounded-full flex items-center justify-center text-[10px] leading-3 font-bold">
                    {index + 1}
                  </div>
                  <span className="text-[13px] leading-5 font-medium text-slate-700 flex-1">
                    Word {index + 1}
                  </span>
                  <Input
                    type="time"
                    value={settings.customTimes[index] || '09:00'}
                    onChange={(e) => handleCustomTimeChange(index, e.target.value)}
                    className="w-16 h-7 text-[11px] leading-4 border-slate-300 rounded-md bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    min="06:00"
                    max="23:00"
                  />
                </MotionDiv>
              ))}
            </div>
          </div>
        )}

        {/* Minimal Timeline Summary */}
        <div className="border-t border-slate-100 pt-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hidden">
            {previewTimes.map((time, index) => (
              <MotionDiv
                key={index}
                className="flex-shrink-0 bg-white border border-slate-200 rounded-full px-2 py-1 text-[10px] leading-3 font-medium text-slate-600 whitespace-nowrap"
                whileHover={{ scale: 1.05, borderColor: "rgb(20 184 166)" }}
                transition={{ duration: 0.12 }}
              >
                #{index + 1} • {time}
              </MotionDiv>
            ))}
          </div>
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
          {wordCount} words • spaced today
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