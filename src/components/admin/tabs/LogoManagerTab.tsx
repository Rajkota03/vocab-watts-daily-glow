import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Image, Trash2, Download } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';

const LogoManager = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentLogos, setCurrentLogos] = useState({
    main_logo: '/public/logo.svg',
    horizontal_logo: '/public/logo-horizontal.svg'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processLogo(file);
    }
  };

  const processLogo = async (file: File) => {
    setIsProcessing(true);
    try {
      toast({
        title: "Processing Logo",
        description: "Uploading and processing your logo...",
      });

      // Load the image
      const imageElement = await loadImage(file);
      
      // Remove background
      const processedBlob = await removeBackground(imageElement);
      
      // Upload to Supabase Storage
      const fileName = `logo-${Date.now()}.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, processedBlob, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      // Update app settings
      const newLogoConfig = {
        main_logo: publicUrl,
        horizontal_logo: publicUrl
      };

      const { error: settingsError } = await supabase
        .from('app_settings')
        .upsert({
          setting_key: 'logo_config',
          setting_value: newLogoConfig,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (settingsError) {
        throw settingsError;
      }

      setCurrentLogos(newLogoConfig);

      toast({
        title: "Logo Updated",
        description: "Your logo has been processed and updated throughout the app!",
      });

      // Refresh the page to show the new logo
      window.location.reload();

    } catch (error) {
      console.error('Error processing logo:', error);
      toast({
        title: "Error",
        description: "Failed to process logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSampleLogo = () => {
    // Create a sample logo file for download
    const link = document.createElement('a');
    link.href = '/lovable-uploads/821cfab6-30ad-4fc2-87bd-6b21fb80459d.png';
    link.download = 'sample-glintup-logo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Logo Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Current Logo Preview */}
          <div className="space-y-4">
            <Label>Current Logo</Label>
            <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
              <img 
                src={currentLogos.main_logo} 
                alt="Current Logo" 
                className="max-h-16 object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/public/logo.svg';
                }}
              />
            </div>
          </div>

          {/* Upload Section */}
          <div className="space-y-4">
            <Label>Upload New Logo</Label>
            <div className="flex flex-col gap-4">
              
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full"
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Choose Logo File'}
              </Button>

              <div className="text-sm text-gray-500 space-y-1">
                <p>• Recommended: PNG or JPG format</p>
                <p>• Background will be automatically removed</p>
                <p>• Logo will be optimized for all sizes</p>
                <p>• Changes will appear throughout the app</p>
              </div>
            </div>
          </div>

          {/* Sample Logo Download */}
          <div className="space-y-4 pt-4 border-t">
            <Label>Sample Logo</Label>
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/821cfab6-30ad-4fc2-87bd-6b21fb80459d.png" 
                alt="Sample Glintup Logo" 
                className="h-12 object-contain border rounded"
              />
              <Button
                onClick={downloadSampleLogo}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Sample
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Download the sample Glintup logo to use as a reference or starting point.
            </p>
          </div>

          {/* Logo Usage Info */}
          <div className="space-y-2 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900">Logo Usage</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Main logo appears in the header and footer</p>
              <p>• Horizontal logo is used in wider layout sections</p>
              <p>• All logos are automatically updated when you upload a new one</p>
              <p>• Only admins can update logos</p>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default LogoManager;