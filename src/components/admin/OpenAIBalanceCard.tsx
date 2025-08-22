import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, DollarSign, RefreshCw, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface OpenAIUsage {
  total_usage?: number;
  total_granted?: number;
  total_used?: number;
  effective_hard_limit?: number;
  system_hard_limit?: number;
}

const OpenAIBalanceCard = () => {
  const [usage, setUsage] = useState<OpenAIUsage | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchOpenAIUsage = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('check-openai-balance');
      
      if (error) {
        throw error;
      }

      setUsage(data);
    } catch (error) {
      console.error('Error fetching OpenAI usage:', error);
      toast({
        title: "Error",
        description: "Failed to fetch OpenAI usage data. Please check your API key.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenAIUsage();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getUsagePercentage = () => {
    if (!usage?.total_granted || !usage?.total_used) return 0;
    return (usage.total_used / usage.total_granted) * 100;
  };

  const getStatusColor = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return 'destructive';
    if (percentage >= 70) return 'default';
    return 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          OpenAI API Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Checking balance...</span>
          </div>
        ) : usage ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Granted</p>
                <p className="text-2xl font-bold text-green-600">
                  {usage.total_granted ? formatCurrency(usage.total_granted) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Used</p>
                <p className="text-2xl font-bold text-red-600">
                  {usage.total_used ? formatCurrency(usage.total_used) : 'N/A'}
                </p>
              </div>
            </div>
            
            {usage.total_granted && usage.total_used && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Usage</span>
                  <Badge variant={getStatusColor()}>
                    {getUsagePercentage().toFixed(1)}%
                  </Badge>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      getStatusColor() === 'destructive' ? 'bg-destructive' :
                      getStatusColor() === 'default' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(getUsagePercentage(), 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Remaining: {formatCurrency((usage.total_granted || 0) - (usage.total_used || 0))}
                </p>
              </div>
            )}

            {usage.effective_hard_limit && (
              <div>
                <p className="text-sm text-muted-foreground">Monthly Limit</p>
                <p className="font-semibold">{formatCurrency(usage.effective_hard_limit)}</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No usage data available
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            onClick={fetchOpenAIUsage} 
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={() => window.open('https://platform.openai.com/usage', '_blank')}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OpenAIBalanceCard;