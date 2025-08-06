import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuthHandler } from '@/hooks/useAuthHandler';

interface EmailTestResponse {
  success: boolean;
  error?: string;
  message?: string;
  debugInfo?: any;
}

const SendEmailTestButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('daily-beginner');
  const [wordCount, setWordCount] = useState(3);
  const [forceNewWords, setForceNewWords] = useState(true); // Default to true for testing
  const [lastResult, setLastResult] = useState<string | null>(null);
  const { toast } = useToast();
  const { session } = useAuthHandler();

  const categories = [
    { value: 'daily-beginner', label: 'Daily - Beginner' },
    { value: 'daily-intermediate', label: 'Daily - Intermediate' },
    { value: 'daily-professional', label: 'Daily - Professional' },
    { value: 'business-beginner', label: 'Business - Beginner' },
    { value: 'business-intermediate', label: 'Business - Intermediate' },
    { value: 'business-professional', label: 'Business - Professional' },
    { value: 'interview-beginner', label: 'Interview - Beginner' },
    { value: 'interview-intermediate', label: 'Interview - Intermediate' },
    { value: 'interview-professional', label: 'Interview - Professional' },
    { value: 'slang-beginner', label: 'Slang - Beginner' },
    { value: 'slang-intermediate', label: 'Slang - Intermediate' },
    { value: 'exam-gre', label: 'Exam - GRE' },
    { value: 'exam-ielts', label: 'Exam - IELTS' },
    { value: 'exam-toefl', label: 'Exam - TOEFL' },
    { value: 'exam-cat', label: 'Exam - CAT' },
    { value: 'exam-gmat', label: 'Exam - GMAT' },
    { value: 'rare-beginner', label: 'Rare - Beginner' },
    { value: 'rare-intermediate', label: 'Rare - Intermediate' },
    { value: 'expression-beginner', label: 'Expression - Beginner' },
    { value: 'expression-intermediate', label: 'Expression - Intermediate' }
  ];

  const handleSendEmail = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to test",
        variant: "destructive"
      });
      return;
    }

    if (!session?.user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to test email functionality",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setLastResult(null);

    try {
      console.log(`Sending test email to: ${email.toLowerCase()}, category: ${category}, wordCount: ${wordCount}`);
      
      const { data, error } = await supabase.functions.invoke<EmailTestResponse>('send-vocab-email', {
        body: {
          email: email.toLowerCase(), // Normalize to lowercase
          category: category,
          wordCount: wordCount,
          user_id: session.user.id,
          debug: true,
          force_new_words: forceNewWords // Use the toggle value
        }
      });

      if (error) {
        console.error("Supabase function invocation error:", error);
        throw new Error(error.message || "Failed to invoke the send-vocab-email function.");
      }

      if (!data || !data.success) {
        console.error("Email function returned error:", data);
        let errorMessage = data?.error || "Failed to send test email";
        
        // Handle specific Resend errors
        if (errorMessage.includes("You can only send testing emails to your own email address")) {
          errorMessage = `🔒 Resend Free Tier Limitation: You can only send emails to your registered email address (${session?.user?.email}). To send to other addresses, you need to verify a domain at resend.com/domains`;
        }
        
        setLastResult(`❌ Error: ${errorMessage}`);
        toast({
          title: "Email Failed",
          description: errorMessage.length > 100 ? "Check details below" : errorMessage,
          variant: "destructive",
        });
        return;
      }

      // Success
      console.log("Email test response:", data);
      const successMessage = data.message || "Test email sent successfully!";
      setLastResult(`✅ Success: ${successMessage}`);
      
      toast({
        title: "Email Sent!",
        description: `Test vocabulary words sent to ${email.toLowerCase()}`,
      });

      // Show debug info if available
      if (data.debugInfo) {
        console.log("Debug info:", data.debugInfo);
        setLastResult(prev => prev + `\n\n📊 Debug Info:\n- Word Source: ${data.debugInfo.wordSource}\n- OpenAI Available: ${data.debugInfo.openAIAvailable}\n- Database Words: ${data.debugInfo.databaseWordsCount}\n- Previous Words: ${data.debugInfo.wordHistoryCount}`);
      }

    } catch (err: any) {
      console.error("Client-side error sending email:", err);
      const errorMessage = err.message || "An unexpected error occurred";
      setLastResult(`❌ Error: ${errorMessage}`);
      toast({
        title: "Failed to Send Email",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div>
          <label htmlFor="test-email" className="block text-sm font-medium mb-2">
            Email Address
          </label>
          <Input
            id="test-email"
            type="email"
            placeholder={session?.user?.email || "Enter your email address"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Free tier: Can only send to your registered email ({session?.user?.email})
          </p>
        </div>

        <div>
          <label htmlFor="category-select" className="block text-sm font-medium mb-2">
            Category
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category-select" className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="word-count" className="block text-sm font-medium mb-2">
            Number of Words
          </label>
          <Select value={wordCount.toString()} onValueChange={(value) => setWordCount(parseInt(value))}>
            <SelectTrigger id="word-count" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 word</SelectItem>
              <SelectItem value="2">2 words</SelectItem>
              <SelectItem value="3">3 words</SelectItem>
              <SelectItem value="4">4 words</SelectItem>
              <SelectItem value="5">5 words</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="force-new-words"
            checked={forceNewWords}
            onChange={(e) => setForceNewWords(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="force-new-words" className="text-sm font-medium">
            🔄 Always generate new words (ignore history)
          </label>
        </div>
        <p className="text-xs text-gray-500">
          {forceNewWords 
            ? "✅ Will generate fresh words every time (perfect for testing)"
            : "⚡ Will reuse existing words and avoid duplicates"
          }
        </p>
      </div>

      <Button
        onClick={handleSendEmail}
        disabled={loading || !email}
        className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Mail className="h-4 w-4 mr-2" />
        )}
        Send Test Email
      </Button>

      {lastResult && (
        <Alert className={lastResult.includes('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Test Result</AlertTitle>
          <AlertDescription style={{ whiteSpace: 'pre-wrap' }}>
            {lastResult}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SendEmailTestButton;