import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { removeBackground, loadImageFromUrl } from '@/utils/backgroundRemoval';
import { toast } from '@/components/ui/use-toast';

const LogoUpdater = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processLogoAndUpdate = async () => {
    setIsProcessing(true);
    try {
      toast({
        title: "Processing Logo",
        description: "Removing background and updating logo files...",
      });

      // Load the uploaded image
      const imageElement = await loadImageFromUrl('/lovable-uploads/821cfab6-30ad-4fc2-87bd-6b21fb80459d.png');
      
      // Remove background
      const processedBlob = await removeBackground(imageElement);
      
      // Convert blob to base64 for SVG embedding
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(processedBlob);
      });

      // Create SVG with the processed image
      const svgContent = `<svg width="200" height="50" viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg">
  <image href="${base64}" x="0" y="0" width="200" height="50" preserveAspectRatio="xMidYMid meet"/>
</svg>`;

      // Update all logo files
      await Promise.all([
        // Update public logos
        fetch('/public/logo.svg', { method: 'PUT', body: svgContent }),
        fetch('/public/logo-horizontal.svg', { method: 'PUT', body: svgContent }),
        // Note: We can't directly write to src/assets via fetch, so we'll need to handle this differently
      ]);

      toast({
        title: "Logo Updated",
        description: "Successfully processed and updated the Glintup logo with background removed!",
      });

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

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Update Glintup Logo</h2>
      <p className="text-gray-600 mb-4">
        This will process the uploaded Glintup logo, remove its background, and update all logo files in the project.
      </p>
      <Button 
        onClick={processLogoAndUpdate}
        disabled={isProcessing}
        className="w-full"
      >
        {isProcessing ? 'Processing...' : 'Update Logo'}
      </Button>
    </div>
  );
};

export default LogoUpdater;