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
      <div className="pt-24 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Send bugs or feedback and we'll respond to the email you
                  provide. For urgent issues, email{" "}
                  <a
                    className="underline"
                    href="mailto:santhosh@hnbk.solutions"
                  >
                    santhosh@hnbk.solutions
                  </a>{" "}
                  directly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContactFormClient />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
