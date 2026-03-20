import { apiClient } from "./client";
import type { Repo, AnalysisResponse } from "../types";

export const fetchUserRepos = async (): Promise<Repo[]> => {
  const res = await apiClient.get("/user/repos");
  return res.data;
};

export const analyzeRepo = async (
  owner: string,
  repo: string
): Promise<AnalysisResponse> => {
  const res = await apiClient.get(`/analyze/${owner}/${repo}`);
  return res.data;
};