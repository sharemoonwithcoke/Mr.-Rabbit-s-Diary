// Calendar History — a month grid where each day with an entry is tinted
// with that day's mood colour. Selecting a day reveals its entries below
// in the read-only diary spread.

function ymd(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function MoodCalendar({ entries, selectedKey, onSelectDay, month, onMonthChange }) {
  // Group entries by day-key
  const byDay = React.useMemo(() => {
    const m = {};
    for (const e of entries) {
      const k = ymd(e.createdAt);
      (m[k] = m[k] || []).push(e);
    }
    return m;
  }, [entries]);

  const year = month.getFullYear();
  const mon = month.getMonth();
  const monthLabel = month.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const first = new Date(year, mon, 1);
  const startWeekday = (first.getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, mon + 1, 0).getDate();

  const todayKey = ymd(new Date().toISOString());

  // Build cells (leading blanks + days)
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const dominantMood = (dayEntries) => {
    // most recent entry of the day defines the day's colour
    const sorted = [...dayEntries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sorted[0].analysis.label;
  };

  return (
    <div className="cal">
      <div className="cal-head">
        <button className="cal-nav" onClick={() => onMonthChange(new Date(year, mon - 1, 1))} aria-label="Previous month">‹</button>
        <div className="cal-title">{monthLabel}</div>
        <button className="cal-nav" onClick={() => onMonthChange(new Date(year, mon + 1, 1))} aria-label="Next month">›</button>
      </div>

      <div className="cal-grid cal-weekdays">
        {weekdays.map(w => <div className="cal-weekday" key={w}>{w}</div>)}
      </div>

      <div className="cal-grid">
        {cells.map((d, i) => {
          if (d === null) return <div className="cal-cell empty" key={"b" + i} />;
          const key = `${year}-${mon}-${d}`;
          const dayEntries = byDay[key];
          const has = !!dayEntries;
          const label = has ? dominantMood(dayEntries) : null;
          const cfg = label ? window.CLASS_CONFIG[label] : null;
          const isSelected = key === selectedKey;
          const isToday = key === todayKey;

          // distinct moods in the day → small dot row (max 3)
          const moods = has ? [...new Set(dayEntries.map(e => e.analysis.label))] : [];

          return (
            <button
              key={key}
              className={
                "cal-cell" +
                (has ? " has" : "") +
                (isSelected ? " selected" : "") +
                (isToday ? " today" : "")
              }
              style={has ? {
                background: cfg.bg,
                borderColor: isSelected ? cfg.ink : cfg.line,
                color: cfg.ink,
              } : undefined}
              onClick={() => has && onSelectDay(key)}
              disabled={!has}
            >
              <span className="cal-num">{d}</span>
              {has && (
                <span className="cal-dots">
                  {moods.slice(0, 3).map(m => (
                    <span key={m} className="cal-dot" style={{ background: window.CLASS_CONFIG[m].ink }} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="cal-legend">
        {window.LABELS.map(l => (
          <span className="cal-leg" key={l}>
            <span className="cal-leg-dot" style={{ background: window.CLASS_CONFIG[l].ink }} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

window.MoodCalendar = MoodCalendar;
window.ymd = ymd;
