import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { SYSTEM_PROMPT } from '../../../data/cv-context'

const MAX_MESSAGES = 20
const MAX_MESSAGE_LENGTH = 1000
const MAX_OUTPUT_TOKENS = 500

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const messages = (body as { messages?: unknown })?.messages
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return Response.json({ error: 'Invalid messages.' }, { status: 400 })
  }

  const valid = messages.every(
    (m) =>
      m &&
      (m.role === 'user' || m.role === 'assistant') &&
      typeof m.content === 'string' &&
      m.content.length <= MAX_MESSAGE_LENGTH,
  )
  if (!valid) {
    return Response.json({ error: 'Invalid or too long message.' }, { status: 400 })
  }

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: SYSTEM_PROMPT,
    messages,
    maxTokens: MAX_OUTPUT_TOKENS,
    onError: ({ error }) => {
      console.error('OpenAI stream error:', error)
    },
  })

  return result.toDataStreamResponse()
}
