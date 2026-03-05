'use client';

import { useState } from 'react';
import { AnalysisResult } from '@/types';

type AnalysisState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: AnalysisResult }
  | { status: 'error'; message: string };

interface AnalyzeInput {
  cv: string;
  jobDescription: string;
  jobTitle: string;
  company: string;
}

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>({ status: 'idle' });

  async function analyze(input: AnalyzeInput): Promise<AnalysisResult | null> {
    setState({ status: 'loading' });
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!res.ok) throw new Error();

      const data: AnalysisResult = await res.json();
      setState({ status: 'success', data });
      return data;
    } catch {
      setState({
        status: 'error',
        message: 'Analysis failed. Make sure your GROQ_API_KEY is set in .env.local',
      });
      return null;
    }
  }

  function reset() {
    setState({ status: 'idle' });
  }

  return { state, analyze, reset };
}
