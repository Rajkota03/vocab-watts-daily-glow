
import { useState, useEffect } from 'react';

export const useRazorpay = () => {
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    const loadRazorpay = async () => {
      if (typeof window.Razorpay === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          console.log('Razorpay script loaded successfully');
          setRazorpayLoaded(true);
        };
        script.onerror = () => {
          console.error('Failed to load Razorpay script');
        };
        document.body.appendChild(script);
      } else {
        setRazorpayLoaded(true);
      }
    };

    loadRazorpay();
  }, []);

  return razorpayLoaded;
};
