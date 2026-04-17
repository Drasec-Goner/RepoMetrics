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
    categorized_recommendations?: Record<
      string,
      Array<{ text: string; status: "implemented" | "recommended" }>
    >;
    tech:
      | Record<string, number>
      | {
          detected_stack?: string[];
          confidence?: number;
        };
  };
  insights?: {
    what_is_hurting_your_score?: Array<{
      category: string;
      label: string;
      detail: string;
      score: number;
      severity: "low" | "medium" | "high";
      impact: number;
    }>;
    code_quality_breakdown?: Array<{
      category: string;
      label: string;
      score: number;
      detail: string;
    }>;
    historical_analysis?: {
      trend: "improving" | "stable" | "declining";
      summary: string;
      timeline: Array<{
        period: string;
        commit_count: number;
        activity_score: number;
        projected_score: number;
        grade: string;
      }>;
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