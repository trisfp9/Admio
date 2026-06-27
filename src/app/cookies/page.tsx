"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function CookiePolicyPage() {
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

          <h1 className="font-heading font-bold text-3xl text-text-primary mb-2">Cookie Policy</h1>
          <p className="text-text-muted text-sm mb-10">Last updated: May 13, 2026</p>

          <div className="space-y-8 text-text-muted text-sm leading-relaxed">
            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">1. What Are Cookies</h2>
              <p>
                Cookies are small text files stored on your device when you visit a website. They help
                the website remember your preferences and improve your experience. Admio uses cookies
                and similar technologies (like localStorage) to operate the Service.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">2. Cookies We Use</h2>

              <div className="glass-card p-4 mb-3">
                <p className="text-text-primary font-medium mb-1">Essential Cookies</p>
                <p>Required for the Service to function. These cannot be disabled.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><span className="text-text-primary">Authentication tokens</span> — Keep you signed in to your account (managed by Supabase)</li>
                  <li><span className="text-text-primary">Session data</span> — Maintain your active session across pages</li>
                </ul>
              </div>

              <div className="glass-card p-4 mb-3">
                <p className="text-text-primary font-medium mb-1">Functional Storage</p>
                <p>Used to remember your preferences and improve your experience.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><span className="text-text-primary">admio_version</span> — Tracks the app version to notify you of updates (localStorage)</li>
                  <li><span className="text-text-primary">Theme/UI preferences</span> — Remembers your display settings</li>
                </ul>
              </div>

              <div className="glass-card p-4">
                <p className="text-text-primary font-medium mb-1">Third-Party Cookies</p>
                <p>Set by services we use to operate Admio.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><span className="text-text-primary">Supabase</span> — Authentication and session management</li>
                  <li><span className="text-text-primary">DOKU</span> — Payment processing for Pro subscriptions (only on payment pages)</li>
                  <li><span className="text-text-primary">Vercel</span> — Hosting and performance analytics</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">3. What We Don&apos;t Use</h2>
              <p>Admio does <span className="text-text-primary font-medium">not</span> use:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Advertising or tracking cookies</li>
                <li>Cross-site tracking</li>
                <li>Third-party analytics cookies (e.g., Google Analytics)</li>
                <li>Social media tracking pixels</li>
              </ul>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">4. Managing Cookies</h2>
              <p>
                You can control cookies through your browser settings. Most browsers allow you to block
                or delete cookies. However, disabling essential cookies will prevent you from using
                Admio, as they are required for authentication and basic functionality.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">5. Changes to This Policy</h2>
              <p>
                We may update this Cookie Policy from time to time. Changes will be posted on this page
                with a new &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">6. Contact Us</h2>
              <p>
                If you have questions about our use of cookies, please contact us at{" "}
                <a href="mailto:support@admio.io" className="text-purple hover:underline">support@admio.io</a>.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex gap-4 text-xs text-text-muted">
            <Link href="/privacy" className="hover:text-purple transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-purple transition-colors">Terms of Service</Link>
            <Link href="/refund" className="hover:text-purple transition-colors">Refund Policy</Link>
            <Link href="/" className="hover:text-purple transition-colors">Back to Home</Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
