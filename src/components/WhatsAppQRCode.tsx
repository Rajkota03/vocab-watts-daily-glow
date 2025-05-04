
import React, { useEffect, useState } from 'react';
import { QrCode } from 'lucide-react';

interface WhatsAppQRCodeProps {
  whatsappLink: string;
  size?: number;
}

const WhatsAppQRCode = ({ whatsappLink, size = 180 }: WhatsAppQRCodeProps) => {
  const [qrCodeSrc, setQrCodeSrc] = useState<string>('');
  
  useEffect(() => {
    // Encode the WhatsApp link for the QR code
    const encodedLink = encodeURIComponent(whatsappLink);
    // Use Google Charts API to generate QR code
    const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chl=${encodedLink}&chs=${size}x${size}&choe=UTF-8&chld=L|0`;
    setQrCodeSrc(qrCodeUrl);
  }, [whatsappLink, size]);

  return (
    <div className="flex flex-col items-center">
      {qrCodeSrc ? (
        <div className="bg-white p-3 rounded-xl shadow-md">
          <img 
            src={qrCodeSrc} 
            alt="WhatsApp QR Code" 
            className="rounded-lg"
            width={size} 
            height={size}
          />
        </div>
      ) : (
        <div className="bg-white p-4 rounded-xl shadow-md flex items-center justify-center" style={{ width: size, height: size }}>
          <QrCode className="animate-pulse text-gray-300" size={size/2} />
        </div>
      )}
    </div>
  );
};

export default WhatsAppQRCode;
