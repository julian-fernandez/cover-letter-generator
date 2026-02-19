import { NextRequest, NextResponse } from 'next/server';
import { groq } from '@/lib/groq';
import { AnalysisResult } from '@/types';

const SYSTEM_PROMPT = `You are an expert ATS specialist and career coach. Analyze the match between a CV and job description. Be specific and actionable.

Return a JSON object with EXACTLY this structure:
{
  "score": <integer 0-100>,
  "matchedKeywords": <string[] — skills/tools present in both CV and JD>,
  "missingKeywords": <string[] — important JD keywords absent from CV>,
  "strengths": <string[] — 2–4 areas where the candidate is a strong match>,
  "gaps": <string[] — 2–4 specific gaps or concerns>,
  "suggestions": [
    {
      "type": "wording" | "missing_skill" | "emphasis" | "reorder",
      "section": "<CV section this applies to>",
      "current": "<current text from CV, or null>",
      "suggested": "<specific suggested change>",
      "reason": "<why this helps, referencing the JD>"
    }
  ]
}

Rules:
1. Never suggest fabricating experience or skills the candidate does not have
2. Do suggest skills strongly implied by their experience but left unstated
3. Do suggest mirroring the JD's exact wording where the candidate has the skill
4. Flag honest wording upgrades: "built" → "architected", "helped" → "led"
5. Return at most 5 suggestions`;

export async function POST(req: NextRequest) {
  const { cv, jobDescription, jobTitle, company } = await req.json();

  if (!cv?.trim() || !jobDescription?.trim()) {
    return NextResponse.json(
      { error: 'CV and job description are required' },
      { status: 400 }
    );
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Job Title: ${jobTitle || 'Not specified'}
Company: ${company || 'Not specified'}

JOB DESCRIPTION:
${jobDescription}

CANDIDATE CV:
${cv}`,
        },
      ],
    });

    const raw = completion.choices[0].message.content;
    if (!raw) throw new Error('Empty response from model');

    const result: AnalysisResult = JSON.parse(raw);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[analyze]', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
