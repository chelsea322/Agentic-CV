# Agentic CV

An interactive CV website. Instead of reading a static résumé, visitors can ask questions about me in a chat and get answers from an AI assistant grounded in my CV.

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router) and React 19
- TypeScript
- Tailwind CSS 4
- [Vercel AI SDK](https://sdk.vercel.ai/) with the OpenAI provider

## How it works

- `data/cv-context.ts` holds the CV content the assistant answers from.
- `app/api/chat/route.ts` is the API route that streams the model's replies.
- `app/page.tsx` is the chat interface.

## Running locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and add your OpenAI API key:
   ```bash
   cp .env.example .env.local
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Name | Description |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI API key used by the chat route |
