import { useState, useEffect, useCallback, useMemo, Fragment, useRef } from "react";
import MoodCalendar, { ymd, CLASS_CONFIG } from "../components/MoodCalendar";
import MoodMark from "../components/MoodMark";
import { getEntries, deleteEntry } from "../services/api";

// ── Diary content inside the opened envelope ──────────────────────────────────
function ReadOnlyEntry({ entry, onDelete, hideTitle = false }) {
  const [expanded, setExpanded] = useState(false);
  const logRef = useRef(null);

  const cfg = entry.analysis?.label
    ? (CLASS_CONFIG[entry.analysis.label] || null)
    : null;

  const hasConvo = entry.reply || entry.followups?.length > 0;

  useEffect(() => {
    if (expanded && logRef.current) {
      logRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [expanded]);

  return (
    <article className="diary-entry">
      <span
        className="diary-ribbon"
        style={{ background: cfg?.ink || "var(--color-line)" }}
        title={entry.analysis?.label}
      />

      <div className="diary-bloom">
        {!hideTitle && entry.title && <h2 className="diary-title-mine">{entry.title}</h2>}
        <div className="diary-mine">{entry.content}</div>
      </div>

      {cfg && (
        <div className="diary-felt" style={{ color: cfg.ink }}>
          felt as <em>{entry.analysis.label.toLowerCase()}</em>
          {entry.analysis.confidence != null && (
            <span style={{ opacity: 0.6 }}>
              {" "}· {(entry.analysis.confidence * 100).toFixed(0)}%
            </span>
          )}
        </div>
      )}

      {entry.analysis?.label === "Suicidal" && (
        <div className="diary-safety" style={{ marginTop: 16 }}>
          If the weight ever becomes too heavy to carry alone, please reach out:
          call or text <strong>988</strong> (Suicide &amp; Crisis Lifeline).
        </div>
      )}

      {hasConvo && (
        <div style={{ marginTop: 16 }}>
          <button
            className="diary-chat-log-toggle"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "hide Mr. Rabbit's words ↑" : "Mr. Rabbit replied ↓"}
          </button>

          {expanded && (
            <div className="diary-chat-log" ref={logRef}>
              {entry.reply && (
                <div className="diary-reply" style={{ marginTop: 0 }}>
                  <span className="diary-reply-mark">Mr. Rabbit wrote</span>
                  <p style={{ margin: 0, lineHeight: 1.7 }}>{entry.reply}</p>
                  <div className="diary-reply-sign">— always here for you</div>
                </div>
              )}

              {entry.followups?.length > 0 && (
                <div className="diary-followups" style={{ marginTop: 16 }}>
                  {entry.followups.map((fu, i) => (
                    <div key={i} className="diary-followup">
                      <div className="diary-followup-user">{fu.user}</div>
                      {fu.reply && (
                        <div className="diary-followup-reply">{fu.reply}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {onDelete && (
        <div style={{ marginTop: 14, textAlign: "right" }}>
          <button className="entry-delete" onClick={() => onDelete(entry._id)}>
            Delete this entry
          </button>
        </div>
      )}
    </article>
  );
}

// ── Opened envelope: slide-in panel with header bar + letter ─────────────────
function EnvelopeOpen({ entry, cfg, dateLong, onClose, onDelete }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const id = requestAnimationFrame(() => el.classList.add("shown"));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="env-open" ref={ref}>
      <button
        type="button"
        className="env-openhdr"
        style={{ background: cfg.bg, borderColor: cfg.line }}
        onClick={onClose}
        aria-expanded="true"
      >
        <span className="env-seal-sm" style={{ background: cfg.ink }}>
          <MoodMark
            label={entry.analysis?.label}
            size={17}
            stroke="rgba(255,253,246,0.95)"
            strokeWidth={1.7}
          />
        </span>
        <span className="env-openhdr-text">
          <span className="env-date">{dateLong}</span>
          {entry.title && <span className="env-title">{entry.title}</span>}
        </span>
        <span className="env-reseal" style={{ color: cfg.ink }}>reseal ✕</span>
      </button>

      <div className="env-letter">
        <ReadOnlyEntry entry={entry} onDelete={onDelete} hideTitle={!!entry.title} />
      </div>
    </div>
  );
}

// ── Closed envelope: triangular flap + wax seal + address ────────────────────
function EnvelopeEntry({ entry, defaultOpen, onDelete }) {
  const [open, setOpen] = useState(!!defaultOpen);

  const cfg = entry.analysis?.label
    ? (CLASS_CONFIG[entry.analysis.label] || CLASS_CONFIG.Normal)
    : CLASS_CONFIG.Normal;

  const dateLong = new Date(entry.createdAt).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

  if (open) {
    return (
      <div className="env open">
        <EnvelopeOpen
          entry={entry}
          cfg={cfg}
          dateLong={dateLong}
          onClose={() => setOpen(false)}
          onDelete={onDelete}
        />
      </div>
    );
  }

  return (
    <div className="env">
      <button
        type="button"
        className="env-lid"
        style={{ background: cfg.bg, borderColor: cfg.line }}
        onClick={() => setOpen(true)}
        aria-expanded="false"
      >
        <span className="env-flap" style={{ background: cfg.line, borderColor: cfg.line }} />
        <span className="env-seal" style={{ background: cfg.ink }}>
          <MoodMark
            label={entry.analysis?.label}
            size={20}
            stroke="rgba(255,253,246,0.95)"
            strokeWidth={1.7}
          />
        </span>
        <span className="env-addr">
          <span className="env-date">{dateLong}</span>
          {entry.title && <span className="env-title">{entry.title}</span>}
          <span className="env-hint" style={{ color: cfg.ink }}>
            a sealed letter — click to open
          </span>
        </span>
      </button>
    </div>
  );
}

// ── History page ──────────────────────────────────────────────────────────────
export default function History() {
  const [entries,     setEntries]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [selectedKey, setSelectedKey] = useState(null);
  const [month,       setMonth]       = useState(new Date());

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEntries(1, 200);
      const sorted = [...(data.entries || [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setEntries(sorted);
      if (sorted.length > 0) {
        const latest = sorted[0];
        setSelectedKey(ymd(latest.createdAt));
        const d = new Date(latest.createdAt);
        setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load entries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await deleteEntry(id);
      setEntries((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete entry");
    }
  };

  const dayEntries = useMemo(
    () => entries.filter((e) => ymd(e.createdAt) === selectedKey),
    [entries, selectedKey]
  );

  const selectedLong = dayEntries.length > 0
    ? new Date(dayEntries[0].createdAt).toLocaleDateString("en-GB", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : null;

  return (
    <div className="diary-spread">
      <div className="diary-history-head">
        <h1>The pages so far</h1>
        <div className="sub">
          {loading
            ? "loading…"
            : `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`}
        </div>
      </div>

      {error && (
        <div className="toast error" style={{ marginBottom: 24 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && entries.length > 0 && (
        <MoodCalendar
          entries={entries}
          selectedKey={selectedKey}
          onSelectDay={setSelectedKey}
          month={month}
          onMonthChange={setMonth}
        />
      )}

      {!loading && (
        dayEntries.length > 0 ? (
          <div className="cal-day-entries">
            <div className="cal-day-label">{selectedLong}</div>
            <div className="env-stack">
              {dayEntries.map((e, i) => (
                <EnvelopeEntry
                  key={e._id}
                  entry={e}
                  defaultOpen={i === 0}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="diary-empty-hint">
            {entries.length === 0
              ? "no entries yet. write your first one on the Journal page."
              : "select a highlighted day to read its pages."}
          </div>
        )
      )}
    </div>
  );
}
