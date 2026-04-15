export interface User {
  id: number;
  login: string;
  avatar_url: string;
}

export interface Repo {
  id?: number;
  name: string;
  full_name: string;
  owner: string | { login: string };
}

export interface AnalysisResponse {
  repository: {
    name?: string;
    full_name?: string;
    description?: string;
    language?: string;
    stars?: number;
    forks?: number;
    open_issues?: number;
    languages?: Record<string, number>;
  };
  features: Record<string, unknown>;
  rule_scores: Record<string, number>;
  ai_analysis: {
    scores: Record<string, number>;
    analysis: {
      summary: string;
      verdict?: string;
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    };
    tech:
      | Record<string, number>
      | {
          detected_stack?: string[];
          confidence?: number;
        };
  };
  final: {
    score?: number;
    grade?: string;
    breakdown?: Record<string, number>;
    overall_score?: number;
    category_scores?: Record<string, number>;
    category_details?: Record<string, { rule: number; ai: number; final: number }>;
    risk?: {
      score: number;
      level: "Low" | "Moderate" | "High" | "Critical";
      meaning: string;
      reasons: string[];
    };
  };
}