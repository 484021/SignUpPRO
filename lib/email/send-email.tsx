"use server"

export async function sendSignupConfirmation(data: {
  to: string
  name: string
  eventTitle: string
  slotName: string
  eventDate: string
  manageUrl: string
}) {
  // In production, integrate with Resend, SendGrid, or your email provider
  // For now, we'll log the email details
  console.log("[v0] Email would be sent:", {
    to: data.to,
    subject: `Confirmation: ${data.eventTitle}`,
    body: `
      Hi ${data.name},
      
      You're confirmed for ${data.eventTitle}!
      
      Details:
      - Event: ${data.eventTitle}
      - Slot: ${data.slotName}
      - Date: ${data.eventDate}
      
      Manage your signup: ${data.manageUrl}
      
      See you there!
    `,
  })

  // TODO: Replace with actual email sending
  // Example with Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({
  //   from: 'EventSignup <noreply@yourdomain.com>',
  //   to: data.to,
  //   subject: `Confirmation: ${data.eventTitle}`,
  //   html: `<p>Hi ${data.name},</p>...`
  // })

  return { success: true }
}

export async function sendWaitlistConfirmation(data: {
  to: string
  name: string
  eventTitle: string
  slotName: string
  position: number
  manageUrl: string
}) {
  console.log("[v0] Waitlist email would be sent:", {
    to: data.to,
    subject: `Waitlist: ${data.eventTitle}`,
    body: `
      Hi ${data.name},
      
      You're on the waitlist for ${data.eventTitle}!
      
      Details:
      - Event: ${data.eventTitle}
      - Slot: ${data.slotName}
      - Position: #${data.position}
      
      We'll notify you if a spot opens up.
      Manage your waitlist entry: ${data.manageUrl}
    `,
  })

  return { success: true }
}

export async function sendCancellationConfirmation(data: {
  to: string
  name: string
  eventTitle: string
}) {
  console.log("[v0] Cancellation email would be sent:", {
    to: data.to,
    subject: `Cancelled: ${data.eventTitle}`,
    body: `
      Hi ${data.name},
      
      Your signup for ${data.eventTitle} has been cancelled.
      
      You're welcome to sign up again if spots are available.
    `,
  })

  return { success: true }
}
