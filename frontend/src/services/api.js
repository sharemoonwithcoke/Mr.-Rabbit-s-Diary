import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 30000,
});

// Inject stored token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mc_token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

// 401 → clear token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("mc_token");
      delete api.defaults.headers.common["Authorization"];
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authRegister = (email, password, name) =>
  api.post("/auth/register", { email, password, name }).then((r) => r.data);

export const authLogin = (email, password) =>
  api.post("/auth/login", { email, password }).then((r) => r.data);

export const authMe = () =>
  api.get("/auth/me").then((r) => r.data);

// ── Diary Entries ─────────────────────────────────────────────────────────────

export const getEntries = (page = 1, limit = 20) =>
  api.get("/entries", { params: { page, limit } }).then((r) => r.data);

export const getEntry = (id) =>
  api.get(`/entries/${id}`).then((r) => r.data);

export const createEntry = (payload) =>
  api.post("/entries", payload).then((r) => r.data);

export const updateEntry = (id, payload) =>
  api.put(`/entries/${id}`, payload).then((r) => r.data);

export const deleteEntry = (id) =>
  api.delete(`/entries/${id}`).then((r) => r.data);

// ── Analysis ──────────────────────────────────────────────────────────────────

export const analyzeText = (text) =>
  api.post("/analyze", { text }).then((r) => r.data);

export const analyzeBatch = (texts) =>
  api.post("/analyze/batch", { texts }).then((r) => r.data);

// ── Companion ─────────────────────────────────────────────────────────────────

export const getCompanionResponse = (text, label) =>
  api.post("/companion", { text, label }).then((r) => r.data);

// ── Chat ──────────────────────────────────────────────────────────────────────

export const sendChatMessage = (messages, context = null) =>
  api.post("/chat", { messages, context }).then((r) => r.data);

export default api;
