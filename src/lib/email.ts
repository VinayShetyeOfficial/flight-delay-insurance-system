import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const data = await resend.emails.send({
      from: "Flight Delay Insurance <noreply@yourdomain.com>",
      to,
      subject,
      html,
    })

    console.log("Email sent successfully:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

