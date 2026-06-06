import { useMemo } from "react";

export const CLASS_CONFIG = {
  Normal:              { ink: "var(--color-normal-ink)",     bg: "var(--color-normal-bg)",     line: "var(--color-normal-line)" },
  Depression:          { ink: "var(--color-depression-ink)", bg: "var(--color-depression-bg)", line: "var(--color-depression-line)" },
  Suicidal:            { ink: "var(--color-suicidal-ink)",   bg: "var(--color-suicidal-bg)",   line: "var(--color-suicidal-line)" },
  Anxiety:             { ink: "var(--color-anxiety-ink)",    bg: "var(--color-anxiety-bg)",    line: "var(--color-anxiety-line)" },
  Stress:              { ink: "var(--color-stress-ink)",     bg: "var(--color-stress-bg)",     line: "var(--color-stress-line)" },
  Bipolar:             { ink: "var(--color-bipolar-ink)",    bg: "var(--color-bipolar-bg)",    line: "var(--color-bipolar-line)" },
  "Personality Disorder": { ink: "var(--color-personality-ink)", bg: "var(--color-personality-bg)", line: "var(--color-personality-line)" },
};

export const LABELS = [
  "Normal", "Depression", "Suicidal", "Anxiety",
  "Stress", "Bipolar", "Personality Disorder",
];

// Build a stable day key from an ISO date string (year-month-day, no padding)
export function ymd(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function MoodCalendar({ entries, selectedKey, onSelectDay, month, onMonthChange }) {
  const byDay = useMemo(() => {
    const m = {};
    for (const e of entries) {
      const k = ymd(e.createdAt);
      (m[k] = m[k] || []).push(e);
    }
    return m;
  }, [entries]);

  const year  = month.getFullYear();
  const mon   = month.getMonth();
  const label = month.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  // First cell offset — Mon=0
  const startWeekday  = (new Date(year, mon, 1).getDay() + 6) % 7;
  const daysInMonth   = new Date(year, mon + 1, 0).getDate();
  const todayKey      = ymd(new Date().toISOString());

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="cal">
      {/* Month navigation */}
      <div className="cal-head">
        <button
          className="cal-nav"
          onClick={() => onMonthChange(new Date(year, mon - 1, 1))}
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="cal-title">{label}</div>
        <button
          className="cal-nav"
          onClick={() => onMonthChange(new Date(year, mon + 1, 1))}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Weekday headers */}
      <div className="cal-grid cal-weekdays">
        {WEEKDAYS.map((w) => (
          <div className="cal-weekday" key={w}>{w}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="cal-grid">
        {cells.map((d, i) => {
          if (d === null) return <div className="cal-cell empty" key={"b" + i} />;

          const key        = `${year}-${mon}-${d}`;
          const dayEntries = byDay[key];
          const has        = !!dayEntries;

          const dominantLabel = has
            ? [...dayEntries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
                .analysis?.label
            : null;
          const cfg        = dominantLabel ? (CLASS_CONFIG[dominantLabel] || null) : null;
          const isSelected = key === selectedKey;
          const isToday    = key === todayKey;
          const moods      = has
            ? [...new Set(dayEntries.map((e) => e.analysis?.label).filter(Boolean))]
            : [];

          return (
            <button
              key={key}
              className={
                "cal-cell" +
                (has ? " has" : "") +
                (isSelected ? " selected" : "") +
                (isToday ? " today" : "")
              }
              style={
                has && cfg
                  ? {
                      background:  cfg.bg,
                      borderColor: isSelected ? cfg.ink : cfg.line,
                      color:       cfg.ink,
                    }
                  : undefined
              }
              onClick={() => has && onSelectDay(key)}
              disabled={!has}
            >
              <span className="cal-num">{d}</span>
              {has && (
                <span className="cal-dots">
                  {moods.slice(0, 3).map((m) => {
                    const mc = CLASS_CONFIG[m];
                    return mc ? (
                      <span key={m} className="cal-dot" style={{ background: mc.ink }} />
                    ) : null;
                  })}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="cal-legend">
        {LABELS.map((l) => {
          const lc = CLASS_CONFIG[l];
          return (
            <span className="cal-leg" key={l}>
              <span className="cal-leg-dot" style={{ background: lc.ink }} />
              {l}
            </span>
          );
        })}
      </div>
    </div>
  );
}
