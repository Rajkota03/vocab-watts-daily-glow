
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  is_pro: boolean;
  category: string;
  phone_number: string;
}

export const useCategoryManagement = () => {
  const [subscription, setSubscription] = useState<Subscription>({
    is_pro: true,
    category: 'business-intermediate',
    phone_number: '+1234567890'
  });
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeCategory = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userMetadata = session.user.user_metadata;
        if (userMetadata) {
          let category = userMetadata.category || 'business-intermediate';
          
          if (category && !category.includes('-')) {
            const mapping: { [key: string]: string } = {
              'business': 'business-intermediate',
              'exam': 'exam-gre',
              'slang': 'slang-intermediate',
              'general': 'daily-intermediate'
            };
            category = mapping[category] || 'business-intermediate';
          }
          
          setSubscription(prev => ({
            ...prev,
            is_pro: userMetadata.is_pro || true,
            category: category
          }));
        }
      }
    };

    initializeCategory();
  }, []);

  const handleCategoryUpdate = async (primary: string, subcategory: string) => {
    try {
      const combinedCategory = `${primary}-${subcategory}`;
      console.log("Updating category to:", combinedCategory);
      
      const { error } = await supabase.auth.updateUser({
        data: { category: combinedCategory }
      });
      
      if (error) throw error;
      
      setSubscription(prev => ({
        ...prev,
        category: combinedCategory
      }));
      
      toast({
        title: 'Category Updated',
        description: `Your word category is now set to ${combinedCategory}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update category',
        variant: 'destructive'
      });
    }
  };

  const handleNewBatch = async () => {
    if (isGeneratingBatch) return;
    
    setIsGeneratingBatch(true);
    try {
      const wordHistoryElement = document.getElementById('word-history');
      if (wordHistoryElement) {
        wordHistoryElement.classList.add('refresh-triggered');
        setTimeout(() => {
          wordHistoryElement.classList.remove('refresh-triggered');
        }, 100);
      }
      
      toast({
        title: "New words generated!",
        description: "New words have been added to your vocabulary.",
      });
    } catch (error: any) {
      console.error("Error generating new batch:", error);
      toast({
        title: "Error generating words",
        description: error.message || "Failed to generate new words",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  return {
    subscription,
    isGeneratingBatch,
    handleCategoryUpdate,
    handleNewBatch,
  };
};
