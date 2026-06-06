const LABELS = [
  "Normal", "Depression", "Suicidal", "Anxiety",
  "Stress", "Bipolar", "Personality Disorder",
];

const COLORS = {
  Normal:              "var(--color-normal-ink)",
  Depression:          "var(--color-depression-ink)",
  Suicidal:            "var(--color-suicidal-ink)",
  Anxiety:             "var(--color-anxiety-ink)",
  Stress:              "var(--color-stress-ink)",
  Bipolar:             "var(--color-bipolar-ink)",
  "Personality Disorder": "var(--color-personality-ink)",
};

export default function MoodChart({ entries }) {
  if (!entries || entries.length < 2) return null;

  // Group by day
  const byDate = {};
  for (const e of entries) {
    if (!e.analysis?.label) continue;
    const d = new Date(e.createdAt).toLocaleDateString("en-GB", {
      day: "numeric", month: "short",
    });
    if (!byDate[d]) {
      byDate[d] = { date: d, total: 0 };
      LABELS.forEach((l) => { byDate[d][l] = 0; });
    }
    byDate[d][e.analysis.label] += 1;
    byDate[d].total += 1;
  }

  const days = Object.values(byDate).reverse();
  const maxTotal = Math.max(1, ...days.map((d) => d.total));
  const usedLabels = LABELS.filter((l) => days.some((d) => d[l] > 0));

  return (
    <div className="card mood-chart" style={{ marginBottom: 20 }}>
      <h3>Mood trend</h3>
      <div className="bars-stack">
        {days.map((d) => (
          <div className="day" key={d.date}>
            <div
              className="col"
              style={{ height: `${(d.total / maxTotal) * 100}%` }}
            >
              {usedLabels.map((label) =>
                d[label] > 0 ? (
                  <div
                    key={label}
                    className="seg"
                    style={{ flex: d[label], background: COLORS[label] }}
                    title={`${label}: ${d[label]}`}
                  />
                ) : null
              )}
            </div>
            <div className="date">{d.date}</div>
          </div>
        ))}
      </div>
      <div className="mood-legend">
        {usedLabels.map((label) => (
          <span className="leg" key={label}>
            <span className="dot" style={{ background: COLORS[label] }} /> {label}
          </span>
        ))}
      </div>
    </div>
  );
}
