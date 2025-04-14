
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequestBody {
  email: string;
  category: string;
  wordCount?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, category, wordCount = 5 }: EmailRequestBody = await req.json();
    
    if (!email) {
      throw new Error('Email is required');
    }

    console.log(`Generating ${wordCount} vocabulary words for category: ${category} to send to ${email}`);

    let categoryPrompt = "";
    switch (category) {
      case "business":
        categoryPrompt = "professional business vocabulary that would be useful in a corporate environment";
        break;
      case "exam":
        categoryPrompt = "advanced academic vocabulary that would appear in standardized tests like SAT, GRE, or TOEFL";
        break;
      case "slang":
        categoryPrompt = "modern English slang and idioms used in casual conversation";
        break;
      case "general":
      default:
        categoryPrompt = "useful general vocabulary that would enhance everyday conversation";
        break;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are a vocabulary teaching assistant. Generate unique, interesting, and educational vocabulary words with clear definitions and helpful example sentences.` 
          },
          { 
            role: 'user', 
            content: `Generate ${wordCount} ${categoryPrompt}. Each word should be somewhat challenging but practical for everyday use.
            
            For each word, provide:
            1. The word itself
            2. A clear, concise definition
            3. A natural example sentence showing how to use it in context
            
            Format your response as a valid JSON array of objects with the properties: "word", "definition", "example", and "category".
            The category should be "${category}" for all words.
            Do not include any explanations or text outside the JSON array.` 
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON response from GPT
    let vocabWords;
    try {
      vocabWords = JSON.parse(content);
      console.log(`Successfully generated ${vocabWords.length} words`);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.log('Raw content:', content);
      throw new Error('Failed to parse vocabulary words from OpenAI response');
    }

    // Generate an HTML email with the words
    const emailHtml = generateEmailHtml(vocabWords, category);
    
    // For this demo, we'll just return the generated words
    // In a real implementation, you would integrate with an email service like Resend or SendGrid
    console.log(`Would send email to ${email} with ${vocabWords.length} words`);

    return new Response(JSON.stringify({ 
      success: true,
      message: `Email with ${vocabWords.length} vocabulary words would be sent to ${email}`,
      previewHtml: emailHtml,
      words: vocabWords 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-vocab-email function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateEmailHtml(words: any[], category: string): string {
  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
  
  let wordsHtml = '';
  words.forEach((word, index) => {
    wordsHtml += `
      <div style="margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 10px;">
        <h3 style="margin-top: 0; color: #3F3D56; font-size: 18px;">${index + 1}. ${word.word}</h3>
        <p style="margin: 8px 0; color: #555;"><strong>Definition:</strong> ${word.definition}</p>
        <p style="margin: 8px 0; color: #555;"><strong>Example:</strong> <em>${word.example}</em></p>
      </div>
    `;
  });
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Your Daily VocabSpark Words</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #3F3D56; margin-bottom: 10px;">VocabSpark</h1>
        <p style="color: #666; font-size: 16px;">Here are your ${categoryTitle} vocabulary words</p>
      </div>
      
      <div style="margin-bottom: 30px;">
        ${wordsHtml}
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 14px;">
        <p>This is a test email from VocabSpark.</p>
      </div>
    </body>
    </html>
  `;
}
