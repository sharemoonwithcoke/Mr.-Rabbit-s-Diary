import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../services/api";

function InlineChat({ entryText, label }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      const context = entryText ? { entry: entryText, label } : null;
      const data = await sendChatMessage(
        history.map((m) => ({ role: m.role, content: m.content })),
        context,
      );
      if (data.fallback) {
        setUnavailable(true);
        setMessages((prev) => prev.slice(0, -1));
        return;
      }
      setMessages([...history, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (unavailable) {
    return (
      <p className="text-xs text-diary-accent/60 italic mt-2" style={{ fontFamily: "Lora, serif" }}>
        Chat unavailable — add <code className="bg-paper-deep px-1 rounded not-italic font-mono text-honey-ink">ANTHROPIC_API_KEY</code> to backend/.env
      </p>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-diary-line/60 space-y-3">
      {messages.length > 0 && (
        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <p
                className={`text-sm px-3.5 py-2 rounded-ds-md max-w-[85%] leading-relaxed ${
                  m.role === "user"
                    ? "bg-honey-soft text-honey-ink rounded-br-[4px]"
                    : "text-ink-2 italic rounded-bl-[4px]"
                }`}
                style={m.role === "assistant" ? { fontFamily: "Lora, serif" } : {}}
              >
                {m.role === "assistant" && <span className="mr-1 not-italic">🪶</span>}
                {m.content}
              </p>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <p className="text-sm px-3.5 py-2 italic text-diary-accent/70" style={{ fontFamily: "Lora, serif" }}>
                🪶{" "}
                <span className="inline-flex gap-1">
                  <span className="animate-bounce [animation-delay:0ms]">·</span>
                  <span className="animate-bounce [animation-delay:150ms]">·</span>
                  <span className="animate-bounce [animation-delay:300ms]">·</span>
                </span>
              </p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      <div className="flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write back to your diary…"
          rows={2}
          disabled={loading}
          className="flex-1 resize-none rounded-ds-sm border border-diary-line bg-diary-bg/60 px-3 py-2 text-sm text-ink-2 placeholder-ink-4 focus:outline-none focus:ring-1 focus:ring-honey/30 disabled:opacity-50 leading-relaxed italic"
          style={{ fontFamily: "Lora, serif" }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="shrink-0 bg-honey-ink hover:bg-honey-hover disabled:opacity-30 text-paper rounded-ds-sm px-3 py-2 text-xs font-semibold transition-colors h-[52px]"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default function CompanionCard({ response, loading, entryText, label }) {
  const [chatOpen, setChatOpen] = useState(false);

  if (loading) {
    return (
      <div className="rounded-ds-lg border border-diary-line bg-diary-bg/60 px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="text-xl animate-pulse">🪶</span>
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-diary-line/70 rounded-full animate-pulse w-3/4" />
            <div className="h-3 bg-diary-line/70 rounded-full animate-pulse w-5/6" />
            <div className="h-3 bg-diary-line/70 rounded-full animate-pulse w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!response) return null;

  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long" });

  return (
    <div
      className="rounded-ds-lg border border-diary-line shadow-warm-sm px-6 py-5 space-y-3"
      style={{ background: "linear-gradient(135deg, #fdfaf4 0%, #fdf6e3 100%)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-lg">🪶</span>
        <p className="text-xs font-bold tracking-widest text-diary-accent uppercase">
          Your Diary Replies
        </p>
      </div>

      <div className="border-t border-diary-line/60" />

      {/* Diary voice — Lora italic */}
      <p className="text-sm leading-relaxed text-ink-2 italic" style={{ fontFamily: "Lora, serif" }}>
        {response}
      </p>

      {/* Footer row */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setChatOpen((o) => !o)}
          className="text-xs text-diary-accent/70 hover:text-diary-accent transition-colors flex items-center gap-1"
        >
          <span>{chatOpen ? "↑" : "↩"}</span>
          {chatOpen ? "Close" : "Write back"}
        </button>
        {/* Caveat handwritten date */}
        <p className="text-sm text-diary-accent/60" style={{ fontFamily: "Caveat, cursive", fontSize: "15px" }}>
          — written for you, {today}
        </p>
      </div>

      {chatOpen && <InlineChat entryText={entryText} label={label} />}
    </div>
  );
}
