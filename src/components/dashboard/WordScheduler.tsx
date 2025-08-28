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
}> = ({ value, onChange, index }) => {
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
      return '9:00 AM';
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.button
          className="group flex items-center gap-2 px-3 py-2 bg-white border border-stroke rounded-lg hover:bg-gray-50 hover:border-primary/30 transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Clock className="w-4 h-4 text-primary" />
          <div className="text-left">
            <div className="text-sm font-semibold text-glintup-text">
              {formatTimeTo12Hour(value)}
            </div>
          </div>
        </motion.button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Set Delivery Time
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center p-4 bg-glintup-bg rounded-lg">
            <div className="text-3xl font-mono font-bold text-glintup-indigo">
              {sliderHours}:{sliderMinutes.toString().padStart(2, '0')} {period}
            </div>
          </div>
          
          {/* Quick Select */}
          <div>
            <label className="text-sm font-medium text-glintup-text mb-2 block">Quick Select</label>
            <div className="grid grid-cols-5 gap-1">
              {quickTimes.map((time) => (
                <Button
                  key={time.value}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onChange(time.value);
                    setIsOpen(false);
                  }}
                  className="text-xs"
                >
                  {time.label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Custom Time */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-glintup-text">Period</label>
              <div className="flex gap-1">
                <Button
                  variant={period === 'AM' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod('AM')}
                >
                  AM
                </Button>
                <Button
                  variant={period === 'PM' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod('PM')}
                >
                  PM
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-glintup-text mb-2 block">
                Hours: {sliderHours}
              </label>
              <Slider
                value={[sliderHours]}
                onValueChange={(value) => setSliderHours(value[0])}
                min={1}
                max={12}
                step={1}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-glintup-text mb-2 block">
                Minutes: {sliderMinutes.toString().padStart(2, '0')}
              </label>
              <Slider
                value={[sliderMinutes]}
                onValueChange={(value) => setSliderMinutes(value[0])}
                min={0}
                max={59}
                step={5}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSliderChange} className="flex-1">
              Set Time
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
  const { toast } = useToast();
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
      if (!time24 || time24.length < 5) return '9:00 AM';
      
      const [hours, minutes] = time24.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return '9:00 AM';
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
    console.log('Parent handleCustomTimeChange called:', { index, newTime });
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
      const { error } = await supabase.functions.invoke('schedule-today', {
        body: {
          userId: userId,
          phoneNumber: phoneNumber,
          category: category
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
    <div className="space-y-4">
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
            <Switch 
              checked={settings.mode === 'custom'} 
              onCheckedChange={handleModeToggle}
            />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {settings.mode === 'auto' ? (
        <Card>
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
                {previewTimes.map((time, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg border"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-glintup-text">
                        {formatTimeTo12Hour(time)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              Custom Times
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {Array.from({ length: wordCount }, (_, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-glintup-text">Word {index + 1}</div>
                      <div className="text-xs text-muted-foreground">Delivery #{index + 1}</div>
                    </div>
                  </div>
                  <CustomTimePicker 
                    value={settings.customTimes[index] || '09:00'} 
                    onChange={time => handleCustomTimeChange(index, time)} 
                    index={index} 
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
            {previewTimes.map((time, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 bg-glintup-bg rounded-lg border border-glintup-mint/20"
              >
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button 
          onClick={saveSettings} 
          disabled={saving} 
          className="flex-1"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Apply Schedule"
          )}
        </Button>
        
        {isAdmin && (
          <Button 
            variant="outline" 
            onClick={handleSendNow} 
            disabled={loading || !phoneNumber}
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? "Sending..." : "Test"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default WordScheduler;