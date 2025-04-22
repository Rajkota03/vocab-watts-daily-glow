
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const VocabularyTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Vocabulary Management</h2>
        <p className="text-muted-foreground">
          Manage vocabulary words, categories, and related content.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Vocabulary Database</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-md">
            <p className="text-muted-foreground">Vocabulary management feature coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VocabularyTab;
