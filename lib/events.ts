import { EventEmitter } from 'events'

// Create a global singleton EventEmitter so route handlers and modules
// share the same instance in the dev server process.
// Using a symbol to avoid collisions.
const EMITTER_KEY = Symbol.for('__freelancedao_message_emitter__')

// @ts-ignore
const globalSymbols = Object.getOwnPropertySymbols(globalThis)
// @ts-ignore
const hasEmitter = globalSymbols.includes(EMITTER_KEY)
// @ts-ignore
const emitter: EventEmitter = hasEmitter ? (globalThis as any)[EMITTER_KEY] : new EventEmitter()
// @ts-ignore
;(globalThis as any)[EMITTER_KEY] = emitter

emitter.setMaxListeners(1000)

export type MessagePayload = {
  id: string
  sender: string
  content: string
  timestamp: string
  isOwn: boolean
  type: 'text' | 'image' | 'file'
  fileName?: string
  fileSize?: string
}

export function emitMessage(conversationId: string, payload: MessagePayload) {
  emitter.emit(`message:new:${conversationId}`, payload)
}

export function subscribeMessages(
  conversationId: string,
  listener: (payload: MessagePayload) => void
) {
  const event = `message:new:${conversationId}`
  emitter.on(event, listener)
  return () => emitter.off(event, listener)
}