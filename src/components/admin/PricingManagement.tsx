import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PricingConfig {
  id: string;
  plan_name: string;
  original_price: number;
  discounted_price?: number;
  discount_enabled: boolean;
  currency: string;
  billing_cycle: string;
}

const PricingManagement = () => {
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    original_price: '',
    discounted_price: '',
    discount_enabled: false
  });
  const { toast } = useToast();

  const fetchPricingConfig = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('pricing_config')
        .select('*')
        .eq('plan_name', 'pro')
        .single();

      if (error) throw error;

      setConfig(data);
      setFormData({
        original_price: data.original_price.toString(),
        discounted_price: data.discounted_price?.toString() || '',
        discount_enabled: data.discount_enabled
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingConfig();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updates: any = {
        original_price: parseFloat(formData.original_price),
        discount_enabled: formData.discount_enabled
      };

      if (formData.discount_enabled && formData.discounted_price) {
        updates.discounted_price = parseFloat(formData.discounted_price);
      } else {
        updates.discounted_price = null;
      }

      const { error } = await supabase
        .from('pricing_config')
        .update(updates)
        .eq('plan_name', 'pro');

      if (error) throw error;

      toast({
        title: "Success",
        description: "Pricing configuration updated successfully. Changes are live across the website!",
      });

      // Refresh local data and trigger global updates
      await fetchPricingConfig();
      
      // Force refresh all pricing displays by triggering a custom event
      window.dispatchEvent(new CustomEvent('pricingUpdated', { 
        detail: { 
          ...updates,
          plan_name: 'pro'
        } 
      }));
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading pricing configuration...</span>
        </CardContent>
      </Card>
    );
  }

  const effectivePrice = formData.discount_enabled && formData.discounted_price 
    ? parseFloat(formData.discounted_price) 
    : parseFloat(formData.original_price);

  const savingsAmount = formData.discount_enabled && formData.discounted_price
    ? parseFloat(formData.original_price) - parseFloat(formData.discounted_price)
    : 0;

  const savingsPercentage = savingsAmount > 0 
    ? Math.round((savingsAmount / parseFloat(formData.original_price)) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Pricing Management
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPricingConfig}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Original Price */}
          <div className="space-y-2">
            <Label htmlFor="original_price">Original Price (₹)</Label>
            <Input
              id="original_price"
              type="number"
              step="0.01"
              value={formData.original_price}
              onChange={(e) => handleInputChange('original_price', e.target.value)}
              placeholder="249.00"
            />
          </div>

          {/* Discount Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="discount_enabled"
              checked={formData.discount_enabled}
              onCheckedChange={(checked) => handleInputChange('discount_enabled', checked)}
            />
            <Label htmlFor="discount_enabled">Enable Discount</Label>
          </div>

          {/* Discounted Price */}
          {formData.discount_enabled && (
            <div className="space-y-2">
              <Label htmlFor="discounted_price">Discounted Price (₹)</Label>
              <Input
                id="discounted_price"
                type="number"
                step="0.01"
                value={formData.discounted_price}
                onChange={(e) => handleInputChange('discounted_price', e.target.value)}
                placeholder="199.00"
              />
            </div>
          )}

          {/* Preview */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium">Price Preview</h4>
            <div className="flex items-center gap-3">
              {formData.discount_enabled && formData.discounted_price ? (
                <>
                  <span className="text-2xl font-bold text-primary">₹{effectivePrice}</span>
                  <span className="text-lg text-gray-500 line-through">₹{formData.original_price}</span>
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">
                    {savingsPercentage}% OFF
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-primary">₹{formData.original_price}</span>
              )}
            </div>
            {savingsAmount > 0 && (
              <p className="text-sm text-green-600">
                Customers save ₹{savingsAmount} with this discount
              </p>
            )}
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !formData.original_price}
            className="w-full"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Pricing Configuration
              </>
            )}
          </Button>

          {/* Warning */}
          <Alert>
            <AlertDescription>
              Changes to pricing will be reflected across the entire website immediately. 
              Make sure to test the payment flow after making changes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingManagement;