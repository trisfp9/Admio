"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function RefundPolicyPage() {
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

          <h1 className="font-heading font-bold text-3xl text-text-primary mb-2">Refund Policy</h1>
          <p className="text-text-muted text-sm mb-10">Last updated: June 27, 2026</p>

          <div className="space-y-8 text-text-muted text-sm leading-relaxed">
            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">1. Overview</h2>
              <p>
                This Refund Policy explains when and how you can request a refund for an Admio Pro
                subscription. By purchasing a subscription, you agree to this policy together with our{" "}
                <Link href="/terms" className="text-purple hover:underline">Terms of Service</Link>. Payments
                are processed securely through our payment provider, DOKU.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">2. Free Trial &amp; Free Plan</h2>
              <p>
                Admio offers a free plan so you can evaluate the Service before paying. We strongly
                encourage you to use the free plan to confirm Admio meets your needs before upgrading to
                Pro. No payment is required for the free plan, and therefore no refund applies to it.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">3. 7-Day Money-Back Guarantee</h2>
              <p>
                If you are not satisfied with Admio Pro, you may request a full refund within{" "}
                <span className="text-text-primary">7 days</span> of your initial purchase, provided you
                have not made substantial use of paid features. &quot;Substantial use&quot; includes, for
                example, generating full roadmaps, running multiple AI essay reviews, or otherwise
                consuming a significant portion of your monthly Pro allowances. This guarantee applies only
                to your <span className="text-text-primary">first</span> purchase, not to subsequent
                renewals.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">4. Renewals</h2>
              <p>
                Admio Pro is billed on a recurring monthly basis unless you cancel. Renewal charges are
                generally <span className="text-text-primary">non-refundable</span>. To avoid being charged
                for the next billing cycle, cancel your subscription before your renewal date — you will
                keep Pro access until the end of the period you already paid for. If a renewal was charged
                due to a genuine error (for example, a failure to process a timely cancellation on our
                side), contact us and we will make it right.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">5. Eligible Circumstances</h2>
              <p className="mb-2">We will consider refunds outside the 7-day window in cases such as:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Duplicate or accidental charges for the same subscription period</li>
                <li>You were charged after a valid, timely cancellation</li>
                <li>A sustained technical fault on our side that prevented you from using paid features</li>
                <li>Unauthorized use of your payment method (subject to verification)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">6. Non-Refundable Situations</h2>
              <p className="mb-2">Refunds are generally not available where:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The 7-day money-back window has passed</li>
                <li>You have substantially used Pro features during the billing period</li>
                <li>You are dissatisfied with college admissions outcomes or AI-generated guidance, which are informational and not guaranteed</li>
                <li>Your account was suspended or terminated for violating our Terms of Service</li>
                <li>The request relates to a partial, unused portion of an active billing period (we do not prorate)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">7. How to Request a Refund</h2>
              <p>
                To request a refund, email{" "}
                <a href="mailto:support@admio.io" className="text-purple hover:underline">support@admio.io</a>{" "}
                from the email address associated with your account. Please include your account email, the
                approximate date of the charge, and the reason for your request. Submitting from your
                account email helps us verify the request and respond faster.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">8. Processing Time</h2>
              <p>
                We aim to review refund requests within <span className="text-text-primary">5 business
                days</span>. Approved refunds are issued to your original payment method through DOKU. The
                time for funds to appear depends on your bank or payment provider and is outside our
                control — it typically takes an additional 5–14 business days. Refunds are made in the
                original currency of the transaction (IDR); we are not responsible for any exchange-rate
                differences or fees applied by your bank or card issuer.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this Refund Policy from time to time. Any changes apply to purchases made
                after the updated policy is posted. The &quot;Last updated&quot; date above reflects the
                most recent revision.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">10. Contact Us</h2>
              <p>
                Questions about this Refund Policy? Reach us at{" "}
                <a href="mailto:support@admio.io" className="text-purple hover:underline">support@admio.io</a>.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex gap-4 text-xs text-text-muted">
            <Link href="/terms" className="hover:text-purple transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-purple transition-colors">Privacy Policy</Link>
            <Link href="/cookies" className="hover:text-purple transition-colors">Cookie Policy</Link>
            <Link href="/" className="hover:text-purple transition-colors">Back to Home</Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
