import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { SYSTEM_PROMPT } from '../../../data/cv-context'

export async function POST(req: Request) {
  console.log('---> Incoming chat request received!')
  const { messages } = await req.json()
  console.log('User Prompt:', messages[messages.length - 1]?.content)

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: SYSTEM_PROMPT,
    messages,
    onError: ({ error }) => {
      console.error('--- OPENAI STREAM ERROR ---')
      console.error(error)
    },
  })

  return result.toDataStreamResponse()
}