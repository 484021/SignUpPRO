import ContactFormClient from "@/components/contact-form-client";
import { NavPublic } from "@/components/nav-public";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const metadata = {
  title: "Contact Support - SignUpPRO",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen app-bg">
      <NavPublic />
      <main className="container mx-auto px-4 pt-28 pb-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions or feedback? We'd love to hear from you.
          </p>
        </div>

        <Card className="border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <ContactFormClient />
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            For urgent issues, email{" "}
            <a
              className="font-semibold text-foreground hover:text-purple-600 transition-colors"
              href="mailto:santhosh@hnbk.solutions"
            >
              santhosh@hnbk.solutions
            </a>{" "}
            directly.
          </p>
        </div>
      </main>
    </div>
  );
}
