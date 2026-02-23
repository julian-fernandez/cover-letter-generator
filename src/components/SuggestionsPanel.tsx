'use client';

import { useState } from 'react';
import { Suggestion, SuggestionType } from '@/types';

const TYPE_CONFIG: Record<SuggestionType, { label: string; color: string; bg: string }> = {
  wording:       { label: 'Wording',   color: '#7C5CBF', bg: 'rgba(124,92,191,0.09)' },
  missing_skill: { label: 'Add skill', color: '#1A7A9A', bg: 'rgba(26,122,154,0.08)' },
  emphasis:      { label: 'Emphasise', color: 'var(--yellow)', bg: 'var(--yellow-bg)' },
  reorder:       { label: 'Reorder',   color: 'var(--green)',  bg: 'var(--green-bg)'  },
};

function SuggestionItem({ s, defaultOpen }: { s: Suggestion; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const cfg = TYPE_CONFIG[s.type];

  return (
    <li className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 px-4 py-3.5 text-left hover:bg-[var(--surface-2)] transition-colors"
      >
        <span
          className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
          style={{ color: cfg.color, background: cfg.bg }}
        >
          {cfg.label}
        </span>
        <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-[var(--text-2)]">
          {s.section}
        </span>
        <span
          className="text-base text-[var(--muted)] transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
          aria-hidden
        >
          ⌄
        </span>
      </button>

      {open && (
        <div className="flex flex-col gap-3 border-t border-[var(--border)] px-4 pb-4 pt-0">
          {s.current && (
            <div className="mt-3.5">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--muted)]">
                Current
              </p>
              <p className="text-sm italic leading-relaxed text-[var(--text-2)]">
                &ldquo;{s.current}&rdquo;
              </p>
            </div>
          )}
          <div className={s.current ? '' : 'mt-3.5'}>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--muted)]">
              Suggested
            </p>
            <p className="text-sm leading-relaxed text-[var(--text)]">{s.suggested}</p>
          </div>
          <div className="rounded-lg border-l-[3px] border-[var(--accent)] bg-[var(--accent-bg)] px-3.5 py-2.5">
            <p className="text-[13px] leading-relaxed text-[var(--accent-2)]">{s.reason}</p>
          </div>
        </div>
      )}
    </li>
  );
}

export function SuggestionsPanel({ suggestions }: { suggestions: Suggestion[] }) {
  if (!suggestions.length) return null;

  return (
    <div className="flex flex-col gap-[18px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7">
      <div className="flex items-baseline justify-between">
        <p className="font-display text-[20px] font-bold text-[var(--text)]">
          Tailoring suggestions
        </p>
        <span className="text-[13px] text-[var(--muted)]">{suggestions.length} items</span>
      </div>

      <ul className="flex flex-col gap-2">
        {suggestions.map((s, i) => (
          <SuggestionItem key={`${s.type}-${s.section}-${i}`} s={s} defaultOpen={i === 0} />
        ))}
      </ul>

      <p className="text-[13px] leading-relaxed text-[var(--muted)]">
        Only apply suggestions that accurately reflect your experience.
      </p>
    </div>
  );
}
