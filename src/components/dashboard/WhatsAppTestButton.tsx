import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, AlertTriangle, RefreshCw, QrCode, Shield, BookOpen, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { sendVocabWords } from '@/services/whatsappService';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface WhatsAppTestButtonProps {
  category: string;
}

const WhatsAppTestButton: React.FC<WhatsAppTestButtonProps> = ({ category }) => {
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [sandboxMode, setSandboxMode] = useState(false);
  const [twilioAuthError, setTwilioAuthError] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("12:00");
  const { toast } = useToast();

  const formatWhatsAppNumber = (number: string): string => {
    let cleaned = number.replace(/\D/g, '');
    
    if (!cleaned.startsWith('1') && !cleaned.startsWith('91')) {
      if (cleaned.length === 10) {
        cleaned = '91' + cleaned;
      } else {
        cleaned = '1' + cleaned;
      }
    }
    
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  };

  const handleTestWhatsApp = async () => {
    if (showForm && !phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter a WhatsApp phone number to receive the test message.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      setDebugInfo(null);
      setSandboxMode(false);
      setTwilioAuthError(false);
      
      const formattedNumber = formatWhatsAppNumber(phoneNumber.trim());

      let scheduledTime: Date | undefined;
      if (selectedDate) {
        const [hours, minutes] = selectedTime.split(':').map(Number);
        scheduledTime = new Date(selectedDate);
        scheduledTime.setHours(hours, minutes);
      }
      
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          to: formattedNumber,
          message: `🌟 *Test Message from VocabSpark* 🌟\n\nThis is a test message from VocabSpark for the "${category}" category. If you're seeing this, WhatsApp integration is working correctly!\n\nThank you for using VocabSpark!`,
          category: category,
          isPro: true,
          scheduledTime: scheduledTime?.toISOString()
        }
      });
      
      if (error) {
        console.error("Edge function error:", error);
        throw new Error(`WhatsApp message failed: ${error.message}`);
      }
      
      console.log('WhatsApp test response:', data);
      
      if (data.sandboxMode) {
        setSandboxMode(true);
      }
      
      setDebugInfo(JSON.stringify({
        response: data,
        requestDetails: {
          to: formattedNumber,
          category: category,
          scheduledTime: scheduledTime?.toISOString()
        },
        timestamp: new Date().toISOString()
      }, null, 2));
      
      const scheduledText = scheduledTime 
        ? ` scheduled for ${format(scheduledTime, 'PPpp')}`
        : '';
      
      toast({
        title: "WhatsApp test message sent!",
        description: `A test message has been${scheduledText} to ${phoneNumber}. Check your WhatsApp app.`,
      });
      
      setShowForm(false);
      
    } catch (error: any) {
      console.error('WhatsApp test error:', error);
      setDebugInfo(JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2));
      
      toast({
        title: "WhatsApp Test Failed",
        description: error.message || "An error occurred while testing WhatsApp integration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendVocabWords = async () => {
    if (showForm && !phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter a WhatsApp phone number to receive vocabulary words.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      setDebugInfo(null);
      setSandboxMode(false);
      setTwilioAuthError(false);
      
      const formattedNumber = formatWhatsAppNumber(phoneNumber.trim());
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          to: formattedNumber,
          category: category,
          isPro: true,
          skipSubscriptionCheck: true,
          userId: user?.id
        }
      });
      
      if (error) {
        console.error("Edge function error:", error);
        throw new Error(`Failed to send vocabulary words: ${error.message}`);
      }
      
      console.log('WhatsApp vocabulary words sent successfully:', data);
      
      if (data.sandboxMode) {
        setSandboxMode(true);
      }
      
      toast({
        title: "Vocabulary words sent!",
        description: `Check your WhatsApp for the vocabulary words. Make sure you've joined the sandbox by sending 'join part-every' to +1 415 523 8886`,
      });
      
      setShowForm(false);
      
    } catch (error: any) {
      console.error('WhatsApp vocab words error:', error);
      setDebugInfo(JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2));
      
      toast({
        title: "WhatsApp Vocab Words Failed",
        description: error.message || "An error occurred while sending vocabulary words",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {showForm ? (
        <div className="flex flex-col space-y-2">
          <Input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter WhatsApp number (with country code)"
            className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-vuilder-indigo transition-all duration-300"
          />
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Time
              </label>
              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-vuilder-indigo transition-all duration-300"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleTestWhatsApp}
              variant="default"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full transition-all shadow-sm"
              disabled={loading}
              size="sm"
            >
              {loading ? "Sending..." : "Send Test Message"}
              {!loading && <Send className="ml-2 h-4 w-4" />}
            </Button>
            <Button
              onClick={handleSendVocabWords}
              variant="default"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full transition-all shadow-sm"
              disabled={loading}
              size="sm"
            >
              {loading ? "Sending..." : "Send Vocab Words"}
              {!loading && <BookOpen className="ml-2 h-4 w-4" />}
            </Button>
            <Button
              onClick={() => setShowForm(false)}
              variant="outline"
              className="rounded-full border-gray-300 hover:bg-gray-50"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setShowForm(true)}
          variant="default"
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full transition-all shadow-sm" 
          disabled={loading}
        >
          {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          {loading ? "Testing WhatsApp..." : "Test WhatsApp Integration"}
        </Button>
      )}
      
      {twilioAuthError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <Shield className="h-4 w-4 mr-2 text-red-500" />
            Twilio Authentication Failed
          </h4>
          <p className="text-xs mb-3">
            Your Twilio credentials appear to be invalid or missing. Please check:
          </p>
          <ol className="text-xs list-decimal pl-4 mb-3 space-y-1">
            <li>TWILIO_ACCOUNT_SID is correctly set in Supabase</li>
            <li>TWILIO_AUTH_TOKEN is correctly set in Supabase</li>
            <li>TWILIO_PHONE_NUMBER is correctly set in Supabase (optional)</li>
            <li>Twilio account is active and has proper permissions</li>
          </ol>
        </div>
      )}
      
      {sandboxMode && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
            Twilio Sandbox Mode Detected
          </h4>
          <p className="text-xs mb-3">
            Your Twilio account is in sandbox mode. Before you can receive messages, you need to:
          </p>
          <ol className="text-xs list-decimal pl-4 mb-3 space-y-1">
            <li>Open WhatsApp on your phone</li>
            <li>Send the message <strong>join part-every</strong> to <strong>+1 415 523 8886</strong></li>
            <li>Wait for confirmation that you've joined the sandbox</li>
            <li>Try the test message again</li>
          </ol>
          <div className="flex justify-center">
            <div className="bg-white p-2 rounded border border-gray-200 inline-block">
              <QrCode className="h-6 w-6 text-gray-500" />
            </div>
          </div>
        </div>
      )}
      
      {debugInfo && (
        <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs overflow-x-auto border border-gray-200 shadow-sm">
          <h4 className="text-sm font-medium mb-1 text-gray-700">Debug Info:</h4>
          <pre className="whitespace-pre-wrap text-gray-600">{debugInfo}</pre>
        </div>
      )}
    </div>
  );
};

export default WhatsAppTestButton;
