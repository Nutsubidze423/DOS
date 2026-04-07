import { Resend } from 'resend'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey || apiKey.startsWith('re_placeholder')) {
      return Response.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const { name, email, subject, message } = (await request.json()) as {
      name: string
      email: string
      subject: string
      message: string
    }

    if (!name || !email || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const resend = new Resend(apiKey)

    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

    const { error } = await resend.emails.send({
      from: 'PortfolioOS Contact <onboarding@resend.dev>',
      to: ['demetrenutsubidze423@gmail.com'],
      replyTo: `${name} <${email}>`,
      subject: subject ? `[PortfolioOS] ${subject}` : `[PortfolioOS] Message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `
        <div style="font-family:monospace;max-width:600px;margin:0 auto;padding:20px;background:#f5f5f5;border:1px solid #ccc">
          <h2 style="color:#000080;margin-top:0">New message via PortfolioOS</h2>
          <p><strong>From:</strong> ${esc(name)}</p>
          <p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>
          ${subject ? `<p><strong>Subject:</strong> ${esc(subject)}</p>` : ''}
          <hr style="border-color:#ccc"/>
          <p style="white-space:pre-wrap">${esc(message)}</p>
        </div>
      `,
    })

    if (error) {
      console.error('[contact/route] Resend error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal server error'
    console.error('[contact/route] Error:', msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}
