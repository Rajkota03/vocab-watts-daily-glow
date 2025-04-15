import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Send, AlertTriangle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface ApiTestButtonProps {
  category: string;
}

const ApiTestButton: React.FC<ApiTestButtonProps> = ({ category }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
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
      setDebugInfo(null);
      
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
      
      // Get current user ID for word history tracking
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      
      if (!userId) {
        toast({
          title: "Authentication required",
          description: "Please log in to use this feature.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      console.log(`Starting API test for category: ${category}, email: ${emailToUse}, user: ${userId}`);
      
      // First, call the generate-vocab-words function directly to test it
      console.log(`Testing generate-vocab-words for category: ${category}`);
      const { data: generateData, error: generateError } = await supabase.functions.invoke('generate-vocab-words', {
        body: {
          category: category,
          count: 5
        }
      });
      
      if (generateError) {
        console.error("Error calling generate-vocab-words:", generateError);
        setDebugInfo(JSON.stringify({
          generateError: generateError,
          timestamp: new Date().toISOString()
        }, null, 2));
        throw new Error(`Failed to generate words: ${generateError.message}`);
      }
      
      console.log("Generate vocab words response:", generateData);
      
      if (!generateData || !generateData.words || generateData.error) {
        console.error("Invalid response from generate-vocab-words:", generateData);
        setDebugInfo(JSON.stringify({
          generateResponse: generateData,
          timestamp: new Date().toISOString()
        }, null, 2));
        throw new Error(generateData?.error || "Failed to generate vocabulary words");
      }
      
      // Log the first word for debugging
      if (generateData.words.length > 0) {
        console.log(`First generated word: ${JSON.stringify(generateData.words[0])}`);
      }
      
      // If generate-vocab-words succeeded, call send-vocab-email
      const { data, error } = await supabase.functions.invoke('send-vocab-email', {
        body: {
          email: emailToUse,
          category: category,
          wordCount: 5,
          force_new_words: true, // Force the generation of new words
          user_id: userId, // Pass the user ID for word history tracking
          debug: true // Enable additional debug info
        }
      });
      
      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }
      
      if (!data || data.error) {
        console.error("Data error:", data?.error);
        throw new Error(data?.error || 'Failed to send email');
      }
      
      // Log the full response for debugging
      console.log('API test full response:', data);

      // Set debug info if available
      if (data.debugInfo || generateData) {
        setDebugInfo(JSON.stringify({
          generateResponse: generateData,
          emailResponse: data,
          timestamp: new Date().toISOString()
        }, null, 2));
      }
      
      // Force refresh of word history by triggering a custom event - immediately
      const refreshEvent = new CustomEvent('refresh-word-history', {
        detail: { category: category, force: true }
      });
      document.dispatchEvent(refreshEvent);
      console.log('Dispatched refresh-word-history event with force flag');
      
      // Create a toast message based on whether we're using fallback words or not
      if (data.isUsingFallback) {
        toast({
          title: "Test completed with fallback words",
          description: `Generated ${data.words.length} sample words for category "${category}". The AI service is temporarily unavailable, so we're using sample words instead. Check your email at ${emailToUse}.`
        });
      } else {
        toast({
          title: "Test completed successfully!",
          description: `Generated ${data.words.length} new words for category "${category}" using ${data.wordSource || 'AI'}. Check your email at ${emailToUse}.`,
        });
      }
      
      // Explicitly trigger another refresh after a longer delay to ensure updated data
      setTimeout(() => {
        const secondRefreshEvent = new CustomEvent('refresh-word-history', {
          detail: { category: category, force: true }
        });
        document.dispatchEvent(secondRefreshEvent);
        console.log('Dispatched second refresh-word-history event with force flag');
      }, 2000);
      
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
    <div className="space-y-2">
      {showEmailInput ? (
        <div className="flex flex-col space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-vuilder-indigo transition-all duration-300"
          />
          <div className="flex space-x-2">
            <Button
              onClick={handleTestApi}
              variant="default"
              className="bg-gradient-to-r from-vuilder-indigo to-vuilder-indigo/90 hover:from-vuilder-indigo/90 hover:to-vuilder-indigo/80 text-white rounded-full transition-all shadow-sm"
              disabled={loading}
              size="sm"
            >
              {loading ? "Sending..." : "Send Test"}
              {!loading && <Send className="ml-2 h-4 w-4" />}
            </Button>
            <Button
              onClick={() => setShowEmailInput(false)}
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
          onClick={handleTestApi}
          variant="default"
          className="bg-gradient-to-r from-vuilder-indigo to-vuilder-indigo/90 hover:from-vuilder-indigo/90 hover:to-vuilder-indigo/80 text-white rounded-full transition-all shadow-sm" 
          disabled={loading}
        >
          {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          {loading ? "Testing API..." : `Test ${category.charAt(0).toUpperCase() + category.slice(1)} API`}
        </Button>
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

export default ApiTestButton;
