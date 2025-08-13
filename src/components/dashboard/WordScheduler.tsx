import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Clock, Calendar, Sparkles, Zap, Target, Coffee, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface WordSchedulerProps {
  userId: string;
  phoneNumber?: string;
  category: string;
  isPro: boolean;
}

interface ScheduleData {
  isScheduled: boolean;
  scheduleTimes: string[];
  wordsPerSlot: number;
  totalDailyWords: number;
}

const timeSlotEmojis = ['🌅', '☀️', '🌤️', '🌆', '🌙'];
const timeSlotLabels = ['Morning', 'Noon', 'Afternoon', 'Evening', 'Night'];
const timeSlotDescriptions = [
  'Start fresh with new words',
  'Midday vocabulary boost',
  'Afternoon brain fuel',
  'Evening enrichment',
  'Wind down with words'
];

const WordScheduler: React.FC<WordSchedulerProps> = ({ 
  userId, 
  phoneNumber, 
  category, 
  isPro 
}) => {
  const [schedule, setSchedule] = useState<ScheduleData>({
    isScheduled: false,
    scheduleTimes: ['09:00', '12:00', '15:00', '18:00', '21:00'],
    wordsPerSlot: 1,
    totalDailyWords: 5
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserSchedule();
  }, [userId]);

  const fetchUserSchedule = async () => {
    try {
      const { data, error } = await supabase
        .from('word_schedules')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching schedule:', error);
        return;
      }

      if (data) {
        const scheduleTimes = Array.isArray(data.schedule_times) 
          ? data.schedule_times.filter(time => typeof time === 'string') as string[]
          : ['09:00', '12:00', '15:00', '18:00', '21:00'];
        
        setSchedule({
          isScheduled: data.is_scheduled,
          scheduleTimes,
          wordsPerSlot: data.words_per_slot,
          totalDailyWords: data.total_daily_words
        });
      }
    } catch (error) {
      console.error('Error fetching user schedule:', error);
    }
  };

  const handleTimeChange = (index: number, newTime: string) => {
    const newTimes = [...schedule.scheduleTimes];
    newTimes[index] = newTime;
    setSchedule({ ...schedule, scheduleTimes: newTimes });
  };

  const handleScheduleToggle = async (enabled: boolean) => {
    const newSchedule = { ...schedule, isScheduled: enabled };
    setSchedule(newSchedule);
    await saveSchedule(newSchedule);
  };

  const handleWordCountChange = (newCount: number) => {
    const newSchedule = { 
      ...schedule, 
      totalDailyWords: newCount,
      wordsPerSlot: Math.ceil(newCount / 5)
    };
    setSchedule(newSchedule);
  };

  const saveSchedule = async (scheduleData: ScheduleData) => {
    if (!userId) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('word_schedules')
        .upsert({
          user_id: userId,
          is_scheduled: scheduleData.isScheduled,
          schedule_times: scheduleData.scheduleTimes,
          words_per_slot: scheduleData.wordsPerSlot,
          total_daily_words: scheduleData.totalDailyWords
        });

      if (error) throw error;

      toast({
        title: scheduleData.isScheduled ? "🎉 Schedule Activated!" : "Schedule Saved",
        description: scheduleData.isScheduled 
          ? `Your words will arrive at ${scheduleData.scheduleTimes.length} perfect moments throughout the day!`
          : "Your preferences have been saved."
      });
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: "Failed to save schedule",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
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
        title: "Words Sent! 🚀",
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

  return (
    <div className="space-y-6">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Smart Word Delivery
          </h3>
          <p className="text-sm text-muted-foreground">
            Boost retention with spaced learning throughout your day
          </p>
        </div>
        <Switch
          checked={schedule.isScheduled}
          onCheckedChange={handleScheduleToggle}
          disabled={saving}
        />
      </div>

      {/* Word Count Selector */}
      <Card className="p-4">
        <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
          <Target className="h-4 w-4" />
          Daily Word Goal
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {[3, 5, 8].map((count) => (
            <Button
              key={count}
              variant={schedule.totalDailyWords === count ? "default" : "outline"}
              size="sm"
              onClick={() => handleWordCountChange(count)}
              className="relative"
            >
              {count} words
              {count === 5 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  ✓
                </span>
              )}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          📚 Optimal: 5 words = 1 word per slot for maximum retention
        </p>
      </Card>

      {/* Schedule Times */}
      {schedule.isScheduled && (
        <Card className="p-4 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <Label className="text-sm font-medium mb-4 block flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Your Learning Timeline
          </Label>
          <div className="space-y-3">
            {schedule.scheduleTimes.map((time, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                <span className="text-2xl">{timeSlotEmojis[index]}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{timeSlotLabels[index]}</p>
                  <p className="text-xs text-muted-foreground">{timeSlotDescriptions[index]}</p>
                </div>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => handleTimeChange(index, e.target.value)}
                  className="w-24 h-8 text-sm"
                />
                <div className="text-xs text-muted-foreground bg-purple-100 px-2 py-1 rounded">
                  {schedule.wordsPerSlot} word{schedule.wordsPerSlot > 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700">Why spaced learning works</span>
            </div>
            <p className="text-xs text-blue-600">
              Spreading words throughout your day creates multiple retrieval opportunities, 
              strengthening memory pathways and improving long-term retention by up to 200%!
            </p>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {schedule.isScheduled ? (
          <Button
            onClick={() => saveSchedule(schedule)}
            disabled={saving}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {saving ? "Saving..." : "💾 Save Schedule"}
          </Button>
        ) : (
          <Button
            onClick={handleSendNow}
            disabled={loading || !phoneNumber}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {loading ? "Sending..." : "⚡ Send All Words Now"}
          </Button>
        )}
        
        {!schedule.isScheduled && (
          <p className="text-xs text-center text-muted-foreground">
            💡 Try scheduled delivery for better retention!
          </p>
        )}
      </div>
    </div>
  );
};

export default WordScheduler;