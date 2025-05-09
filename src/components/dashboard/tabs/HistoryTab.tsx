
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WordHistory from '@/components/dashboard/WordHistory';
import { useAuthHandler } from '@/hooks/useAuthHandler';

interface HistoryTabProps {
  isPro: boolean;
  category: string;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ isPro, category }) => {
  const { session } = useAuthHandler();
  const userId = session?.user?.id || '';

  return (
    <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
      <CardHeader className="bg-white border-b border-gray-50 p-4">
        <CardTitle className="text-xl font-semibold text-glintup-mint">
          Your Vocabulary History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <WordHistory
          category={category}
          userId={userId}
        />
      </CardContent>
    </Card>
  );
};

export default HistoryTab;
