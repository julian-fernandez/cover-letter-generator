'use client';

import { useRef, useState } from 'react';
import { ScoreCard } from '@/components/ScoreCard';
import { SuggestionsPanel } from '@/components/SuggestionsPanel';
import { CoverLetterPanel } from '@/components/CoverLetterPanel';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useCvUpload } from '@/hooks/useCvUpload';
import { SAMPLE_JD, SAMPLE_CV } from '@/lib/constants';

// ── Small local components ─────────────────────────────────────────────────

function Spinner({ size = 14 }: { size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        border: `${size <= 12 ? 1.5 : 2}px solid var(--border-2)`,
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'spin 0.7s linear infinite',
        flexShrink: 0,
      }}
      aria-hidden
    />
  );
}

function Wordmark() {
  return (
    <span className="text-[22px] leading-none select-none" aria-label="ApplyIQ">
      <span className="font-display italic text-[var(--accent)]">Apply</span>
      <span className="font-display font-bold text-[var(--text)]">IQ</span>
    </span>
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

function Field({ label, htmlFor, action, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between min-h-[28px]">
        <label htmlFor={htmlFor} className="text-sm font-medium text-[var(--text-2)]">
          {label}
        </label>
        {action}
      </div>
      {children}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function Home() {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany]   = useState('');
  const [jobDesc, setJobDesc]   = useState('');
  const [cv, setCv]             = useState('');

  const { state: analysis, analyze, reset } = useAnalysis();
  const { upload, uploading, error: uploadError } = useCvUpload();

  const resultsRef  = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAnalyze() {
    if (!jobDesc.trim() || !cv.trim()) return;
    const result = await analyze({ cv, jobDescription: jobDesc, jobTitle, company });
    if (result) {
      requestAnimationFrame(() =>
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      );
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await upload(file);
    if (text) setCv(text);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const isLoading = analysis.status === 'loading';
  const hasResult = analysis.status === 'success';

  return (
    <div className="min-h-screen bg-[var(--bg)]">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-[60px] max-w-[1100px] items-center justify-between px-7">
          <Wordmark />
          <div className="flex gap-2.5">
            <button className="rounded-full border border-[var(--border-2)] px-[18px] py-1.5 text-sm text-[var(--text-2)] transition-colors hover:border-[var(--muted)]">
              Sign in
            </button>
            <button className="rounded-full bg-[var(--accent)] px-5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-2)]">
              Get started
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-7 py-16 pb-20">

        {/* ── Hero ── */}
        <div className="mb-14">
          <h1 className="font-display mb-4 max-w-[600px] text-[clamp(2.2rem,4vw,3.2rem)] font-bold leading-[1.2] text-[var(--text)]">
            Stop guessing.<br />
            <em className="not-italic text-[var(--accent)]">Know</em> how well you fit.
          </h1>
          <p className="max-w-[520px] text-[17px] leading-[1.7] text-[var(--text-2)]">
            Paste a job description and your CV — get a match score, honest tailoring
            suggestions, and a cover letter that reads like a human wrote it.
          </p>
        </div>

        {/* ── Form ── */}
        <div className="mb-7 grid grid-cols-2 gap-6 max-md:grid-cols-1">

          {/* Left column */}
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3.5">
              <Field label="Job title" htmlFor="job-title">
                <input
                  id="job-title"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  placeholder="Senior Frontend Engineer"
                  className="field-input"
                />
              </Field>
              <Field label="Company" htmlFor="company">
                <input
                  id="company"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="Acme Inc."
                  className="field-input"
                />
              </Field>
            </div>

            <Field
              label="Job description"
              htmlFor="job-desc"
              action={
                !jobDesc ? (
                  <button
                    onClick={() => {
                      setJobDesc(SAMPLE_JD);
                      setJobTitle('Senior Frontend Engineer');
                      setCompany('Acme Payments');
                    }}
                    className="text-[13px] text-[var(--accent)] underline underline-offset-2 hover:text-[var(--accent-2)]"
                  >
                    Use sample
                  </button>
                ) : null
              }
            >
              <textarea
                id="job-desc"
                value={jobDesc}
                onChange={e => setJobDesc(e.target.value)}
                placeholder="Paste the full job description here…"
                rows={14}
                className="field-input resize-none"
              />
            </Field>
          </div>

          {/* Right column — CV */}
          <Field
            label="Your CV"
            htmlFor="cv"
            action={
              <div className="flex items-center gap-3">
                {!cv && (
                  <button
                    onClick={() => setCv(SAMPLE_CV)}
                    className="text-[13px] text-[var(--text-2)] underline underline-offset-2 hover:text-[var(--text)]"
                  >
                    Use sample
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="sr-only"
                  aria-label="Upload CV file (PDF, DOCX, or TXT)"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 rounded-full border border-[var(--border-2)] bg-[var(--surface)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--accent)] transition-colors hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? <><Spinner size={11} /> Reading…</> : '↑ Upload PDF / DOCX'}
                </button>
              </div>
            }
          >
            {uploadError && (
              <p className="mb-2 text-[13px] leading-relaxed text-[var(--red)]">{uploadError}</p>
            )}
            <textarea
              id="cv"
              value={cv}
              onChange={e => setCv(e.target.value)}
              placeholder="Paste your CV as plain text, or upload a PDF / DOCX above…"
              rows={20}
              className="field-input resize-none"
            />
            {cv && (
              <p className="mt-1.5 text-xs text-[var(--muted)]">
                Text extracted — review and edit before analysing.
              </p>
            )}
          </Field>
        </div>

        {/* ── Error ── */}
        {analysis.status === 'error' && (
          <div className="mb-5 rounded-xl border border-[rgba(184,50,50,0.2)] bg-[var(--red-bg)] px-[18px] py-3.5 text-sm text-[var(--red)]">
            {analysis.message}
          </div>
        )}

        {/* ── CTA ── */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !jobDesc.trim() || !cv.trim()}
            className="flex items-center gap-2.5 rounded-full bg-[var(--accent)] px-8 py-3.5 text-[15px] font-semibold text-white shadow-[0_2px_12px_rgba(194,98,43,0.25)] transition-colors hover:bg-[var(--accent-2)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {isLoading ? <><Spinner size={15} /> Analysing…</> : 'Analyse match'}
          </button>
          {hasResult && (
            <button
              onClick={reset}
              className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--text-2)]"
            >
              ↺ Start over
            </button>
          )}
        </div>

        {/* ── Results ── */}
        {hasResult && (
          <div ref={resultsRef} className="mt-16">
            <h2 className="font-display mb-6 text-[26px] font-bold text-[var(--text)]">
              Your results
            </h2>
            <div className="mb-5 grid grid-cols-2 gap-5 max-md:grid-cols-1">
              <ScoreCard result={analysis.data} />
              <SuggestionsPanel suggestions={analysis.data.suggestions} />
            </div>
            <CoverLetterPanel
              cv={cv}
              jobDescription={jobDesc}
              jobTitle={jobTitle}
              company={company}
              analysis={analysis.data}
            />
          </div>
        )}
      </main>

      <footer className="border-t border-[var(--border)] py-7 text-center">
        <p className="text-[13px] text-[var(--muted)]">
          ApplyIQ — suggestions are honest. Never invent, always clarify.
        </p>
      </footer>
    </div>
  );
}
