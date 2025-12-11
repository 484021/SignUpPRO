import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/send";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body || {};

    if (!email || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const to = "santhosh@hnbk.solutions";
    const mailSubject = `[Contact Form] ${subject || "No subject"}`;
    const html = `
      <p><strong>From:</strong> ${name || "(no name)"} &lt;${email}&gt;</p>
      <p><strong>Subject:</strong> ${subject || "(no subject)"}</p>
      <hr />
      <div>${(message || "").replace(/\n/g, "<br />")}</div>
    `;

    const result = await sendEmail({
      to,
      subject: mailSubject,
      html,
      text: message,
    });

    if (!result || !result.success) {
      return NextResponse.json(
        { success: false, error: result?.error || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || String(err) },
      { status: 500 }
    );
  }
}
