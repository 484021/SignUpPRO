import { Header } from "@/components/header";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Privacy Policy - SignUpPRO",
  description: "Learn how SignUpPRO protects your data and respects your privacy.",
};

export default function PrivacyPage() {
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
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              Privacy Policy
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Last updated: December 12, 2025
            </p>
          </div>
        </div>

        {/* Content */}
        <Card className="p-8 sm:p-12 bg-white/60 backdrop-blur-xl border-slate-200 dark:bg-slate-900/40 dark:border-slate-800">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h2>1. Information We Collect</h2>
            <p>
              SignUpPRO collects information you provide when creating an account,
              organizing events, or signing up for events. This includes:
            </p>
            <ul>
              <li>Email address and name</li>
              <li>Event details and signup information</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Usage data and analytics</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide and improve our event management services</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send event notifications and updates</li>
              <li>Communicate about your account and our services</li>
              <li>Analyze usage patterns to enhance user experience</li>
            </ul>

            <h2>3. Data Sharing and Disclosure</h2>
            <p>
              We do not sell your personal information. We may share your information
              with:
            </p>
            <ul>
              <li>
                <strong>Event organizers:</strong> When you sign up for an event, your
                signup information is shared with the organizer
              </li>
              <li>
                <strong>Service providers:</strong> Third-party services like Stripe
                for payment processing and hosting providers
              </li>
              <li>
                <strong>Legal requirements:</strong> When required by law or to protect
                our rights
              </li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data,
              including encryption, secure hosting, and regular security audits.
              However, no method of transmission over the internet is 100% secure.
            </p>

            <h2>5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your account and data</li>
              <li>Export your data</li>
              <li>Opt out of marketing communications</li>
            </ul>

            <h2>6. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to provide functionality,
              analyze usage, and improve our services. You can control cookie
              preferences through your browser settings.
            </p>

            <h2>7. Children's Privacy</h2>
            <p>
              SignUpPRO is not intended for users under 13 years of age. We do not
              knowingly collect information from children under 13.
            </p>

            <h2>8. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you
              of significant changes by email or through our service.
            </p>

            <h2>9. Contact Us</h2>
            <p>
              If you have questions about this privacy policy or our data practices,
              please contact us at:{" "}
              <Link
                href="/contact"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                contact page
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
