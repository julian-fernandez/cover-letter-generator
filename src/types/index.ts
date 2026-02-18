export type SuggestionType = 'wording' | 'missing_skill' | 'emphasis' | 'reorder';

export interface Suggestion {
  type: SuggestionType;
  section: string;
  current?: string;
  suggested: string;
  reason: string;
}

export interface AnalysisResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  gaps: string[];
  suggestions: Suggestion[];
}

export interface ApplicationInput {
  jobTitle: string;
  company: string;
  jobDescription: string;
  cv: string;
}

export type Tone = 'professional' | 'conversational' | 'confident' | 'concise';

export interface SavedApplication {
  id: string;
  userId: string;
  jobTitle: string;
  company: string;
  jobDescription: string;
  cv: string;
  analysis: AnalysisResult | null;
  coverLetter: string | null;
  tone: Tone;
  createdAt: string;
}
