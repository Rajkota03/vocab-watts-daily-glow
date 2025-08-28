import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Calendar, Target, Info, Send } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { format, parse } from 'date-fns';

// Check if user is admin/developer
const useIsAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        setIsAdmin(roles?.some(r => r.role === 'admin') || false);
      }
    };
    checkAdminStatus();
  }, []);
  
  return isAdmin;
};
interface WordSchedulerProps {
  userId: string;
  phoneNumber?: string;
  category: string;
  isPro: boolean;
  wordCount: number;
}

interface DeliverySettings {
  mode: 'auto' | 'custom';
  autoWindowStart: string;
  autoWindowEnd: string;
  timezone: string;
  customTimes: string[];
}

// Custom time picker component
const CustomTimePicker: React.FC<{
  value: string;
  onChange: (time: string) => void;
  index: number;
}> = ({
  value,
  onChange,
  index
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [sliderHours, setSliderHours] = useState(9);
  const [sliderMinutes, setSliderMinutes] = useState(0);
  
  useEffect(() => {
    if (value && value !== '09:00') {
      const time12 = formatTimeTo12Hour(value);
      const [time, ampm] = time12.split(' ');
      const [hours, minutes] = time.split(':');
      setPeriod(ampm as 'AM' | 'PM');
      setSliderHours(parseInt(hours) || 9);
      setSliderMinutes(parseInt(minutes) || 0);
    } else {
      // Default values
      setPeriod('AM');
      setSliderHours(9);
      setSliderMinutes(0);
    }
  }, [value]);
  
  const formatTimeTo12Hour = (time24: string): string => {
    try {
      if (!time24 || time24.length < 5) return '9:00 AM';
      
      const [hours, minutes] = time24.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return '9:00 AM'; // fallback to default time
    }
  };
  
  const formatTimeTo24Hour = (time12: string): string => {
    try {
      const date = parse(time12, 'h:mm a', new Date());
      return format(date, 'HH:mm');
    } catch (error) {
      return time12;
    }
  };

  const handleSliderChange = () => {
    if (!period) {
      toast({
        title: "Please select AM or PM",
        description: "You must choose either AM or PM to set the time.",
        variant: "destructive",
      });
      return;
    }
    const formattedTime = `${sliderHours}:${sliderMinutes.toString().padStart(2, '0')} ${period}`;
    const time24 = formatTimeTo24Hour(formattedTime);
    onChange(time24);
    setIsOpen(false);
  };

  const quickTimes = [
    { label: '9:00 AM', value: '09:00' },
    { label: '12:00 PM', value: '12:00' },
    { label: '3:00 PM', value: '15:00' },
    { label: '6:00 PM', value: '18:00' },
    { label: '9:00 PM', value: '21:00' }
  ];

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.button
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 hover:border-blue-200 px-6 py-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {formatTimeTo12Hour(value).split(' ')[0]}
                </div>
                <div className="text-xs font-medium text-blue-500 uppercase tracking-wide">
                  {formatTimeTo12Hour(value).split(' ')[1]}
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
          <div className="p-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Set Time</h3>
              <div className="text-4xl font-mono bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-100 text-blue-600">
                {sliderHours}:{sliderMinutes.toString().padStart(2, '0')} {period}
              </div>
            </div>
            
            {/* Quick Time Buttons */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-700 mb-3 block">Quick Select</label>
              <div className="grid grid-cols-5 gap-2">
                {quickTimes.map((time) => (
                  <motion.button
                    key={time.value}
                    onClick={() => {
                      onChange(time.value);
                      setIsOpen(false);
                    }}
                    className="px-3 py-2 text-xs font-medium rounded-xl bg-gray-100 hover:bg-blue-100 hover:text-blue-600 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {time.label}
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Custom Time Sliders */}
            <div className="space-y-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">Hours</label>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => setPeriod('AM')}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        period === 'AM' 
                          ? 'bg-blue-500 text-white shadow-lg' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      AM
                    </motion.button>
                    <motion.button
                      onClick={() => setPeriod('PM')}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        period === 'PM' 
                          ? 'bg-blue-500 text-white shadow-lg' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      PM
                    </motion.button>
                  </div>
                </div>
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
                  <Slider
                    value={[sliderHours]}
                    onValueChange={(value) => setSliderHours(value[0])}
                    min={1}
                    max={12}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
                    <span>1</span>
                    <span>6</span>
                    <span>12</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="text-sm font-semibold text-gray-700">Minutes</label>
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
                  <Slider
                    value={[sliderMinutes]}
                    onValueChange={(value) => setSliderMinutes(value[0])}
                    min={0}
                    max={59}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
                    <span>00</span>
                    <span>30</span>
                    <span>59</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)} 
                className="flex-1 rounded-xl border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSliderChange} 
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium shadow-lg"
              >
                Set Time
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
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
    autoWindowEnd: '19:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    customTimes: ['09:00', '12:00', '19:00'] // 9 AM, 12 PM, 7 PM
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const isAdmin = useIsAdmin();

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
      if (!time24 || time24.length < 5) return '9:00 AM';
      
      const [hours, minutes] = time24.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return '9:00 AM'; // fallback to default time
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
    if (!userId) {
      console.log('No userId provided, skipping settings fetch');
      return;
    }
    
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
    // Define better default times based on word count
    const defaultTimes = ['09:00', '12:00', '19:00']; // 9 AM, 12 PM, 7 PM
    
    if (wordCount <= 3) {
      return defaultTimes.slice(0, wordCount);
    }
    
    // For more than 3 words, spread between 9 AM and 7 PM
    const start = 9; // 9 AM
    const end = 19; // 7 PM
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
    console.log('Parent handleCustomTimeChange called:', { index, newTime });
    // Convert 12-hour input to 24-hour for storage
    const time24 = formatTimeTo24Hour(newTime);
    console.log('Converted to 24-hour format:', time24);
    const newTimes = [...settings.customTimes];
    newTimes[index] = time24;
    console.log('New times array:', newTimes);

    // Check for duplicates
    const uniqueTimes = new Set(newTimes.slice(0, wordCount));
    if (uniqueTimes.size !== wordCount) {
      console.log('Duplicate times detected, not updating');
      toast({
        title: "Times must be different",
        description: "Please choose different times for each word delivery.",
        variant: "destructive"
      });
      return;
    }
    console.log('Updating settings with new times');
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
      const scheduleResult = await scheduleToday();
      
      if (scheduleResult?.success) {
        toast({
          title: "Schedule saved! 🎉",
          description: `Your ${wordCount} words will be spaced perfectly across the day.`
        });
      } else {
        toast({
          title: "Schedule saved with warning ⚠️",
          description: `Settings saved but scheduling failed: ${scheduleResult?.error || 'Unknown error'}. Words can still be sent manually.`,
          variant: "destructive"
        });
      }
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
      console.log('Scheduling today with category:', category);
      const { error } = await supabase.functions.invoke('schedule-today', {
        body: {
          userId: userId,
          phoneNumber: phoneNumber,
          category: category // This should be "daily-intermediate" from props
        }
      });
      
      if (error) {
        console.error('Error scheduling today\'s words:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error calling schedule-today function:', error);
      return { success: false, error: error.message };
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
      // For testing purposes - call whatsapp-send directly
      const { data, error } = await supabase.functions.invoke('whatsapp-send', {
        body: {
          to: phoneNumber,
          category: category,
          isPro: isPro,
          wordsCount: 1,
          message: `🧪 TEST MESSAGE - ${category} vocabulary word`
        }
      });

      if (error) throw error;
      if (!data?.success) {
        throw new Error(data?.error || "Failed to send test message");
      }

      toast({
        title: "Test message sent! 🧪",
        description: "Check your WhatsApp for the test vocabulary word."
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
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.3 }} 
        className="rounded-xl border border-slate-200 bg-white p-4 md:p-5 md:mx-0 shadow-[0_1px_2px_rgba(0,0,0,.06)] mx-0 px-[11px] py-[17px]"
      >
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
            <motion.div 
              whileTap={{ scale: 0.95 }} 
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Switch 
                checked={settings.mode === 'custom'} 
                onCheckedChange={handleModeToggle} 
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 [&>span]:bg-white" 
              />
            </motion.div>
          </div>
        </div>

        {/* Sleek Timeline Preview / Minimal Custom Times */}
        {settings.mode === 'auto' ? (
          <div className="mb-6">
            <div className="text-[13px] leading-5 font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full"></div>
              Smart spacing preview
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {previewTimes.map((time, index) => (
                <MotionDiv 
                  key={index} 
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-lg border border-border/50" 
                  whileHover={{ scale: 1.02 }} 
                  transition={{ duration: 0.15 }}
                >
                  <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {formatTimeTo12Hour(time)}
                  </span>
                </MotionDiv>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
              Custom delivery times
            </div>
            <div className="space-y-3">
              {Array.from({ length: wordCount }, (_, index) => (
                <MotionDiv 
                  key={index} 
                  className="group relative overflow-hidden rounded-3xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" 
                  whileHover={{ scale: 1.005 }} 
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-lg font-bold shadow-lg shadow-blue-500/25">
                          {index + 1}
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full border-2 border-white shadow-sm">
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          Word {index + 1}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                          Vocabulary delivery #{index + 1}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <CustomTimePicker 
                        value={settings.customTimes[index] || '09:00'} 
                        onChange={time => handleCustomTimeChange(index, time)} 
                        index={index} 
                      />
                    </div>
                  </div>
                  
                  {/* Subtle background pattern */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-transparent to-indigo-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </MotionDiv>
              ))}
            </div>
            
            {/* Minimal progress indicator */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="flex gap-2">
                {Array.from({ length: wordCount }, (_, index) => (
                  <div 
                    key={index}
                    className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 shadow-sm"
                  />
                ))}
              </div>
              <div className="text-sm text-gray-500 font-medium">
                {wordCount} delivery {wordCount === 1 ? 'time' : 'times'} set
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Timeline Summary */}
        <div className="border-t border-border/50 pt-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Today's Schedule
            </h4>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {wordCount} words
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {previewTimes.map((time, index) => (
              <MotionDiv 
                key={index} 
                className="flex items-center justify-between bg-gradient-to-r from-glintup-indigo/5 to-duolingo-purple/5 border border-glintup-indigo/20 rounded-lg px-3 py-2 group hover:from-glintup-indigo/10 hover:to-duolingo-purple/10 transition-all" 
                whileHover={{ scale: 1.02, y: -1 }} 
                transition={{ duration: 0.12 }}
              >
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
        <span className="text-[12px] leading-4 text-muted-foreground">
          {wordCount} words • spaced today
        </span>
        <div className="flex gap-2">
          {/* Show Send Now button only for admins/developers on mobile */}
          {isAdmin && (
            <MotionButton 
              variant="ghost" 
              size="sm" 
              onClick={handleSendNow} 
              disabled={loading || !phoneNumber} 
              className="h-10 px-3 text-[12px] leading-4 border-border text-foreground hover:bg-muted/50" 
              whileTap={{ scale: 0.98 }}
            >
              <Send className="h-3 w-3 mr-1" />
              {loading ? "Sending..." : "Test Send"}
            </MotionButton>
          )}
          <MotionButton 
            onClick={saveSettings} 
            disabled={saving} 
            className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-[12px] leading-4" 
            whileTap={{ scale: 0.98 }}
          >
            {saving ? "Saving..." : "Apply Settings"}
          </MotionButton>
        </div>
      </motion.div>

      {/* Desktop Actions */}
      <div className="hidden md:flex md:gap-2 md:mt-4">
        <MotionButton 
          onClick={saveSettings} 
          disabled={saving} 
          className="flex-1 h-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold" 
          whileTap={{ scale: 0.98 }}
        >
          {saving ? "Saving..." : "Apply Settings"}
        </MotionButton>
        
        {/* Show Send Now button only for admins/developers */}
        {isAdmin && (
          <MotionButton 
            variant="outline" 
            onClick={handleSendNow} 
            disabled={loading || !phoneNumber} 
            className="h-10 px-4 border-border text-foreground hover:bg-muted/50" 
            whileTap={{ scale: 0.98 }}
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? "Sending..." : "Test Send"}
          </MotionButton>
        )}
      </div>
    </div>
  );
};

export default WordScheduler;