import axios from "axios";
import { API_BASE_URL } from "../constants";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export interface AnalysisResult {
  label: string;
  label_id: number;
  confidence: number;
  probabilities: Record<string, number>;
  demo_mode?: boolean;
}

export interface DiaryEntry {
  _id: string;
  title: string;
  content: string;
  preview: string;
  analysis: AnalysisResult | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedEntries {
  entries: DiaryEntry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// ── Entries ───────────────────────────────────────────────────────────────────

export const getEntries = (page = 1, limit = 20): Promise<PaginatedEntries> =>
  api.get("/api/entries", { params: { page, limit } }).then((r) => r.data);

export const createEntry = (payload: {
  content: string;
  title?: string;
  analysis?: AnalysisResult;
}): Promise<DiaryEntry> =>
  api.post("/api/entries", payload).then((r) => r.data);

export const deleteEntry = (id: string): Promise<void> =>
  api.delete(`/api/entries/${id}`).then((r) => r.data);

// ── Analysis ──────────────────────────────────────────────────────────────────

export const analyzeText = (text: string): Promise<AnalysisResult> =>
  api.post("/api/analyze", { text }).then((r) => r.data);

// ── Companion ─────────────────────────────────────────────────────────────────

export interface CompanionResult {
  response: string | null;
  label: string;
  fallback?: boolean;
}

export const getCompanionResponse = (
  text: string,
  label: string,
): Promise<CompanionResult> =>
  api.post("/api/companion", { text, label }).then((r) => r.data);
