function EntryCard({ entry, onDelete }) {
  const label = entry.analysis?.label;
  const cfg = label ? window.CLASS_CONFIG[label] : null;

  return (
    <article className="entry-card">
      <div className="entry-row">
        <div style={{ flex: 1, minWidth: 0 }}>
          {entry.title && <h3 className="title">{entry.title}</h3>}
          <p className="preview">{entry.content}</p>
        </div>
        <div className="entry-right">
          {cfg ? (
            <span className="chip" style={{ background: cfg.bg, borderColor: cfg.line, color: cfg.ink }}>
              <span aria-hidden="true">{cfg.icon}</span> {label}
            </span>
          ) : (
            <span className="chip" style={{ background: "var(--color-paper-deep)", borderColor: "var(--color-line)", color: "var(--color-ink-3)" }}>
              📝 No analysis
            </span>
          )}
          {entry.analysis?.confidence != null && (
            <span style={{ fontSize: 11, color: "var(--color-ink-3)" }}>
              {(entry.analysis.confidence * 100).toFixed(0)}% conf.
            </span>
          )}
        </div>
      </div>
      <div className="entry-footer">
        <span>{window.formatDate(entry.createdAt)} · {window.formatTime(entry.createdAt)}</span>
        {onDelete && (
          <button className="entry-delete" onClick={() => onDelete(entry._id)}>Delete</button>
        )}
      </div>
    </article>
  );
}

window.EntryCard = EntryCard;
