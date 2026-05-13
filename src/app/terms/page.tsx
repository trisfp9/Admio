"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link href="/" className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple to-accent flex items-center justify-center">
              <img src="/logo.png" alt="Admio" className="w-[80%] h-[80%] object-contain" />
            </div>
            <span className="font-heading font-bold text-xl text-text-primary">Admio</span>
          </Link>

          <h1 className="font-heading font-bold text-3xl text-text-primary mb-2">Terms of Service</h1>
          <p className="text-text-muted text-sm mb-10">Last updated: May 13, 2026</p>

          <div className="space-y-8 text-text-muted text-sm leading-relaxed">
            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Admio (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
                If you do not agree to these terms, please do not use the Service. If you are under 18,
                you represent that you have parental or guardian consent to use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">2. Description of Service</h2>
              <p>
                Admio is an AI-powered college admissions guidance platform that provides personalized
                recommendations, essay assistance, activity suggestions, and college matching. The Service
                is designed to supplement, not replace, professional college counseling.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">3. AI Disclaimer</h2>
              <p>
                Admio uses artificial intelligence to generate recommendations and guidance. All AI-generated
                content is informational only and should not be considered professional advice. We do not
                guarantee the accuracy, completeness, or reliability of AI outputs. College admissions
                decisions are made by institutions, not by Admio. You are responsible for verifying all
                information and making your own decisions.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">4. User Accounts</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for maintaining the security of your account credentials</li>
                <li>You must not share your account with others</li>
                <li>You must be at least 13 years old to create an account</li>
                <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">5. Acceptable Use</h2>
              <p className="mb-2">You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the Service for any unlawful purpose</li>
                <li>Submit false or misleading information</li>
                <li>Attempt to access other users&apos; accounts or data</li>
                <li>Reverse-engineer, decompile, or disassemble any part of the Service</li>
                <li>Use automated tools to scrape or extract data from the Service</li>
                <li>Submit AI-generated content as your own original work in college applications without proper review and personalization</li>
              </ul>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">6. Subscriptions &amp; Payments</h2>
              <p>
                Admio offers both free and paid (Pro) subscription tiers. Pro subscriptions are billed
                through Stripe. You may cancel your subscription at any time. Refunds are handled on a
                case-by-case basis. We reserve the right to change pricing with reasonable notice.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">7. Intellectual Property</h2>
              <p>
                The Service, including its design, features, and content (excluding user-submitted data),
                is owned by Admio. AI-generated content created for you through the Service may be used by
                you for personal purposes. You retain ownership of all personal information and content
                you submit to the Service.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">8. Limitation of Liability</h2>
              <p>
                Admio is provided &quot;as is&quot; without warranties of any kind. We are not liable for any
                damages arising from your use of the Service, including but not limited to: college
                admissions outcomes, reliance on AI-generated content, or loss of data. Our total
                liability shall not exceed the amount you paid for the Service in the preceding 12 months.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">9. Termination</h2>
              <p>
                We may terminate or suspend your access to the Service at any time for violation of these
                terms. You may delete your account at any time by contacting us. Upon termination, your
                right to use the Service ceases immediately.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">10. Changes to Terms</h2>
              <p>
                We may update these Terms from time to time. Continued use of the Service after changes
                constitutes acceptance of the updated terms. We will notify users of material changes.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">11. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with applicable laws.
                Any disputes arising from these Terms or the Service shall be resolved through good-faith
                negotiation.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">12. Contact Us</h2>
              <p>
                If you have questions about these Terms, please contact us at{" "}
                <a href="mailto:admio.gen1@gmail.com" className="text-purple hover:underline">admio.gen1@gmail.com</a>.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex gap-4 text-xs text-text-muted">
            <Link href="/privacy" className="hover:text-purple transition-colors">Privacy Policy</Link>
            <Link href="/cookies" className="hover:text-purple transition-colors">Cookie Policy</Link>
            <Link href="/" className="hover:text-purple transition-colors">Back to Home</Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
