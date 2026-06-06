const CLASS_CONFIG = {
  Normal:              { ink: "var(--color-normal-ink)",     bg: "var(--color-normal-bg)",     line: "var(--color-normal-line)",    icon: "😊" },
  Depression:          { ink: "var(--color-depression-ink)", bg: "var(--color-depression-bg)", line: "var(--color-depression-line)", icon: "💙" },
  Suicidal:            { ink: "var(--color-suicidal-ink)",   bg: "var(--color-suicidal-bg)",   line: "var(--color-suicidal-line)",   icon: "🆘" },
  Anxiety:             { ink: "var(--color-anxiety-ink)",    bg: "var(--color-anxiety-bg)",    line: "var(--color-anxiety-line)",    icon: "😰" },
  Stress:              { ink: "var(--color-stress-ink)",     bg: "var(--color-stress-bg)",     line: "var(--color-stress-line)",     icon: "😤" },
  Bipolar:             { ink: "var(--color-bipolar-ink)",    bg: "var(--color-bipolar-bg)",    line: "var(--color-bipolar-line)",    icon: "🔄" },
  "Personality Disorder": { ink: "var(--color-personality-ink)", bg: "var(--color-personality-bg)", line: "var(--color-personality-line)", icon: "🌀" },
};

const SAFE_RESOURCES = {
  Suicidal:            "If you're in crisis, please call or text 988 (Suicide & Crisis Lifeline).",
  Depression:          "Consider reaching out to a mental health professional or trusted person.",
  Anxiety:             "Breathing exercises and grounding techniques can help in the moment.",
  Stress:              "Try to identify one stressor you can address today, and rest if possible.",
  Bipolar:             "Maintaining a regular routine and consulting your care team is important.",
  "Personality Disorder": "Dialectical Behaviour Therapy (DBT) can be very effective — consider speaking with a therapist.",
};

export default function ResultCard({ result }) {
  if (!result) return null;

  const { label, confidence, probabilities, demo_mode } = result;
  const cfg = CLASS_CONFIG[label] || CLASS_CONFIG.Normal;
  const tip = SAFE_RESOURCES[label];
  const sorted = Object.entries(probabilities || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="result-card" style={{ borderColor: cfg.line }}>
      {demo_mode && (
        <div className="demo-banner">
          Demo mode — no trained model loaded. Predictions are illustrative only.
        </div>
      )}

      <div className="result-head">
        <div>
          <div className="result-eyebrow">Classification result</div>
          <div className="result-label" style={{ color: cfg.ink }}>
            <span aria-hidden="true">{cfg.icon}</span> {label}
          </div>
        </div>
        <div className="result-conf" style={{ color: cfg.ink }}>
          <div className="v">{(confidence * 100).toFixed(1)}%</div>
          <div className="l">confidence</div>
        </div>
      </div>

      {tip && (
        <div
          className="result-tip"
          style={{ background: cfg.bg, borderColor: cfg.line, color: cfg.ink }}
        >
          <b>Suggestion:</b> {tip}
        </div>
      )}

      <div className="result-bars-head">All class probabilities</div>
      {sorted.map(([cls, prob]) => {
        const c = CLASS_CONFIG[cls] || { ink: "var(--color-ink-3)" };
        return (
          <div className="bar-row" key={cls}>
            <span className="name">{cls}</span>
            <span className="track">
              <span
                className="fill"
                style={{ width: `${(prob * 100).toFixed(1)}%`, background: c.ink }}
              />
            </span>
            <span className="pct">{(prob * 100).toFixed(1)}%</span>
          </div>
        );
      })}

      <p className="disclaimer">
        This is a research tool, not a medical diagnosis. Please consult a qualified professional.
      </p>
    </div>
  );
}
