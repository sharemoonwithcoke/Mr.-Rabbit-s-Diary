import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem("mc_token"));
  const [loading, setLoading] = useState(true);

  const applyToken = useCallback((t) => {
    if (t) {
      localStorage.setItem("mc_token", t);
      api.defaults.headers.common["Authorization"] = `Bearer ${t}`;
    } else {
      localStorage.removeItem("mc_token");
      delete api.defaults.headers.common["Authorization"];
    }
    setToken(t);
  }, []);

  // Validate stored token on mount
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    api.get("/auth/me")
      .then((r) => setUser(r.data.user))
      .catch(() => applyToken(null))
      .finally(() => setLoading(false));
  }, []);

  const register = async (email, password, name) => {
    const r = await api.post("/auth/register", { email, password, name });
    applyToken(r.data.token);
    setUser(r.data.user);
  };

  const login = async (email, password) => {
    const r = await api.post("/auth/login", { email, password });
    applyToken(r.data.token);
    setUser(r.data.user);
  };

  const logout = () => {
    applyToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
