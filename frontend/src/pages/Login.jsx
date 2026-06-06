import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [mode, setMode]         = useState("login"); // "login" | "register"
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [error, setError]       = useState("");
  const [busy, setBusy]         = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand" style={{ justifyContent: "center", marginBottom: "1.5rem" }}>
          <span className="brand-word">MindClassify</span>
          <span className="brand-tag">NLP</span>
        </div>

        <p className="login-subtitle">
          {mode === "login"
            ? "welcome back — your diary is waiting"
            : "a quiet place for your thoughts"}
        </p>

        <form onSubmit={submit} className="login-form">
          {mode === "register" && (
            <div className="login-field">
              <label htmlFor="name">name (optional)</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="how should we call you?"
                autoComplete="name"
              />
            </div>
          )}

          <div className="login-field">
            <label htmlFor="email">email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "register" ? "at least 8 characters" : ""}
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn" disabled={busy}>
            {busy ? "…" : mode === "login" ? "open my diary" : "start writing"}
          </button>
        </form>

        <p className="login-toggle">
          {mode === "login" ? "new here?" : "already have an account?"}
          {" "}
          <button
            type="button"
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
          >
            {mode === "login" ? "create account" : "sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
