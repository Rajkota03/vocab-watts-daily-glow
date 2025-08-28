import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Settings, Bell, Send, Zap, Info } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { format, parse } from 'date-fns';
import { cn } from '@/lib/utils';

// Check if user is admin/developer
const useIsAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const checkAdminStatus = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (user) {
        const {
          data: roles
        } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
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
  const {
    toast
  } = useToast();
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
      setPeriod('AM');
      setSliderHours(9);
      setSliderMinutes(0);
    }
  }, [value]);
  const formatTimeTo12Hour = (time24: string): string => {
    try {
      if (!time24 || time24.length < 5) return '09:00 AM';
      const [hours, minutes] = time24.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return '09:00 AM';
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
        variant: "destructive"
      });
      return;
    }
    const formattedTime = `${sliderHours.toString().padStart(2, '0')}:${sliderMinutes.toString().padStart(2, '0')} ${period}`;
    const time24 = formatTimeTo24Hour(formattedTime);
    onChange(time24);
    setIsOpen(false);
  };
  const quickTimes = [{
    label: '09:00 AM',
    value: '09:00'
  }, {
    label: '12:00 PM',
    value: '12:00'
  }, {
    label: '03:00 PM',
    value: '15:00'
  }, {
    label: '06:00 PM',
    value: '18:00'
  }, {
    label: '09:00 PM',
    value: '21:00'
  }];
  return <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.button whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }} className="group flex items-center gap-2 bg-white border border-stroke rounded-lg hover:bg-gray-50 hover:border-primary/30 transition-all duration-200 py-0 px-[13px]">
          <Clock className="w-4 h-4 text-primary" />
          <div className="text-left">
            <div className="text-sm font-semibold text-glintup-text">
              {formatTimeTo12Hour(value)}
            </div>
          </div>
        </motion.button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-0 bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-2 pb-4 border-b border-gray-100">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-lg font-bold text-gray-900">
            Set Delivery Time
          </DialogTitle>
          <p className="text-sm text-gray-600">Choose when to receive your vocabulary word</p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Time Preview Display */}
          <motion.div 
            className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100"
            key={`${sliderHours}-${sliderMinutes}-${period}`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-3xl font-bold text-gray-900 mb-1 font-mono">
              {sliderHours.toString().padStart(2, '0')}:{sliderMinutes.toString().padStart(2, '0')}
            </div>
            <div className="inline-flex items-center gap-2 bg-white/80 rounded-full px-3 py-1 border border-blue-200">
              <div className={`w-2 h-2 rounded-full ${period === 'AM' ? 'bg-orange-400' : 'bg-indigo-500'}`}></div>
              <span className="text-gray-900 font-semibold text-sm">{period}</span>
            </div>
          </motion.div>

          {/* Method Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Info className="w-4 h-4" />
                Selection Method
              </div>
              <div className="flex gap-1 bg-white rounded-lg p-1 border">
                <button
                  onClick={() => {/* Toggle to quick select mode */}}
                  className="px-3 py-1 text-xs font-medium rounded-md transition-colors text-gray-600 hover:text-gray-900"
                >
                  Quick
                </button>
                <button
                  onClick={() => {/* Toggle to custom mode */}}
                  className="px-3 py-1 text-xs font-medium rounded-md transition-colors bg-blue-100 text-blue-700"
                >
                  Custom
                </button>
              </div>
            </div>
          </div>

          {/* Quick Times - Popular Presets */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <label className="text-sm font-semibold text-gray-900">Popular Times</label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {quickTimes.map((time, timeIndex) => {
                const isSelected = value === time.value;
                return (
                  <TooltipProvider key={time.value}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          onClick={() => {
                            onChange(time.value);
                            setIsOpen(false);
                          }}
                          className={`p-2 rounded-lg text-center transition-all duration-200 border-2 ${
                            isSelected 
                              ? 'bg-blue-50 border-blue-200 text-blue-900' 
                              : 'bg-white border-gray-200 text-gray-700 hover:border-blue-200 hover:bg-blue-25'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: timeIndex * 0.05 }}
                        >
                          <div className="text-sm mb-1">{timeSlotEmojis[timeIndex]}</div>
                          <div className="font-semibold text-xs">{time.label}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {timeIndex === 0 && 'Morning'}
                            {timeIndex === 1 && 'Lunch'}
                            {timeIndex === 2 && 'Afternoon'}
                            {timeIndex === 3 && 'Evening'}
                            {timeIndex === 4 && 'Night'}
                          </div>
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Set delivery for {time.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-500 bg-white px-2">or customize</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Custom Time Controls */}
          <div className="space-y-4">
            {/* Period Selection - More Compact */}
            <div>
              <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-500" />
                Time Period
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPeriod('AM')}
                  className={`p-2 rounded-lg text-center transition-all duration-200 border-2 ${
                    period === 'AM' 
                      ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 text-orange-900' 
                      : 'bg-white border-gray-200 text-gray-600 hover:border-orange-200 hover:bg-orange-25'
                  }`}
                >
                  <div className="text-lg mb-0.5">🌅</div>
                  <div className="font-semibold text-sm">AM</div>
                  <div className="text-xs text-gray-500">Morning</div>
                </button>
                <button
                  onClick={() => setPeriod('PM')}
                  className={`p-2 rounded-lg text-center transition-all duration-200 border-2 ${
                    period === 'PM' 
                      ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-900' 
                      : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-200 hover:bg-indigo-25'
                  }`}
                >
                  <div className="text-lg mb-0.5">🌆</div>
                  <div className="font-semibold text-sm">PM</div>
                  <div className="text-xs text-gray-500">Evening</div>
                </button>
              </div>
            </div>

            {/* Hours Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900">Hour</label>
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1">
                  <span className="text-lg font-bold text-blue-900">
                    {sliderHours.toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
              <Slider 
                value={[sliderHours]} 
                onValueChange={value => setSliderHours(value[0])} 
                min={1} 
                max={12} 
                step={1} 
                className="w-full" 
              />
              <div className="flex justify-between text-xs text-gray-500 px-1">
                <span>1</span>
                <span>6</span>
                <span>12</span>
              </div>
            </div>

            {/* Minutes Slider - Improved Precision */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900">Minutes</label>
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1">
                  <span className="text-lg font-bold text-blue-900">
                    {sliderMinutes.toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
              <Slider 
                value={[sliderMinutes]} 
                onValueChange={value => setSliderMinutes(value[0])} 
                min={0} 
                max={59} 
                step={1} 
                className="w-full" 
              />
              <div className="flex justify-between text-xs text-gray-500 px-1">
                <span>00</span>
                <span>15</span>
                <span>30</span>
                <span>45</span>
                <span>59</span>
              </div>
            </div>
          </div>

          {/* Action Buttons - Always Visible */}
          <div className="flex gap-3 pt-4 border-t border-gray-100 sticky bottom-0 bg-white">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)} 
              className="flex-1 h-11 font-medium border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div className="flex-1">
                    <MotionButton 
                      onClick={handleSliderChange} 
                      className="w-full h-11 font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white shadow-md hover:shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={!period}
                    >
                      Set Time
                    </MotionButton>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Confirm time selection: {sliderHours.toString().padStart(2, '0')}:{sliderMinutes.toString().padStart(2, '0')} {period}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
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
  wordCount
}) => {
  const [settings, setSettings] = useState<DeliverySettings>({
    mode: 'auto',
    autoWindowStart: '09:00',
    autoWindowEnd: '19:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    customTimes: ['09:00', '12:00', '19:00']
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const {
    toast
  } = useToast();
  const isAdmin = useIsAdmin();
  useEffect(() => {
    fetchUserSettings();
  }, [userId]);
  useEffect(() => {
    console.log('WordScheduler - Word count changed to:', wordCount);
    const newCustomTimes = [...settings.customTimes];
    while (newCustomTimes.length < wordCount) {
      newCustomTimes.push('09:00');
    }
    setSettings(prev => ({
      ...prev,
      customTimes: newCustomTimes.slice(0, wordCount)
    }));
  }, [wordCount]);
  const formatTimeTo12Hour = (time24: string): string => {
    try {
      if (!time24 || time24.length < 5) return '09:00 AM';
      const [hours, minutes] = time24.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return '09:00 AM';
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
    const defaultTimes = ['09:00', '12:00', '19:00'];
    if (wordCount <= 3) {
      return defaultTimes.slice(0, wordCount);
    }
    const start = 9;
    const end = 19;
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
    console.log('Parent handleCustomTimeChange called:', {
      index,
      newTime
    });
    const time24 = formatTimeTo24Hour(newTime);
    console.log('Converted to 24-hour format:', time24);
    const newTimes = [...settings.customTimes];
    newTimes[index] = time24;
    console.log('New times array:', newTimes);
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
      const {
        error: settingsError
      } = await supabase.from('user_delivery_settings').upsert({
        user_id: userId,
        words_per_day: wordCount,
        mode: settings.mode,
        auto_window_start: settings.autoWindowStart,
        auto_window_end: settings.autoWindowEnd,
        timezone: settings.timezone
      });
      if (settingsError) throw settingsError;
      if (settings.mode === 'custom') {
        await supabase.from('user_custom_times').delete().eq('user_id', userId);
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
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: true
      };
    } catch (error) {
      console.error('Error calling schedule-today function:', error);
      return {
        success: false,
        error: error.message
      };
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
  return <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="heading-md text-glintup-indigo">Delivery Schedule</h3>
          <p className="body-text-sm text-muted-foreground">When to receive your {wordCount} daily words</p>
        </div>
      </div>

      {/* Mode Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-glintup-text">Custom Times</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-sm">
                        Choose your own delivery times or let us auto-space them
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Badge variant={settings.mode === 'custom' ? 'default' : 'secondary'} className="text-xs">
                {settings.mode === 'custom' ? 'Custom' : 'Auto'}
              </Badge>
            </div>
            <Switch checked={settings.mode === 'custom'} onCheckedChange={handleModeToggle} />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {settings.mode === 'auto' ? <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              Smart Spacing
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <p className="body-text-sm text-muted-foreground">
                Your {wordCount} words will be automatically spaced between 9 AM and 7 PM for optimal learning.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {previewTimes.map((time, index) => <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-glintup-text">
                        {formatTimeTo12Hour(time)}
                      </span>
                    </div>
                  </div>)}
              </div>
            </div>
          </CardContent>
        </Card> : <Card>
          <CardHeader className="pb-3 px-[22px]">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              Custom Times
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-[6px]">
            <div className="space-y-3">
              {Array.from({
            length: wordCount
          }, (_, index) => <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors px-[7px]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-glintup-text">Word {index + 1}</div>
                      <div className="text-xs text-muted-foreground">Delivery #{index + 1}</div>
                    </div>
                  </div>
                  <CustomTimePicker value={settings.customTimes[index] || '09:00'} onChange={time => handleCustomTimeChange(index, time)} index={index} />
                </div>)}
            </div>
          </CardContent>
        </Card>}

      {/* Schedule Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-glintup-mint" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {previewTimes.map((time, index) => <div key={index} className="flex items-center justify-between p-2 bg-glintup-bg rounded-lg border border-glintup-mint/20">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-glintup-mint text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-glintup-indigo">Word {index + 1}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-glintup-indigo">
                    {formatTimeTo12Hour(time)}
                  </div>
                </div>
              </div>)}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={saveSettings} disabled={saving} className="flex-1">
          {saving ? <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Saving...
            </> : "Apply Schedule"}
        </Button>
        
        {isAdmin && <Button variant="outline" onClick={handleSendNow} disabled={loading || !phoneNumber}>
            <Send className="h-4 w-4 mr-2" />
            {loading ? "Sending..." : "Test"}
          </Button>}
      </div>
    </div>;
};
export default WordScheduler;