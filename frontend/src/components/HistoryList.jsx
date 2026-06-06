import EntryCard from "./EntryCard";

export default function HistoryList({ entries, onDelete, loading }) {
  if (loading) {
    return (
      <div className="history-list">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="entry-card"
            style={{ opacity: 0.6, animation: "pulse 1.6s ease-in-out infinite" }}
          >
            <div style={{ height: 14, background: "var(--color-line)", borderRadius: 4, marginBottom: 10, width: "55%" }} />
            <div style={{ height: 11, background: "var(--color-line-soft)", borderRadius: 4, marginBottom: 6, width: "90%" }} />
            <div style={{ height: 11, background: "var(--color-line-soft)", borderRadius: 4, width: "72%" }} />
          </div>
        ))}
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="diary-empty-hint">
        no entries yet. write your first one on the Journal page.
      </div>
    );
  }

  return (
    <div className="history-list">
      {entries.map((entry) => (
        <EntryCard key={entry._id} entry={entry} onDelete={onDelete} />
      ))}
    </div>
  );
}
