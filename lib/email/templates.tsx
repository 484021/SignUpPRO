interface SignupConfirmationData {
  name: string
  eventTitle: string
  slotName: string
  eventDate: string
  eventTime?: string
  eventLocation?: string
  manageUrl: string
}

interface WaitlistData {
  name: string
  eventTitle: string
  slotName: string
  position: number
  manageUrl: string
}

export function getSignupConfirmationEmail(data: SignupConfirmationData) {
  console.log("[v0] getSignupConfirmationEmail called with:", data)

  if (!data || !data.name || !data.eventTitle || !data.slotName || !data.eventDate || !data.manageUrl) {
    console.error("[v0] Missing required data in getSignupConfirmationEmail:", data)
    throw new Error("Missing required data for confirmation email")
  }

  const { name, eventTitle, slotName, eventDate, eventTime, eventLocation, manageUrl } = data

  const subject = `✓ You're signed up for ${eventTitle}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #fff; padding: 30px 20px; border: 1px solid #e5e7eb; border-top: none; }
          .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .button { display: inline-block; background: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">✓ You're All Set!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Great news! You're confirmed for <strong>${eventTitle}</strong>.</p>
            
            <div class="details">
              <div class="detail-row">
                <span style="color: #6b7280;">Event:</span>
                <strong>${eventTitle}</strong>
              </div>
              <div class="detail-row">
                <span style="color: #6b7280;">Slot:</span>
                <strong>${slotName}</strong>
              </div>
              <div class="detail-row">
                <span style="color: #6b7280;">Date & Time:</span>
                <strong>${eventDate}</strong>
              </div>
              ${
                eventLocation
                  ? `
              <div class="detail-row">
                <span style="color: #6b7280;">Location:</span>
                <strong>${eventLocation}</strong>
              </div>
              `
                  : ""
              }
            </div>

            <p>Need to make changes? Use the link below to edit or cancel your signup:</p>
            <center>
              <a href="${manageUrl}" class="button">Manage My Signup</a>
            </center>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Save this email—you'll need the link above to make any changes to your registration.
            </p>
          </div>
          <div class="footer">
            <p>SignUpPRO • Powered by v0</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
You're signed up for ${eventTitle}!

Hi ${name},

Great news! You're confirmed for ${eventTitle}.

Event Details:
- Event: ${eventTitle}
- Slot: ${slotName}
- Date & Time: ${eventDate}${eventLocation ? `\n- Location: ${eventLocation}` : ""}

Manage your signup: ${manageUrl}

Need to make changes? Use the link above to edit or cancel your signup.

---
SignUpPRO • Powered by v0
  `

  return { subject, html, text }
}

export function getWaitlistEmail(data: WaitlistData) {
  console.log("[v0] getWaitlistEmail called with:", data)

  if (!data || !data.name || !data.eventTitle || !data.slotName || data.position === undefined || !data.manageUrl) {
    console.error("[v0] Missing required data in getWaitlistEmail:", data)
    throw new Error("Missing required data for waitlist email")
  }

  const { name, eventTitle, slotName, position, manageUrl } = data

  const subject = `You're on the waitlist for ${eventTitle}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: #fff; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #fff; padding: 30px 20px; border: 1px solid #e5e7eb; border-top: none; }
          .details { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fbbf24; }
          .position { font-size: 48px; font-weight: bold; color: #f59e0b; text-align: center; margin: 20px 0; }
          .button { display: inline-block; background: #f59e0b; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">You're on the Waitlist</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>The selected slot for <strong>${eventTitle}</strong> is currently full, but you've been added to the waitlist.</p>
            
            <div class="details">
              <p style="margin: 0 0 10px; text-align: center; color: #92400e;">Your position:</p>
              <div class="position">#${position}</div>
              <p style="margin: 10px 0 0; text-align: center; font-size: 14px; color: #92400e;">
                We'll notify you if a spot opens up!
              </p>
            </div>

            <p><strong>Waitlist Details:</strong></p>
            <ul>
              <li>Event: ${eventTitle}</li>
              <li>Slot: ${slotName}</li>
              <li>Position: #${position}</li>
            </ul>

            <p>You can manage your waitlist entry using the link below:</p>
            <center>
              <a href="${manageUrl}" class="button">Manage Waitlist Entry</a>
            </center>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              We'll email you automatically if a spot becomes available.
            </p>
          </div>
          <div class="footer">
            <p>SignUpPRO • Powered by v0</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
You're on the waitlist for ${eventTitle}

Hi ${name},

The selected slot for ${eventTitle} is currently full, but you've been added to the waitlist.

Your Position: #${position}

Waitlist Details:
- Event: ${eventTitle}
- Slot: ${slotName}
- Position: #${position}

Manage your waitlist entry: ${manageUrl}

We'll notify you if a spot opens up!

---
SignUpPRO • Powered by v0
  `

  return { subject, html, text }
}
