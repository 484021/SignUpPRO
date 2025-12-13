import { Header } from "@/components/header";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Terms of Service - SignUpPRO",
  description:
    "Terms and conditions for using SignUpPRO event management platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen app-bg">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl pt-28 pb-16">
        {/* Back button */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 text-white shadow-lg">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              Terms of Service
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Last updated: December 12, 2025
            </p>
          </div>
        </div>

        {/* Content */}
        <Card className="p-8 sm:p-12 bg-white/60 backdrop-blur-xl border-slate-200 dark:bg-slate-900/40 dark:border-slate-800">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using SignUpPRO, you agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do
              not use our service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              SignUpPRO provides an event management platform that allows
              organizers to create events, manage signups, and handle recurring
              schedules. Participants can sign up for events without creating an
              account.
            </p>

            <h2>3. Account Registration and Security</h2>
            <p>
              To use certain features, you must create an account. You agree to:
            </p>
            <ul>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>

            <h2>4. Subscription Plans and Billing</h2>
            <p>
              SignUpPRO offers free and paid subscription plans. For paid plans:
            </p>
            <ul>
              <li>Billing is processed through Stripe on a monthly basis</li>
              <li>Charges are non-refundable except as required by law</li>
              <li>You can cancel your subscription at any time</li>
              <li>
                We reserve the right to change pricing with 30 days' notice
              </li>
            </ul>

            <h2>5. Free Plan Limitations</h2>
            <p>Free accounts are limited to:</p>
            <ul>
              <li>1 active event at a time</li>
              <li>Basic event management features</li>
              <li>Standard support</li>
            </ul>
            <p>
              Upgrade to a paid plan to unlock unlimited events, recurring event
              management, and priority support.
            </p>

            <h2>6. User Content and Conduct</h2>
            <p>
              You are responsible for all content you create or share. You agree
              not to:
            </p>
            <ul>
              <li>Use the service for illegal purposes</li>
              <li>Upload malicious code or spam</li>
              <li>Infringe on intellectual property rights</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Attempt to bypass security measures or rate limits</li>
            </ul>

            <h2>7. Intellectual Property</h2>
            <p>
              SignUpPRO and its original content, features, and functionality
              are owned by us and protected by copyright, trademark, and other
              laws. You retain ownership of content you create.
            </p>

            <h2>8. Data and Privacy</h2>
            <p>
              Your use of SignUpPRO is also governed by our{" "}
              <Link
                href="/privacy"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Privacy Policy
              </Link>
              . We collect and use data as described in that policy.
            </p>

            <h2>9. Service Availability</h2>
            <p>
              We strive to maintain high availability but do not guarantee
              uninterrupted access. We may:
            </p>
            <ul>
              <li>Perform maintenance that temporarily limits access</li>
              <li>Modify or discontinue features with notice</li>
              <li>Suspend accounts that violate these terms</li>
            </ul>

            <h2>10. Limitation of Liability</h2>
            <p>
              SignUpPRO is provided "as is" without warranties. We are not
              liable for indirect, incidental, or consequential damages arising
              from your use of the service.
            </p>

            <h2>11. Termination</h2>
            <p>
              We may terminate or suspend your account if you violate these
              terms. You may delete your account at any time through account
              settings.
            </p>

            <h2>12. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of
              SignUpPRO after changes constitutes acceptance of the new terms.
            </p>

            <h2>13. Governing Law</h2>
            <p>
              These terms are governed by the laws of your jurisdiction. Any
              disputes will be resolved through binding arbitration.
            </p>

            <h2>14. Contact Information</h2>
            <p>
              Questions about these terms? Contact us through our{" "}
              <Link
                href="/contact"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                contact page
              </Link>
              .
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
