import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../services/api";

const WELCOME = {
  role: "assistant",
  content:
    "Hi, I'm your diary companion. You can talk to me about anything on your mind — I'm here to listen without judgement. What would you like to share today?",
};

export default function Chat() {
  const [messages, setMessages]   = useState([WELCOME]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [unavailable, setUnavailable] = useState(false);
  const threadRef  = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const conversationHistory = history
        .slice(1)
        .map((m) => ({ role: m.role, content: m.content }));

      const data = await sendChatMessage(conversationHistory);

      if (data.fallback) {
        setUnavailable(true);
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      setMessages([...history, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err?.response?.data?.error || "Something went wrong. Is the backend running?");
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 600, margin: 0, color: "var(--color-ink)" }}>
            Talk to your diary
          </h1>
          <p style={{ fontSize: 14, color: "var(--color-ink-3)", marginTop: 6 }}>
            A private space to explore your thoughts — Claude listens and replies.
          </p>
        </div>
        <button
          className="btn-ghost"
          onClick={() => { setMessages([WELCOME]); setError(null); setUnavailable(false); }}
        >
          New chat
        </button>
      </div>

      {unavailable && (
        <div className="toast warn" style={{ marginBottom: 16 }}>
          Chat unavailable — add <code style={{ background: "var(--color-paper-deep)", padding: "1px 5px", borderRadius: 4 }}>ANTHROPIC_API_KEY</code> to <code style={{ background: "var(--color-paper-deep)", padding: "1px 5px", borderRadius: 4 }}>backend/.env</code>
        </div>
      )}

      <div className="chat-wrap">
        <div className="chat-thread" ref={threadRef}>
          {messages.map((m, i) => (
            <div className={"chat-row" + (m.role === "user" ? " user" : "")} key={i}>
              {m.role !== "user" && (
                <div className="chat-avatar" aria-hidden="true">🪶</div>
              )}
              <div className={"chat-bubble " + (m.role === "user" ? "user" : "bot")}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-row">
              <div className="chat-avatar" aria-hidden="true">🪶</div>
              <div className="chat-typing"><span /><span /><span /></div>
            </div>
          )}
        </div>

        {error && (
          <div className="toast error" style={{ marginTop: 10 }}>{error}</div>
        )}

        <div className="chat-input">
          <textarea
            ref={textareaRef}
            className="textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
            rows={2}
            disabled={loading || unavailable}
          />
          <button
            className="btn btn-primary chat-send"
            onClick={send}
            disabled={!input.trim() || loading || unavailable}
          >
            Send
          </button>
        </div>

        <div className="chat-footnote">
          Not a substitute for professional mental health support.
          In crisis? Call or text <strong>988</strong>.
        </div>
      </div>
    </>
  );
}
