"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
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

          <h1 className="font-heading font-bold text-3xl text-text-primary mb-2">Privacy Policy</h1>
          <p className="text-text-muted text-sm mb-10">Last updated: May 13, 2026</p>

          <div className="space-y-8 text-text-muted text-sm leading-relaxed">
            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">1. Introduction</h2>
              <p>
                Admio (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the website admio.io and related services.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">2. Information We Collect</h2>
              <p className="mb-3"><span className="text-text-primary font-medium">Information you provide directly:</span></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Name and email address (account creation)</li>
                <li>Password (encrypted, never stored in plain text)</li>
                <li>Education information: grade level, GPA range, test scores, dream college, major interest</li>
                <li>Country and target country for college</li>
                <li>Extracurricular activities, awards, and honors</li>
                <li>Personal strengths, areas for improvement, personal story</li>
                <li>Family background and financial aid needs</li>
                <li>Special circumstances (e.g., international student status, disabilities)</li>
              </ul>
              <p className="mt-3"><span className="text-text-primary font-medium">Information collected automatically:</span></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Usage data: message counts, login streaks, feature interactions</li>
                <li>Device information: browser type, operating system (for authentication)</li>
                <li>Authentication tokens and session data</li>
              </ul>
              <p className="mt-3"><span className="text-text-primary font-medium">Derived data:</span></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>AI-generated recommendations, essays, and college lists based on your profile</li>
                <li>Profile strength scores and progress metrics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide personalized college admissions guidance via AI</li>
                <li>Generate tailored college recommendations, essay feedback, and activity suggestions</li>
                <li>Maintain your account and track your progress</li>
                <li>Send transactional emails (password resets, account verification)</li>
                <li>Improve and develop our services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">4. Sensitive Information</h2>
              <p>
                We may collect sensitive information including education records, financial situation,
                family background, and special circumstances (such as disabilities). This information is
                used solely to provide you with more accurate and personalized guidance. We do not sell
                or share sensitive information with third parties for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">5. AI Processing</h2>
              <p>
                Your profile data is processed by AI models (provided by Anthropic) to generate personalized
                recommendations. Your data is sent to these AI services only when you actively use AI features.
                We do not use your data to train AI models. AI outputs are informational and should not be
                treated as professional advice.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">6. Data Storage &amp; Security</h2>
              <p>
                Your data is stored securely using Supabase, which provides encryption at rest and in transit.
                Passwords are hashed and never stored in plain text. We implement industry-standard security
                measures to protect your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">7. Third-Party Services</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><span className="text-text-primary font-medium">Supabase:</span> Authentication and database hosting</li>
                <li><span className="text-text-primary font-medium">Anthropic (Claude AI):</span> AI-powered recommendations and guidance</li>
                <li><span className="text-text-primary font-medium">Stripe:</span> Payment processing (for Pro subscriptions)</li>
                <li><span className="text-text-primary font-medium">Vercel:</span> Website hosting</li>
              </ul>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">8. Data Retention</h2>
              <p>
                We retain your personal information for as long as your account is active. You may request
                deletion of your account and associated data at any time by contacting us at{" "}
                <a href="mailto:support@admio.io" className="text-purple hover:underline">support@admio.io</a>.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">9. Your Rights</h2>
              <p>Depending on your location, you may have the right to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to or restrict processing of your data</li>
                <li>Data portability</li>
              </ul>
              <p className="mt-2">
                To exercise any of these rights, contact us at{" "}
                <a href="mailto:support@admio.io" className="text-purple hover:underline">support@admio.io</a>.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">10. Children&apos;s Privacy</h2>
              <p>
                Admio is designed for high school students, some of whom may be under 18. We do not knowingly
                collect information from children under 13. If you are between 13 and 18, please ensure you have
                parental consent before using our services.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of material changes
                by posting the updated policy on this page with a new &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">12. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:support@admio.io" className="text-purple hover:underline">support@admio.io</a>.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex gap-4 text-xs text-text-muted">
            <Link href="/terms" className="hover:text-purple transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-purple transition-colors">Cookie Policy</Link>
            <Link href="/" className="hover:text-purple transition-colors">Back to Home</Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
