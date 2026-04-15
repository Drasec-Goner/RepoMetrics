import { apiClient } from "./client";
import type { Repo, AnalysisResponse } from "../types";

export const fetchUserRepos = async (): Promise<Repo[]> => {
  const res = await apiClient.get("/user/repos");

  // Supports both response shapes:
  // 1) Array (preferred): [{...}, {...}]
  // 2) Wrapped legacy shape: { repos: [{...}] }
  if (Array.isArray(res.data)) {
    return res.data;
  }

  if (Array.isArray(res.data?.repos)) {
    return res.data.repos;
  }

  return [];
};

export const analyzeRepo = async (
  owner: string,
  repo: string
): Promise<AnalysisResponse> => {
  const res = await apiClient.get(`/analyze/${owner}/${repo}`);
  return res.data;
};