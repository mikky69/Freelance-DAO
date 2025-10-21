import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import { Conversation } from '@/models/Conversation'
import { subscribeMessages } from '@/lib/events'

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const conversationId = searchParams.get('conversationId')
  const token = searchParams.get('token')

  if (!conversationId || !token) {
    return new Response('conversationId and token required', { status: 400 })
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const userId = decoded?.id
    if (!userId) {
      return new Response('Invalid token payload', { status: 401 })
    }

    await connectDB()

    // Ensure the user has access to this conversation
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return new Response('Conversation not found', { status: 404 })
    }
    const hasAccess = (conversation.client && conversation.client.equals(userId)) ||
                      (conversation.freelancer && conversation.freelancer.equals(userId))
    if (!hasAccess) {
      return new Response('Forbidden', { status: 403 })
    }

    const encoder = new TextEncoder()

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        // Initial handshake event
        controller.enqueue(encoder.encode(`event: ready\ndata: {"status":"ok"}\n\n`))

        const unsubscribe = subscribeMessages(conversationId, (payload) => {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
          } catch {}
        })

        const keepAlive = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(`: ping\n\n`))
          } catch {}
        }, 30000)

        // Close on client disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(keepAlive)
          unsubscribe()
          try { controller.close() } catch {}
        })
      },
      cancel() {
        // No-op
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error: any) {
    if (error?.name === 'JsonWebTokenError') {
      return new Response('Unauthorized', { status: 401 })
    }
    console.error('SSE GET error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}