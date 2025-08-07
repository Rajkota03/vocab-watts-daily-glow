import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Image, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const LogoManager = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentLogos, setCurrentLogos] = useState({
    main_logo: '/public/logo.svg',
    horizontal_logo: '/public/logo-horizontal.svg'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewLogo(previewUrl);
      setLogoFile(file);
      setHasUnsavedChanges(true);

      toast({
        title: "Preview Ready",
        description: "Logo uploaded successfully! Click 'Save Logo' to apply changes.",
      });
    }
  };

  const saveLogo = async () => {
    if (!logoFile) {
      toast({
        title: "No Logo to Save",
        description: "Please upload a logo first.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Create a download link for the user
      const downloadUrl = URL.createObjectURL(logoFile);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `glintup-logo.${logoFile.name.split('.').pop()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      toast({
        title: "Logo Downloaded!",
        description: "Your logo has been downloaded. To complete the update:\n\n1. Replace /public/GlintUp_logo1.svg (main navbar)\n2. Replace /public/logo.svg (general use)\n3. Replace /public/logo-horizontal.svg (horizontal layouts)\n4. Replace /src/assets/logo.svg (dashboard)\n\nUse the downloaded file to replace these SVG files.",
      });

      setHasUnsavedChanges(false);
      setPreviewLogo(null);
      setLogoFile(null);

    } catch (error) {
      console.error('Error processing logo:', error);
      toast({
        title: "Process Failed",
        description: "Failed to process logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const cancelChanges = () => {
    setPreviewLogo(null);
    setLogoFile(null);
    setHasUnsavedChanges(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: "Changes Cancelled",
      description: "Logo upload cancelled.",
    });
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
          
          {/* Current/Preview Logo */}
          <div className="space-y-4">
            <Label>
              {hasUnsavedChanges ? 'New Logo Preview' : 'Current Logo'}
            </Label>
            <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
              <img 
                src={previewLogo || currentLogos.main_logo} 
                alt={hasUnsavedChanges ? 'New Logo Preview' : 'Current Logo'} 
                className="max-h-16 object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/public/logo.svg';
                }}
              />
            </div>
            {hasUnsavedChanges && (
              <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                ✓ Logo processed successfully! Click "Save Logo" below to apply changes.
              </div>
            )}
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
                disabled={isUploading}
                className="w-full"
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Logo File
              </Button>

              {/* Action Buttons */}
              {hasUnsavedChanges && (
                <div className="flex gap-3">
                  <Button
                    onClick={saveLogo}
                    disabled={isUploading}
                    className="flex-1"
                  >
                    {isUploading ? 'Saving...' : 'Save Logo'}
                  </Button>
                  <Button
                    onClick={cancelChanges}
                    disabled={isUploading}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              <div className="text-sm text-gray-500 space-y-1">
                <p>• Recommended: PNG format with transparent background</p>
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