export interface User {
  id: number;
  login: string;
  avatar_url: string;
}

export interface Repo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
}

export interface AnalysisResponse {
  repository: any;
  features: any;
  rule_scores: any;
  ai_analysis: {
    scores: Record<string, number>;
    analysis: {
      summary: string;
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    };
    tech: Record<string, number>;
  };
  final: {
    score: number;
    grade: string;
    breakdown: Record<string, number>;
  };
}