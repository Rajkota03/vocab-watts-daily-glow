
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto prose prose-slate">
          <h1 className="text-3xl font-bold mb-8">Terms of Service for Glintup</h1>
          
          <p className="text-gray-600 mb-6">
            Last updated: 12 August 2025
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p>These Terms of Service ("Terms") govern your use of Glintup's vocabulary learning service delivered via WhatsApp.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Use of Service</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must provide a valid phone number to receive messages.</li>
              <li>The service is intended for personal, non-commercial use.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Content</h2>
            <p>All vocabulary content provided is for educational purposes. We do not guarantee accuracy or completeness of definitions or examples.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Limitation of Liability</h2>
            <p>We are not responsible for any losses or damages arising from your use of the service.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Changes to Service</h2>
            <p>We reserve the right to modify or discontinue the service at any time without notice.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Governing Law</h2>
            <p>These Terms are governed by and construed under the laws of India.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Contact</h2>
            <p>For questions about these Terms, contact:</p>
            <p className="mt-2">📧 Email: support@glintup.com</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
