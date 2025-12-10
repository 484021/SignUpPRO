import { Resend } from "resend"

let resend: Resend | null = null

try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
} catch (error) {
  console.error("Failed to initialize Resend client:", error)
}

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: SendEmailOptions) {
  const { to, subject, html, text = "" } = options

  if (!to || !subject || !html) {
    console.error("Missing required email parameters")
    return { success: false, error: "Missing required email parameters" }
  }

  if (!process.env.RESEND_API_KEY || !resend) {
    console.error("Resend API not configured")
    return { success: false, error: "Email service not configured" }
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "SignUpPRO <noreply@signuppro.app>"

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
      text,
    })

    if (error) {
      console.error("Resend API error:", error)
      return {
        success: false,
        error: error.message || "Failed to send email",
      }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Email send exception:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    }
  }
}
