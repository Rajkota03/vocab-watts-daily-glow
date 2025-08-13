import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Calendar, Sparkles, Zap, Target, Coffee, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Words per day & delivery schedule
        </h3>
        <p className="text-sm text-muted-foreground">
          Each word arrives at a different time. Tiny sips beat big dumps. 📈
        </p>
      </div>

      {/* Words per day slider */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Daily words</Label>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              {settings.wordsPerDay} words
            </div>
          </div>
          
          <Slider
            value={[settings.wordsPerDay]}
            onValueChange={handleWordsPerDayChange}
            max={5}
            min={1}
            step={1}
            className="w-full"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Smart tip: smaller, spaced drops beat big dumps. 📈
          </p>
        </div>
      </Card>

      {/* Custom times toggle */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium flex items-center gap-2">
              Let me choose delivery times
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      We distribute your words from morning to evening so your memory gets multiple small nudges.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            {settings.mode === 'auto' && (
              <p className="text-xs text-muted-foreground">
                We'll adjust around your timezone and quiet hours.
              </p>
            )}
          </div>
          <Switch
            checked={settings.mode === 'custom'}
            onCheckedChange={handleModeToggle}
          />
        </div>
      </Card>

      {/* Schedule preview or custom times */}
      {settings.mode === 'auto' ? (
        <Card className="p-4 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-500" />
            Smart Spacing Preview
          </Label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {previewTimes.map((time, index) => (
              <div key={index} className="flex-shrink-0 bg-white rounded-lg p-3 shadow-sm min-w-[80px] text-center">
                <div className="text-lg mb-1">{timeSlotEmojis[index % timeSlotEmojis.length]}</div>
                <div className="text-xs font-medium">Word {index + 1}</div>
                <div className="text-xs text-muted-foreground">{time}</div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="p-4 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <Label className="text-sm font-medium mb-4 block flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-500" />
            Custom Delivery Times
          </Label>
          <div className="space-y-3">
            {Array.from({ length: settings.wordsPerDay }, (_, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                <span className="text-lg">{timeSlotEmojis[index % timeSlotEmojis.length]}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">Word {index + 1}</p>
                </div>
                <Input
                  type="time"
                  value={settings.customTimes[index] || '09:00'}
                  onChange={(e) => handleCustomTimeChange(index, e.target.value)}
                  className="w-24 h-8 text-sm"
                  min="06:00"
                  max="23:00"
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Timeline preview */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
          <Calendar className="h-4 w-4 text-green-500" />
          Today's Timeline
        </Label>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {previewTimes.map((time, index) => (
            <div key={index} className="flex-shrink-0 bg-white/80 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap">
              Word {index + 1} • {time}
            </div>
          ))}
        </div>
        <p className="text-xs text-green-600 mt-2">
          We never send multiple words together — your brain likes breathing room.
        </p>
      </Card>

      {/* Mobile sticky bottom bar / Desktop CTA */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t md:static md:bg-transparent md:border-0 md:p-0">
        <div className="flex items-center justify-between gap-4 md:flex-col md:gap-2">
          <div className="text-xs text-muted-foreground md:text-center">
            <span className="font-medium">{settings.wordsPerDay} words today</span>
            <span className="hidden md:inline"> • </span>
            <br className="md:hidden" />
            <span>spaced across the day</span>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex-1 md:w-full"
            >
              {saving ? "Saving..." : "Apply"}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleSendNow}
              disabled={loading || !phoneNumber}
              className="md:w-full"
            >
              {loading ? "Sending..." : "Send Now"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordScheduler;