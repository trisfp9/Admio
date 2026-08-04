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
                Admio (&quot;the Service&quot;) is operated by <span className="text-text-primary">PT Multitritama Persada</span>
                {" "}(&quot;Admio,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), a company registered in Indonesia. By accessing or using
                the Service, you agree to be bound by these Terms of Service. If you do not agree to these terms,
                please do not use the Service. If you are under 18, you represent that you have parental or
                guardian consent to use the Service.
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
              <h2 className="text-text-primary font-semibold text-lg mb-3">5. Emails We Send</h2>
              <p className="mb-2">
                When you create an account, you agree to receive email from us at the address you signed up with.
                These fall into two groups:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <span className="text-text-primary">Service and account emails.</span> Email confirmation, password
                  resets, receipts, subscription and billing notices, and important changes to the service. These are
                  part of your account and cannot be turned off while your account is open.
                </li>
                <li>
                  <span className="text-text-primary">Weekly progress emails.</span> A short check in, normally once a
                  week, with your own progress figures such as your profile strength score, your streak and the next
                  step we suggest. These are optional and you can stop them at any time.
                </li>
              </ul>

              <p className="mt-3 mb-2 text-text-primary">How to stop weekly emails</p>
              <p className="mb-2">You can turn weekly progress emails off in either of these ways:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Go to <Link href="/profile" className="text-purple hover:underline">Profile</Link>, open Account
                  Settings, and switch off <span className="text-text-primary">Weekly progress emails</span>.
                </li>
                <li>
                  Click the <span className="text-text-primary">Unsubscribe from weekly emails</span> link at the
                  bottom of any weekly email. This works without signing in and applies straight away.
                </li>
              </ul>
              <p className="mt-2">
                Either method takes effect immediately and does not affect the rest of your account. You can turn them
                back on at any time from your Profile page. If you would rather email us, write to{" "}
                <span className="text-text-primary">support@admio.io</span> and we will action it for you.
              </p>
              <p className="mt-2">
                We do not sell your email address, and we do not send you marketing on behalf of anyone else.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">6. Acceptable Use</h2>
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
              <h2 className="text-text-primary font-semibold text-lg mb-3">7. Subscriptions &amp; Payments</h2>
              <p>
                Admio offers both free and paid (Pro) subscription tiers. Pro subscriptions are sold and
                processed by our authorized reseller and Merchant of Record,{" "}
                <span className="text-text-primary">Dodo Payments</span>, which acts as the seller of record
                for these transactions and handles payment processing, billing, and applicable sales taxes.
                Admio does not collect or process your payment details directly. You may cancel your
                subscription at any time. Refunds are governed by our{" "}
                <Link href="/refund" className="text-purple hover:underline">Refund Policy</Link> and are
                issued through Dodo Payments. We reserve the right to change pricing with reasonable notice.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">8. Intellectual Property</h2>
              <p>
                The Service, including its design, features, and content (excluding user-submitted data),
                is owned by Admio. AI-generated content created for you through the Service may be used by
                you for personal purposes. You retain ownership of all personal information and content
                you submit to the Service.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">9. Limitation of Liability</h2>
              <p>
                Admio is provided &quot;as is&quot; without warranties of any kind. We are not liable for any
                damages arising from your use of the Service, including but not limited to: college
                admissions outcomes, reliance on AI-generated content, or loss of data. Our total
                liability shall not exceed the amount you paid for the Service in the preceding 12 months.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">10. Termination</h2>
              <p>
                We may terminate or suspend your access to the Service at any time for violation of these
                terms. You may delete your account at any time by contacting us. Upon termination, your
                right to use the Service ceases immediately.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">11. Changes to Terms</h2>
              <p>
                We may update these Terms from time to time. Continued use of the Service after changes
                constitutes acceptance of the updated terms. We will notify users of material changes.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">12. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the Republic
                of Indonesia, without regard to its conflict-of-law provisions. Any disputes arising from
                these Terms or the Service shall first be resolved through good-faith negotiation and,
                failing that, before the competent courts of Indonesia.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">13. Contact Us</h2>
              <p>
                If you have questions about these Terms, please contact PT Multitritama Persada at{" "}
                <a href="mailto:support@admio.io" className="text-purple hover:underline">support@admio.io</a>.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex gap-4 text-xs text-text-muted">
            <Link href="/privacy" className="hover:text-purple transition-colors">Privacy Policy</Link>
            <Link href="/cookies" className="hover:text-purple transition-colors">Cookie Policy</Link>
            <Link href="/refund" className="hover:text-purple transition-colors">Refund Policy</Link>
            <Link href="/" className="hover:text-purple transition-colors">Back to Home</Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
