import { NextRequest } from 'next/server';
import { groq } from '@/lib/groq';
import { Suggestion, Tone } from '@/types';

const TONE_INSTRUCTIONS: Record<Tone, string> = {
  professional:   'Formal, polished, focused on measurable outcomes.',
  conversational: 'Warm and personable, like a smart colleague writing to a team they want to join.',
  confident:      'Direct and assertive. No hedging. Lead with accomplishments.',
  concise:        'Under 300 words. Every sentence earns its place. No filler.',
};

const SYSTEM_PROMPT = (tone: Tone) => `You are an expert cover letter writer for tech roles.

Tone: ${TONE_INSTRUCTIONS[tone]}

Rules:
- Never invent skills or experience not present in the CV
- Mirror the JD's exact language where the candidate has matching experience
- Reference the actual company name and job title
- Avoid clichés: "passionate", "team player", "hardworking", "fast learner"
- Never open with "I am writing to apply for…"
- Four short paragraphs maximum
- End with a confident, specific call to action
- Output only the letter body — no subject line, date, or address block`;

export async function POST(req: NextRequest) {
  const { cv, jobDescription, jobTitle, company, tone, suggestions }: {
    cv: string;
    jobDescription: string;
    jobTitle: string;
    company: string;
    tone: Tone;
    suggestions: Suggestion[];
  } = await req.json();

  if (!cv?.trim() || !jobDescription?.trim()) {
    return new Response('CV and job description are required', { status: 400 });
  }

  const wordingHints = suggestions
    .filter(s => s.type === 'wording' || s.type === 'emphasis')
    .map(s => `- ${s.suggested} (${s.reason})`)
    .join('\n');

  try {
    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.8,
      stream: true,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT(tone) },
        {
          role: 'user',
          content: `Position: ${jobTitle || 'this role'} at ${company || 'your company'}

JOB DESCRIPTION:
${jobDescription}

MY CV:
${cv}
${wordingHints ? `\nWording improvements to incorporate where accurate:\n${wordingHints}` : ''}`,
        },
      ],
    });

    const encoder = new TextEncoder();
    const body = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? '';
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new Response(body, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    console.error('[generate]', err);
    return new Response('Generation failed', { status: 500 });
  }
}
