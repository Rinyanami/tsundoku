import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(request: Request) {
  try {
    const { shelf, preference } = await request.json()

    if (!shelf || shelf.length === 0) {
      return NextResponse.json(
        { error: 'Add some books to your shelf first!' },
        { status: 400 }
      )
    }

    // Build a concise shelf summary
    const shelfSummary = shelf.slice(0, 20).map((entry: {
      book: { title: string; authors: string[] };
      status: string;
      rating: number | null;
    }) => {
      const rating = entry.rating ? ` (${entry.rating}/10)` : ''
      return `- "${entry.book.title}" by ${entry.book.authors?.[0] || 'Unknown'} [${entry.status}]${rating}`
    }).join('\n')

    const userMsg = preference
      ? `My shelf:\n${shelfSummary}\n\nExtra preference: ${preference}`
      : `My shelf:\n${shelfSummary}`

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: `You are a literary taste expert and book recommender. Based on the user's reading shelf (titles, statuses, and ratings), recommend 3 books they haven't read yet.

Format your response EXACTLY as JSON:
{
  "recommendations": [
    {
      "title": "Book Title",
      "author": "Author Name",
      "reason": "One sentence why it fits their taste"
    }
  ],
  "insight": "One sentence observation about their reading taste"
}

Only return valid JSON. No markdown, no extra text.`,
      messages: [{ role: 'user', content: userMsg }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const data = JSON.parse(text)

    return NextResponse.json(data)
  } catch (err) {
    console.error('AI recommend error:', err)
    return NextResponse.json(
      { error: 'Could not generate recommendations. Try again.' },
      { status: 500 }
    )
  }
}
