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
import { format, parse } from 'date-fns';
interface WordSchedulerProps {
  userId: string;
  phoneNumber?: string;
  category: string;
  isPro: boolean;
  wordCount: number; // Added word count from learning settings
}
interface DeliverySettings {
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
  isPro,
  wordCount // Use external word count
}) => {
  const [settings, setSettings] = useState<DeliverySettings>({
    mode: 'auto',
    autoWindowStart: '09:00',
    autoWindowEnd: '21:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    customTimes: ['09:00', '12:00', '15:00', '18:00', '21:00']
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const {
    toast
  } = useToast();
  useEffect(() => {
    fetchUserSettings();
  }, [userId]);

  // Update custom times when word count changes
  useEffect(() => {
    console.log('WordScheduler - Word count changed to:', wordCount);
    const newCustomTimes = [...settings.customTimes];

    // Extend or trim the custom times array to match word count
    while (newCustomTimes.length < wordCount) {
      newCustomTimes.push('09:00');
    }

    // Update settings for both modes
    setSettings(prev => ({
      ...prev,
      customTimes: newCustomTimes.slice(0, wordCount)
    }));
  }, [wordCount]);

  // Helper function to convert 24-hour to 12-hour format
  const formatTimeTo12Hour = (time24: string): string => {
    try {
      const date = parse(time24, 'HH:mm', new Date());
      return format(date, 'h:mm a');
    } catch (error) {
      return time24; // fallback to original format if parsing fails
    }
  };

  // Helper function to convert 12-hour to 24-hour format
  const formatTimeTo24Hour = (time12: string): string => {
    try {
      const date = parse(time12, 'h:mm a', new Date());
      return format(date, 'HH:mm');
    } catch (error) {
      return time12; // fallback to original format if parsing fails
    }
  };
  const fetchUserSettings = async () => {
    try {
      const {
        data: deliverySettings,
        error: settingsError
      } = await supabase.from('user_delivery_settings').select('*').eq('user_id', userId).single();
      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('Error fetching delivery settings:', settingsError);
        return;
      }
      if (deliverySettings) {
        const {
          data: customTimes,
          error: timesError
        } = await supabase.from('user_custom_times').select('*').eq('user_id', userId).order('position');
        const times = customTimes?.map(ct => ct.time) || generateAutoTimes(wordCount);
        setSettings({
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
    return Array.from({
      length: wordCount
    }, (_, i) => {
      const hour = Math.round(start + i * interval);
      return `${hour.toString().padStart(2, '0')}:00`;
    });
  };
  const getPreviewTimes = () => {
    if (settings.mode === 'auto') {
      return generateAutoTimes(wordCount);
    }
    return settings.customTimes.slice(0, wordCount);
  };
  const handleModeToggle = (enabled: boolean) => {
    const newMode: 'auto' | 'custom' = enabled ? 'custom' : 'auto';
    const newSettings: DeliverySettings = {
      ...settings,
      mode: newMode,
      customTimes: newMode === 'auto' ? generateAutoTimes(wordCount) : settings.customTimes
    };
    setSettings(newSettings);
  };
  const handleCustomTimeChange = (index: number, newTime: string) => {
    // Convert 12-hour input to 24-hour for storage
    const time24 = formatTimeTo24Hour(newTime);
    const newTimes = [...settings.customTimes];
    newTimes[index] = time24;

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
    setSettings({
      ...settings,
      customTimes: newTimes
    });
  };
  const saveSettings = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      // Save delivery settings
      const {
        error: settingsError
      } = await supabase.from('user_delivery_settings').upsert({
        user_id: userId,
        words_per_day: wordCount,
        // Use external word count
        mode: settings.mode,
        auto_window_start: settings.autoWindowStart,
        auto_window_end: settings.autoWindowEnd,
        timezone: settings.timezone
      });
      if (settingsError) throw settingsError;

      // Save custom times if in custom mode
      if (settings.mode === 'custom') {
        // Delete existing custom times
        await supabase.from('user_custom_times').delete().eq('user_id', userId);

        // Insert new custom times
        const customTimesData = settings.customTimes.slice(0, wordCount).map((time, index) => ({
          user_id: userId,
          position: index + 1,
          time: time
        }));
        const {
          error: timesError
        } = await supabase.from('user_custom_times').insert(customTimesData);
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
      const {
        error
      } = await supabase.functions.invoke('schedule-today', {
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
      const {
        data,
        error
      } = await supabase.functions.invoke('whatsapp-send', {
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
  return <div className="pb-20 md:pb-0 -mx-2 md:mx-0">
      {/* Sleek Schedule Card */}
      <MotionCard initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.3
    }} className="rounded-xl border border-slate-200 bg-white p-4 md:p-5 md:mx-0 shadow-[0_1px_2px_rgba(0,0,0,.06)] mx-0 px-[11px] py-[17px]">
        {/* Small Sleek Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <span className="text-[16px] leading-6 font-semibold text-slate-800">Let me choose times</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-[12px] leading-4">
                      Set custom delivery times or let us auto-space your words
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <motion.div whileTap={{
            scale: 0.95
          }} transition={{
            type: "spring",
            stiffness: 400,
            damping: 20
          }}>
              <Switch checked={settings.mode === 'custom'} onCheckedChange={handleModeToggle} className="data-[state=checked]:bg-primary" />
            </motion.div>
          </div>
        </div>

        {/* Sleek Timeline Preview / Modern Custom Times */}
        {settings.mode === 'auto' ? <div className="mb-6">
            <div className="text-[13px] leading-5 font-medium text-slate-600 mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-teal-500 rounded-full"></div>
              Smart spacing preview
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hidden px-[25px] py-0 my-0">
              {previewTimes.map((time, index) => <MotionDiv key={index} className="min-w-[70px] flex flex-col items-center gap-2 flex-shrink-0 p-2 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg border border-teal-200" whileHover={{
            scale: 1.05,
            y: -2
          }} transition={{
            duration: 0.15
          }}>
                  <motion.div className="w-2 h-2 bg-teal-500 rounded-full" animate={{
              scale: [1, 1.2, 1]
            }} transition={{
              duration: 0.8,
              delay: index * 0.1,
              repeat: Infinity,
              repeatDelay: 2
            }} />
                  <span className="text-[11px] leading-4 font-semibold text-teal-700">
                    {formatTimeTo12Hour(time)}
                  </span>
                  <span className="text-[10px] leading-3 text-teal-600">#{index + 1}</span>
                </MotionDiv>)}
            </div>
          </div> : <div className="mb-6">
            <div className="text-[13px] leading-5 font-medium text-slate-600 mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-slate-500 rounded-full"></div>
              Custom delivery times
            </div>
            <div className="space-y-3">
              {Array.from({
            length: wordCount
          }, (_, index) => <MotionDiv key={index} className="group relative bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-md transition-all duration-200" whileHover={{
            y: -2,
            scale: 1.01
          }} transition={{
            duration: 0.15
          }}>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg group-hover:shadow-xl transition-shadow">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800">Word {index + 1}</h4>
                        <p className="text-xs text-gray-500">Delivery time</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Input type="time" value={formatTimeTo12Hour(settings.customTimes[index] || '09:00').split(' ')[0]} onChange={e => handleCustomTimeChange(index, e.target.value)} className="w-24 h-9 text-sm font-mono border-gray-300 rounded-lg bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all mx-0 px-[7px]" />
                      
                    </div>
                  </div>
                  
                  {/* Time visualization */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>Scheduled for {formatTimeTo12Hour(settings.customTimes[index] || '09:00')}</span>
                    </div>
                  </div>
                </MotionDiv>)}
            </div>
          </div>}

        {/* Enhanced Timeline Summary */}
        <div className="border-t border-border/50 pt-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Today's Schedule
            </h4>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {wordCount} words
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {previewTimes.map((time, index) => <MotionDiv key={index} className="flex items-center justify-between bg-gradient-to-r from-glintup-indigo/5 to-duolingo-purple/5 border border-glintup-indigo/20 rounded-lg px-3 py-2 group hover:from-glintup-indigo/10 hover:to-duolingo-purple/10 transition-all" whileHover={{
            scale: 1.02,
            y: -1
          }} transition={{
            duration: 0.12
          }}>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-glintup-indigo text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className="text-xs font-medium text-foreground">Word {index + 1}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-glintup-indigo">
                    {formatTimeTo12Hour(time).split(' ')[0]}
                  </div>
                  <div className="text-xs text-glintup-indigo/70 font-medium">
                    {formatTimeTo12Hour(time).split(' ')[1]}
                  </div>
                </div>
              </MotionDiv>)}
          </div>
        </div>
      </MotionCard>

      {/* Sticky Apply Bar (Mobile) */}
      <motion.div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t px-4 h-14 flex items-center justify-between md:hidden z-50" initial={{
      y: 100
    }} animate={{
      y: 0
    }} transition={{
      duration: 0.3,
      delay: 0.2
    }}>
        <span className="text-[12px] leading-4 text-muted-foreground">
          {wordCount} words • spaced today
        </span>
        <div className="flex gap-2">
          <MotionButton variant="ghost" size="sm" onClick={handleSendNow} disabled={loading || !phoneNumber} className="h-10 px-3 text-[12px] leading-4 border-border text-foreground hover:bg-muted/50" whileTap={{
          scale: 0.98
        }}>
            <Send className="h-3 w-3 mr-1" />
            {loading ? "Sending..." : "Send Now"}
          </MotionButton>
          <MotionButton onClick={saveSettings} disabled={saving} className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-[12px] leading-4" whileTap={{
          scale: 0.98
        }}>
            {saving ? "Saving..." : "Apply"}
          </MotionButton>
        </div>
      </motion.div>

      {/* Desktop Actions */}
      <div className="hidden md:flex md:gap-2 md:mt-4">
        <MotionButton onClick={saveSettings} disabled={saving} className="flex-1 h-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold" whileTap={{
        scale: 0.98
      }}>
          {saving ? "Saving..." : "Apply"}
        </MotionButton>
        <MotionButton variant="outline" onClick={handleSendNow} disabled={loading || !phoneNumber} className="h-10 px-4 border-border text-foreground hover:bg-muted/50" whileTap={{
        scale: 0.98
      }}>
          <Send className="h-4 w-4 mr-2" />
          {loading ? "Sending..." : "Send Now"}
        </MotionButton>
      </div>
    </div>;
};
export default WordScheduler;