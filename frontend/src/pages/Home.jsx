import { useState, useRef, useEffect, useMemo } from "react";
import ResultCard from "../components/ResultCard";
import { analyzeText, createEntry, updateEntry, getCompanionResponse, sendChatMessage } from "../services/api";
import { useConversation } from "../context/ConversationContext";

const CLASS_CONFIG = {
  Normal:              { ink: "var(--color-normal-ink)",     bg: "var(--color-normal-bg)",     line: "var(--color-normal-line)",    icon: "😊" },
  Depression:          { ink: "var(--color-depression-ink)", bg: "var(--color-depression-bg)", line: "var(--color-depression-line)", icon: "💙" },
  Suicidal:            { ink: "var(--color-suicidal-ink)",   bg: "var(--color-suicidal-bg)",   line: "var(--color-suicidal-line)",   icon: "🆘" },
  Anxiety:             { ink: "var(--color-anxiety-ink)",    bg: "var(--color-anxiety-bg)",    line: "var(--color-anxiety-line)",    icon: "😰" },
  Stress:              { ink: "var(--color-stress-ink)",     bg: "var(--color-stress-bg)",     line: "var(--color-stress-line)",     icon: "😤" },
  Bipolar:             { ink: "var(--color-bipolar-ink)",    bg: "var(--color-bipolar-bg)",    line: "var(--color-bipolar-line)",    icon: "🔄" },
  "Personality Disorder": { ink: "var(--color-personality-ink)", bg: "var(--color-personality-bg)", line: "var(--color-personality-line)", icon: "🌀" },
};

function InkText({ text, stagger = 55, baseDelay = 0 }) {
  const words = useMemo(() => text.split(/(\s+)/), [text]);
  const refs = useRef({});

  useEffect(() => {
    const timers = [];
    words.forEach((w, i) => {
      if (/\s+/.test(w)) return;
      const id = setTimeout(() => {
        const el = refs.current[i];
        if (el) el.classList.add("shown");
      }, baseDelay + i * stagger);
      timers.push(id);
    });
    return () => timers.forEach(clearTimeout);
  }, [text]);

  return (
    <span>
      {words.map((w, i) =>
        /\s+/.test(w) ? (
          <span key={i}>{w}</span>
        ) : (
          <span key={i} ref={(el) => { refs.current[i] = el; }} className="ink-word">
            {w}
          </span>
        )
      )}
    </span>
  );
}

function FollowupComposer({ onSubmit, onCancel }) {
  const [text, setText] = useState("");
  const ref = useRef(null);

  useEffect(() => { if (ref.current) ref.current.focus(); }, []);

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSubmit(t);
  };

  const onKey = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); submit(); }
    if (e.key === "Escape") onCancel();
  };

  return (
    <div className="diary-followup-form">
      <textarea
        ref={ref}
        className="diary-followup-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKey}
        placeholder="say more…"
        rows={2}
      />
      <div className="diary-followup-actions">
        <span><kbd>⌘</kbd> + <kbd>Enter</kbd></span>
        <button className="diary-followup-cancel" onClick={onCancel}>cancel</button>
        <button className="diary-submit" onClick={submit} disabled={!text.trim()}>send</button>
      </div>
    </div>
  );
}

