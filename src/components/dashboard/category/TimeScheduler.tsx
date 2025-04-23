
import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TimeSchedulerProps {
  scheduledTime: string;
  onScheduledTimeChange: (time: string) => void;
}

const TimeScheduler: React.FC<TimeSchedulerProps> = ({
  scheduledTime,
  onScheduledTimeChange,
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">Schedule Delivery Time</h3>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Input 
            type="time" 
            value={scheduledTime}
            onChange={(e) => onScheduledTimeChange(e.target.value)}
            className="pl-10 w-full border-stroke"
          />
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          className="border-stroke hover:bg-gray-50"
        >
          <Calendar className="h-4 w-4 text-gray-600" />
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        We'll drop your words at the time you pick.
      </p>
    </div>
  );
};

export default TimeScheduler;
