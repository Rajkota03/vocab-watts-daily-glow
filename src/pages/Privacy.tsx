
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto prose prose-slate">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy for Glintup</h1>
          
          <p className="text-gray-600 mb-6">
            Last updated: 12 August 2025
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p>Glintup ("we," "our," or "us") provides vocabulary learning content to users via WhatsApp messages. We respect your privacy and are committed to protecting your personal data.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Phone number (required for sending WhatsApp messages)</li>
              <li>Name (optional, if provided by the user)</li>
              <li>Message interaction history (to improve our service)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To send vocabulary and learning content through WhatsApp</li>
              <li>To improve and personalize your experience</li>
              <li>To respond to your inquiries</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Data Sharing</h2>
            <p>We do not sell, rent, or trade your personal information. Data is only shared with trusted service providers necessary to operate our WhatsApp messaging service.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Data Retention</h2>
            <p>We retain your information for as long as you use our service or as required by law. You can request deletion of your data at any time.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Your Rights</h2>
            <p>You have the right to request:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access to the data we hold about you</li>
              <li>Correction of any incorrect data</li>
              <li>Deletion of your personal data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Security</h2>
            <p>We take reasonable technical and organizational measures to protect your personal data.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, you can contact us at:</p>
            <p className="mt-2">📧 Email: support@glintup.com</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
