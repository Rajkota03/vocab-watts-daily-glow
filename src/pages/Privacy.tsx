
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto prose prose-slate">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
          
          <p className="text-gray-600 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          
          <p className="mb-6">
            Glintup ("we", "our", or "us") respects your privacy. This policy explains how we collect, use, and protect your information.
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email address (during signup)</li>
              <li>Word learning history</li>
              <li>Plan status (Free/Pro)</li>
              <li>Usage analytics (for feature improvement)</li>
              <li>WhatsApp number (if linked for word delivery)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. How We Use Your Info</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To deliver daily vocabulary</li>
              <li>To personalize your learning experience</li>
              <li>To send reminders or quiz links</li>
              <li>To process payments via Razorpay</li>
              <li>To monitor usage trends (anonymized)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Data Sharing</h2>
            <p>We do not sell your data. We only share it with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Twilio (for WhatsApp delivery)</li>
              <li>Razorpay (for secure payment processing)</li>
              <li>Supabase (for authentication and DB storage)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Your Rights</h2>
            <p>You can:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access or delete your data</li>
              <li>Request a data export</li>
              <li>Contact us at: support@glintup.com</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Data Security</h2>
            <p>All data is encrypted and stored securely. We follow standard best practices for web app security.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Cookies & Tracking</h2>
            <p>We use minimal analytics (e.g., Plausible, Mixpanel) to improve UX. You may disable cookies in your browser settings.</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
