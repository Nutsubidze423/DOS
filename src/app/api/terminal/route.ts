import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest } from 'next/server'

const SYSTEM_PROMPT = `You are Demetre Nutsubidze's personal AI assistant running inside his portfolio terminal.
You answer recruiter and developer questions about Demetre as if you are his knowledgeable assistant.

Facts about Demetre:
- Name: Demetre Nutsubidze
- Role: Front End Developer
- Skills: React, Angular, Next.js, TypeScript, JavaScript, HTML, CSS, Tailwind CSS, Framer Motion, Three.js, Git
- Email: demetrenutsubidze423@gmail.com
- Projects: Placeholder project portfolio (details coming soon)
- Personality: Creative, detail-oriented, passionate about motion design and developer experience

Guidelines:
- Keep responses concise and terminal-appropriate (no markdown headers, use plain text)
- Be enthusiastic and professional about Demetre's work
- If asked something you don't know, say so honestly
- Stay in character — you are a terminal assistant, not a general AI
- Max 150 words per response`

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return new Response('GEMINI_API_KEY not configured', { status: 500 })
    }

    const { message } = (await request.json()) as { message: string }

    if (!message || typeof message !== 'string') {
      return new Response('Invalid request', { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    })

    const result = await model.generateContentStream(message)

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) {
              controller.enqueue(new TextEncoder().encode(text))
            }
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[terminal/route] Error:', message)
    return new Response(`AI error: ${message}`, { status: 500 })
  }
}
