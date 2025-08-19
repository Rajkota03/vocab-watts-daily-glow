import React from 'react';
import { Users } from 'lucide-react';

const SocialProofBar = () => {
  return (
    <div className="bg-muted/50 py-4">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Join 1000+ learners building vocabulary daily</span>
        </div>
      </div>
    </div>
  );
};

export default SocialProofBar;