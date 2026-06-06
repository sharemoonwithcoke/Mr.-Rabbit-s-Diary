const CLASS_CONFIG = {
  Normal:              { ink: "var(--color-normal-ink)",     bg: "var(--color-normal-bg)",     line: "var(--color-normal-line)",    icon: "😊" },
  Depression:          { ink: "var(--color-depression-ink)", bg: "var(--color-depression-bg)", line: "var(--color-depression-line)", icon: "💙" },
  Suicidal:            { ink: "var(--color-suicidal-ink)",   bg: "var(--color-suicidal-bg)",   line: "var(--color-suicidal-line)",   icon: "🆘" },
  Anxiety:             { ink: "var(--color-anxiety-ink)",    bg: "var(--color-anxiety-bg)",    line: "var(--color-anxiety-line)",    icon: "😰" },
  Stress:              { ink: "var(--color-stress-ink)",     bg: "var(--color-stress-bg)",     line: "var(--color-stress-line)",     icon: "😤" },
  Bipolar:             { ink: "var(--color-bipolar-ink)",    bg: "var(--color-bipolar-bg)",    line: "var(--color-bipolar-line)",    icon: "🔄" },
  "Personality Disorder": { ink: "var(--color-personality-ink)", bg: "var(--color-personality-bg)", line: "var(--color-personality-line)", icon: "🌀" },
};

export default function EntryCard({ entry, onDelete }) {
  const label = entry.analysis?.label;
  const cfg = label ? (CLASS_CONFIG[label] || null) : null;
  const confidence = entry.analysis?.confidence;

  const date = new Date(entry.createdAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
  const time = new Date(entry.createdAt).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <article className="entry-card">
      <div className="entry-row">
        <div style={{ flex: 1, minWidth: 0 }}>
          {entry.title && <h3 className="title">{entry.title}</h3>}
          <p className="preview">{entry.content || entry.preview}</p>
        </div>
        <div className="entry-right">
          {cfg ? (
            <span
              className="chip"
              style={{ background: cfg.bg, borderColor: cfg.line, color: cfg.ink }}
            >
              <span aria-hidden="true">{cfg.icon}</span> {label}
            </span>
          ) : (
            <span
              className="chip"
              style={{
                background: "var(--color-paper-deep)",
                borderColor: "var(--color-line)",
                color: "var(--color-ink-3)",
              }}
            >
              📝 No analysis
            </span>
          )}
          {confidence != null && (
            <span style={{ fontSize: 11, color: "var(--color-ink-3)" }}>
              {(confidence * 100).toFixed(0)}% conf.
            </span>
          )}
        </div>
      </div>

      <div className="entry-footer">
        <span>{date} · {time}</span>
        {onDelete && (
          <button className="entry-delete" onClick={() => onDelete(entry._id)}>
            Delete
          </button>
        )}
      </div>
    </article>
  );
}
