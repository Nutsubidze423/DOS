import { NextRequest } from 'next/server'

const COLORS = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff6bdb','#ff9f43','#48dbfb','#ff9ff3']

// We lazy-import pusher to avoid build crash when env vars are missing
export async function POST(request: NextRequest) {
  const appId   = process.env.PUSHER_APP_ID
  const key     = process.env.PUSHER_KEY
  const secret  = process.env.PUSHER_SECRET
  const cluster = process.env.PUSHER_CLUSTER

  if (!appId || !key || !secret || !cluster) {
    return new Response('Pusher not configured', { status: 503 })
  }

  const { default: Pusher } = await import('pusher')
  const pusher = new Pusher({ appId, key, secret, cluster, useTLS: true })

  const body = await request.text()
  const params = new URLSearchParams(body)
  const socketId = params.get('socket_id')
  const channel  = params.get('channel_name')

  if (!socketId || !channel) return new Response('Bad request', { status: 400 })

  const userId = Math.random().toString(36).slice(2, 9)
  const color  = COLORS[Math.floor(Math.random() * COLORS.length)]

  const auth = pusher.authorizeChannel(socketId, channel, {
    user_id: userId,
    user_info: { color },
  })

  return Response.json(auth)
}