export default function Home() {
  const { convo, setConvo, endConversation } = useConversation();
  const { entry, phase, followups } = convo;

  const [title, setTitle]               = useState("");
  const [content, setContent]           = useState("");
  const [showFollowupForm, setShowFollowupForm] = useState(false);
  const [error, setError]               = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current && !entry) textareaRef.current.focus();
  }, [entry]);

  const autoGrow = (e) => {
    setContent(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.max(110, e.target.scrollHeight) + "px";
  };

  const handleSubmit = async () => {
    if (!content.trim() || phase === "analyzing") return;
    setConvo((prev) => ({ ...prev, phase: "analyzing" }));
    setError(null);
    setShowFollowupForm(false);
    setShowAnalysis(false);

    try {
      const analysis = await analyzeText(content);
      const saved    = await createEntry({ content, title, analysis });
      const entryId  = saved._id;

      const submittedContent = content.trim();
      const submittedTitle   = title.trim();
      setTitle("");
      setContent("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.focus();
      }

      setConvo((prev) => ({
        ...prev,
        entry: {
          _id: entryId,
          title: submittedTitle,
          content: submittedContent,
          analysis,
          reply: null,
          createdAt: new Date().toISOString(),
        },
        phase:    "thinking",
        followups: [],
      }));

      getCompanionResponse(submittedContent, analysis.label)
        .then((data) => {
          if (data?.response) {
            setConvo((prev) => ({
              ...prev,
              entry: prev.entry ? { ...prev.entry, reply: data.response } : prev.entry,
            }));
            updateEntry(entryId, { reply: data.response }).catch(() => {});
          }
        })
        .catch(() => {})
        .finally(() => setConvo((prev) => ({ ...prev, phase: "settled" })));

    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        "Something went wrong. Is the backend running?"
      );
      setConvo((prev) => ({ ...prev, phase: "idle" }));
    }
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFollowup = async (text) => {
    const newFollowups = [...followups, { user: text, reply: null }];
    setConvo((prev) => ({ ...prev, followups: newFollowups }));
    setShowFollowupForm(false);

    try {
      const messages = [];
      for (const fu of followups) {
        messages.push({ role: "user", content: fu.user });
        if (fu.reply) messages.push({ role: "assistant", content: fu.reply });
      }
      messages.push({ role: "user", content: text });

      const context = entry
        ? { entry: entry.content, label: entry.analysis.label }
        : null;
      const data = await sendChatMessage(messages, context);

      if (data?.reply) {
        setConvo((prev) => {
          const updated = prev.followups.map((fu, i) =>
            i === prev.followups.length - 1 ? { ...fu, reply: data.reply } : fu
          );
          if (prev.entry?._id) {
            updateEntry(prev.entry._id, { followups: updated }).catch(() => {});
          }
          return { ...prev, followups: updated };
        });
      }
    } catch {
      setConvo((prev) => ({ ...prev, followups: prev.followups.slice(0, -1) }));
    }
  };

  const handleEnd = () => {
    setShowFollowupForm(false);
    setShowAnalysis(false);
    endConversation();
  };

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long",
  });

  const cfg = entry?.analysis?.label
    ? (CLASS_CONFIG[entry.analysis.label] || CLASS_CONFIG.Normal)
    : null;

  const ribbonColor = (phase === "analyzing" || !cfg)
    ? "var(--color-line)"
    : cfg.ink;

  return (
    <div className="diary-spread">
      <div className="diary-date">{today}</div>

      {/* ── Composer ── */}
      <div className="diary-composer">
        <input
          className="diary-title-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A title, if you like"
          maxLength={200}
        />
        <textarea
          ref={textareaRef}
          className="diary-composer-input"
          value={content}
          onChange={autoGrow}
          onKeyDown={handleKeyDown}
          placeholder="Today I felt…"
          rows={4}
        />
        <div className="diary-composer-foot">
          <span>press <kbd>⌘</kbd> + <kbd>Enter</kbd> to commit to the page</span>
          <button
            className="diary-submit"
            onClick={handleSubmit}
            disabled={!content.trim() || phase === "analyzing"}
          >
            {phase === "analyzing" ? (
              <><span className="spinner" /> analysing…</>
            ) : "commit"}
          </button>
        </div>
      </div>

      {error && (
        <div className="toast error" style={{ marginTop: 20 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ── Active entry ── */}
      {entry && (
        <>
          <div className="diary-fleuron thin">·  ·  ·</div>

          <article className="diary-entry">
            <span className="diary-ribbon" style={{ background: ribbonColor }} />

            <div className={phase === "analyzing" ? "diary-bloom diary-bleed" : "diary-bloom"}>
              {entry.title && <h2 className="diary-title-mine">{entry.title}</h2>}
              <div className="diary-mine">{entry.content}</div>
            </div>

            {phase !== "analyzing" && cfg && (
              <div className="diary-felt" style={{ color: cfg.ink }}>
                felt as <em>{entry.analysis.label.toLowerCase()}</em>
                {entry.analysis.confidence != null && (
                  <span style={{ opacity: 0.6 }}>
                    {" "}· {(entry.analysis.confidence * 100).toFixed(0)}%
                  </span>
                )}
                <button
                  onClick={() => setShowAnalysis((v) => !v)}
                  style={{
                    marginLeft: 10, fontSize: 11,
                    color: "var(--color-ink-4)",
                    background: "none", border: "none", cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {showAnalysis ? "hide ↑" : "see analysis ↓"}
                </button>
              </div>
            )}

            {showAnalysis && entry.analysis && (
              <div style={{ marginTop: 14 }}>
                <ResultCard result={entry.analysis} />
              </div>
            )}

            {phase === "thinking" && (
              <div className="diary-pause">
                Mr. Rabbit is writing
                <span className="diary-pause-dots">
                  <span /><span /><span />
                </span>
              </div>
            )}

            {entry.reply && (
              <div className="diary-reply">
                <span className="diary-reply-mark">Mr. Rabbit replies</span>
                <InkText text={entry.reply} stagger={55} />
                <div className="diary-reply-sign">— always here for you, {today}</div>

                {entry.analysis.label === "Suicidal" && (
                  <div className="diary-safety">
                    If the weight ever becomes too heavy to carry alone, please reach out:
                    call or text <strong>988</strong> (Suicide &amp; Crisis Lifeline).
                  </div>
                )}

                {followups.length > 0 && (
                  <div className="diary-followups">
                    {followups.map((fu, i) => (
                      <div key={i} className="diary-followup">
                        <div className="diary-followup-user">{fu.user}</div>
                        {fu.reply ? (
                          <div className="diary-followup-reply">
                            <InkText text={fu.reply} stagger={50} />
                          </div>
                        ) : (
                          <div className="diary-pause" style={{ marginTop: 8 }}>
                            <span className="diary-pause-dots">
                              <span /><span /><span />
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {showFollowupForm ? (
                  <FollowupComposer
                    onSubmit={handleFollowup}
                    onCancel={() => setShowFollowupForm(false)}
                  />
                ) : (
                  <div className="diary-reply-actions">
                    <button
                      className="diary-followup-btn"
                      onClick={() => setShowFollowupForm(true)}
                    >
                      follow up
                    </button>
                    <button className="diary-end-btn" onClick={handleEnd}>
                      close this page
                    </button>
                  </div>
                )}
              </div>
            )}
          </article>
        </>
      )}

      {!entry && phase === "idle" && !error && (
        <div className="diary-empty-hint">
          your page is empty — write the first line above.
        </div>
      )}
    </div>
  );
}
