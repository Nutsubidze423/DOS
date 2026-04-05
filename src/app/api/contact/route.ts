import { Resend } from 'resend'
import { NextRequest } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { name, subject, message } = (await request.json()) as {
      name: string
      subject: string
      message: string
    }

    if (!name || !subject || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { error } = await resend.emails.send({
      from: 'PortfolioOS <onboarding@resend.dev>',
      to: ['demetrenutsubidze423@gmail.com'],
      subject: `[PortfolioOS] ${subject}`,
      text: `From: ${name}\n\n${message}`,
      html: `<p><strong>From:</strong> ${name}</p><p>${message.replace(/\n/g, '<br/>')}</p>`,
    })

    if (error) {
      console.error('[contact/route] Resend error:', error)
      return Response.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('[contact/route] Unexpected error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
