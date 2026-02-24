'use client';

import { useRef, useState } from 'react';
import { AnalysisResult, Tone } from '@/types';

const TONES: { value: Tone; label: string; desc: string }[] = [
  { value: 'professional',   label: 'Professional',   desc: 'Polished, outcome-focused' },
  { value: 'conversational', label: 'Conversational', desc: 'Warm and personable' },
  { value: 'confident',      label: 'Confident',      desc: 'Direct, no hedging' },
  { value: 'concise',        label: 'Concise',        desc: 'Under 300 words' },
];

interface Props {
  cv: string;
  jobDescription: string;
  jobTitle: string;
  company: string;
  analysis: AnalysisResult;
}

export function CoverLetterPanel({ cv, jobDescription, jobTitle, company, analysis }: Props) {
  const [tone, setTone]       = useState<Tone>('professional');
  const [text, setText]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [copied, setCopied]   = useState(false);
  const abortRef              = useRef<AbortController | null>(null);

  async function generate() {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError('');
    setText('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cv,
          jobDescription,
          jobTitle,
          company,
          tone,
          suggestions: analysis.suggestions,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(await res.text());
      if (!res.body) throw new Error('No response body');

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setText(prev => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError('Generation failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function download() {
    const blob = new Blob([text], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `cover-letter-${company || 'application'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-7 py-[18px]">
        <p className="font-display text-[20px] font-bold text-[var(--text)]">Cover letter</p>
        {text && (
          <div className="flex gap-2.5">
            <button
              onClick={copy}
              className="rounded-full border border-[var(--border-2)] px-4 py-1.5 text-[13px] transition-colors hover:border-[var(--muted)]"
              style={{ color: copied ? 'var(--green)' : 'var(--text-2)' }}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
            <button
              onClick={download}
              className="rounded-full border border-[var(--border-2)] px-4 py-1.5 text-[13px] text-[var(--text-2)] transition-colors hover:border-[var(--muted)]"
            >
              Download
            </button>
          </div>
        )}
      </div>

      {/* Tone picker */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-[var(--border)] px-7 py-4">
        <span className="mr-1 text-sm text-[var(--text-2)]">Tone:</span>
        {TONES.map(t => (
          <button
            key={t.value}
            onClick={() => setTone(t.value)}
            title={t.desc}
            className="rounded-full px-4 py-1.5 text-[13px] transition-all"
            style={{
              border:      t.value === tone ? '1px solid var(--accent)' : '1px solid var(--border-2)',
              background:  t.value === tone ? 'var(--accent-bg)'        : 'transparent',
              color:       t.value === tone ? 'var(--accent)'           : 'var(--text-2)',
              fontWeight:  t.value === tone ? 600                       : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Output */}
      <div className="relative min-h-[300px] p-7">
        {!text && !loading && (
          <div className="flex h-[260px] flex-col items-center justify-center gap-4">
            <p className="text-[15px] text-[var(--muted)]">
              Generate a cover letter tailored to this role
            </p>
            <button
              onClick={generate}
              className="rounded-full bg-[var(--accent)] px-8 py-3.5 text-[15px] font-semibold text-white shadow-[0_2px_12px_rgba(194,98,43,0.25)] transition-colors hover:bg-[var(--accent-2)]"
            >
              Generate cover letter
            </button>
          </div>
        )}

        {loading && !text && (
          <div className="flex items-center gap-2.5 text-sm text-[var(--muted)]">
            <span
              className="inline-block rounded-full"
              style={{
                width: 14, height: 14,
                border: '2px solid var(--border-2)',
                borderTopColor: 'var(--accent)',
                animation: 'spin 0.7s linear infinite',
              }}
              aria-hidden
            />
            Writing…
          </div>
        )}

        {text && (
          <p className="whitespace-pre-wrap text-[15px] leading-[1.8] text-[var(--text)]">
            {text}
            {loading && (
              <span
                className="ml-0.5 text-[var(--accent)]"
                style={{ animation: 'blink 1s step-end infinite' }}
                aria-hidden
              >
                ▌
              </span>
            )}
          </p>
        )}

        {error && <p className="text-sm text-[var(--red)]">{error}</p>}
      </div>

      {text && !loading && (
        <div className="flex justify-end border-t border-[var(--border)] px-7 py-3.5">
          <button
            onClick={generate}
            className="text-[13px] text-[var(--muted)] transition-colors hover:text-[var(--text-2)]"
          >
            ↺ Regenerate
          </button>
        </div>
      )}
    </div>
  );
}
