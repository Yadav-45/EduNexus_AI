import { apiRequest } from "./client";

export function getCurrentIntelligence() {
  return apiRequest("/ai/intelligence/current");
}

export function getIntelligenceFeatures(limit = 30) {
  return apiRequest(`/ai/intelligence/features?limit=${limit}`);
}

export function getIntelligenceTrends(limit = 30) {
  return apiRequest(`/ai/intelligence/trends?limit=${limit}`);
}

export function getIntelligenceHistory(limit = 30) {
  return apiRequest(`/ai/intelligence/history?limit=${limit}`);
}

export function createIntelligenceSnapshot() {
  return apiRequest("/ai/intelligence/snapshot", {
    method: "POST",
  });
}

export function askCopilot(question) {
  return apiRequest("/ai/copilot", {
    method: "POST",
    body: JSON.stringify({
      question,
    }),
  });
}