'use client';

import { AnalysisResult } from '@/types';

const SIZE = 120;
const STROKE = 8;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

function scoreTheme(score: number) {
  if (score >= 75) return { color: 'var(--green)', label: 'Strong match',  sub: 'Your profile aligns well with this role.' };
  if (score >= 50) return { color: 'var(--yellow)', label: 'Partial match', sub: 'Solid base — a few gaps to address.' };
  return               { color: 'var(--red)',    label: 'Weak match',   sub: 'Significant gaps. Review suggestions below.' };
}

function ScoreRing({ score }: { score: number }) {
  const { color, label, sub } = scoreTheme(score);
  const offset = CIRC - (score / 100) * CIRC;

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none" stroke="var(--border)" strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none" stroke={color} strokeWidth={STROKE}
            strokeDasharray={CIRC} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-[30px] font-bold leading-none" style={{ color }}>
            {score}
          </span>
          <span className="mt-0.5 text-[11px] text-[var(--muted)]">/ 100</span>
        </div>
      </div>
      <div>
        <p className="font-display text-[20px] font-bold leading-snug text-[var(--text)]">{label}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-2)]">{sub}</p>
      </div>
    </div>
  );
}

export function ScoreCard({ result }: { result: AnalysisResult }) {
  return (
    <div className="flex flex-col gap-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7">
      <ScoreRing score={result.score} />

      <div className="flex flex-wrap gap-1.5">
        {result.matchedKeywords.slice(0, 8).map(kw => (
          <span
            key={kw}
            className="rounded-full border border-[rgba(42,125,82,0.2)] bg-[var(--green-bg)] px-3 py-1 text-xs text-[var(--green)]"
          >
            {kw}
          </span>
        ))}
        {result.missingKeywords.slice(0, 5).map(kw => (
          <span
            key={kw}
            className="rounded-full border border-[rgba(184,50,50,0.2)] bg-[var(--red-bg)] px-3 py-1 text-xs text-[var(--red)]"
          >
            {kw}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 border-t border-[var(--border)] pt-6">
        <Section label="Strengths" color="var(--green)" marker="✓" items={result.strengths} />
        <Section label="Gaps"      color="var(--yellow)" marker="!" items={result.gaps} />
      </div>
    </div>
  );
}

function Section({
  label, color, marker, items,
}: {
  label: string; color: string; marker: string; items: string[];
}) {
  return (
    <div>
      <p
        className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em]"
        style={{ color }}
      >
        {label}
      </p>
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-[var(--text-2)]">
            <span className="mt-px shrink-0" style={{ color }}>{marker}</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
