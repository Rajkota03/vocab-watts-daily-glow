
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto prose prose-slate">
          <h1 className="text-3xl font-bold mb-8">Terms & Conditions</h1>
          
          <p className="text-gray-600 mb-6">
            Welcome to Glintup! These Terms & Conditions ("Terms") govern your use of our website and services ("Services"). 
            By using Glintup, you agree to these Terms.
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Eligibility</h2>
            <p>You must be at least 13 years old to use Glintup. By signing up, you confirm that the information provided is accurate.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Account & Access</h2>
            <p>You are responsible for maintaining the confidentiality of your account. You agree not to share login credentials or misuse our service.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Subscription & Payments</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Free users receive limited access (e.g., 3-day trial).</li>
              <li>Pro users get full access after subscribing via Razorpay.</li>
              <li>All charges are processed securely. You're responsible for reviewing pricing before subscribing.</li>
              <li>No refunds unless explicitly stated.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Use of the Service</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Resell Glintup content or access</li>
              <li>Abuse our platform (e.g., spamming, scraping, exploiting APIs)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Termination</h2>
            <p>We may suspend or terminate your account if you violate these Terms or abuse the platform.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p>We are not liable for any indirect or consequential damages resulting from your use of Glintup.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Changes</h2>
            <p>We may update these Terms. Continued use after changes implies your acceptance.</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
