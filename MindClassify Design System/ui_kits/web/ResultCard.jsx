function ResultCard({ result }) {
  if (!result) return null;
  const { label, confidence, probabilities, demo_mode } = result;
  const cfg = window.CLASS_CONFIG[label] || window.CLASS_CONFIG.Normal;
  const tip = window.SAFE_RESOURCES[label];
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
        <div className="result-tip" style={{ background: cfg.bg, borderColor: cfg.line, color: cfg.ink }}>
          <b>Suggestion:</b> {tip}
        </div>
      )}

      <div className="result-bars-head">All class probabilities</div>
      {sorted.map(([cls, prob]) => {
        const c = window.CLASS_CONFIG[cls] || { ink: "var(--color-ink-3)" };
        return (
          <div className="bar-row" key={cls}>
            <span className="name">{cls}</span>
            <span className="track">
              <span className="fill" style={{ width: `${(prob * 100).toFixed(1)}%`, background: c.ink }} />
            </span>
            <span className="pct">{(prob * 100).toFixed(1)}%</span>
          </div>
        );
      })}

      <div className="disclaimer">This is a research tool, not a medical diagnosis. Please consult a qualified professional.</div>
    </div>
  );
}

window.ResultCard = ResultCard;
