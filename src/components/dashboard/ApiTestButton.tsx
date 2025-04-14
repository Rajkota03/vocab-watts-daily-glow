
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Send, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { markWordsAsSent } from '@/services/wordService';

interface ApiTestButtonProps {
  category: string;
}

const ApiTestButton: React.FC<ApiTestButtonProps> = ({ category }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const { toast } = useToast();

  const handleTestApi = async () => {
    if (showEmailInput && !email) {
      toast({
        title: "Email required",
        description: "Please enter an email address to receive the test vocabulary words.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Get user email if not provided
      let emailToUse = email;
      if (!emailToUse) {
        const { data: userData } = await supabase.auth.getUser();
        emailToUse = userData.user?.email;
        
        if (!emailToUse) {
          setShowEmailInput(true);
          setLoading(false);
          return;
        }
      }
      
      // Call the edge function to send the email
      const { data, error } = await supabase.functions.invoke('send-vocab-email', {
        body: {
          email: emailToUse,
          category: category,
          wordCount: 5
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to send email');
      }
      
      console.log('API test response:', data);
      
      // Mark the words as sent so they appear in the history
      if (data.words && Array.isArray(data.words) && data.words.length > 0) {
        try {
          // Convert the words to the format expected by markWordsAsSent
          const wordsToMark = data.words.map(word => ({
            id: word.id || crypto.randomUUID(),
            word: word.word,
            definition: word.definition,
            example: word.example,
            category: word.category,
            created_at: new Date().toISOString()
          }));
          
          await markWordsAsSent(wordsToMark, category);
          
          // Force refresh of word history
          const wordHistoryElement = document.getElementById('word-history');
          if (wordHistoryElement) {
            wordHistoryElement.classList.add('refresh-triggered');
            setTimeout(() => {
              wordHistoryElement.classList.remove('refresh-triggered');
            }, 100);
          }
        } catch (markError) {
          console.error('Error marking test words as sent:', markError);
        }
      }
      
      // Create a toast message based on whether we're using fallback words or not
      if (data.isUsingFallback) {
        toast({
          title: "Test completed with fallback words",
          description: (
            <div className="flex flex-col space-y-2">
              <div className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5" />
                <span>
                  Generated {data.words.length} sample words for category "{category}". 
                  <br />
                  The AI service is temporarily unavailable, so we're using sample words instead.
                  <br />
                  Check your email at {emailToUse}.
                </span>
              </div>
            </div>
          ),
          variant: "default"
        });
      } else {
        toast({
          title: "Test completed successfully!",
          description: `Generated ${data.words.length} words for category "${category}". Check your email at ${emailToUse}.`,
          variant: "default"
        });
      }
      
      // Reset state
      setShowEmailInput(false);
      setEmail('');
      
    } catch (error: any) {
      console.error('API test error:', error);
      toast({
        title: "API Test Failed",
        description: error.message || "An error occurred while testing the API",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {showEmailInput ? (
        <div className="flex flex-col space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vocab-purple"
          />
          <div className="flex space-x-2">
            <Button
              onClick={handleTestApi}
              variant="default"
              className="bg-vuilder-mint hover:bg-vuilder-mint/90 text-white"
              disabled={loading}
              size="sm"
            >
              {loading ? "Sending..." : "Send Test"}
              {!loading && <Send className="ml-2 h-4 w-4" />}
            </Button>
            <Button
              onClick={() => setShowEmailInput(false)}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={handleTestApi}
          variant="default"
          className="bg-vuilder-mint hover:bg-vuilder-mint/90 text-white" 
          disabled={loading}
        >
          {loading ? "Testing API..." : "API Test"}
          {!loading && <Send className="ml-2 h-4 w-4" />}
        </Button>
      )}
    </div>
  );
};

export default ApiTestButton;
