// Diary spread — composer at the top (the focus), then the just-committed
// exchange unfolds beneath it. The diary's reply offers a small "follow up"
// affordance that opens an inline composer (the hidden chat).
//
// Two render modes:
//   - Journal: composer + the current (most recent) exchange below it
//   - History: read-only spread of all saved exchanges, no composer

function InkText({ text, baseDelay = 0, stagger = 55, instant = false }) {
  const words = React.useMemo(() => text.split(/(\s+)/), [text]);
  const refs = React.useRef({});

  React.useEffect(() => {
    if (instant) {
      // skip the reveal — settled history
      Object.values(refs.current).forEach(el => el && el.classList.add("shown"));
      return;
    }
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
  }, [text, instant]);

  return (
    <span>
      {words.map((w, i) =>
        /\s+/.test(w) ? (
          <span key={i}>{w}</span>
        ) : (
          <span
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            className="ink-word"
          >
            {w}
          </span>
        )
      )}
    </span>
  );
}

// --- One follow-up turn inside an entry ---
function Followup({ followup, animate }) {
  return (
    <div className="diary-followup">
      <div className="diary-followup-user">{followup.user}</div>
      <div className="diary-followup-reply">
        <InkText text={followup.reply} instant={!animate} baseDelay={500} stagger={95} />
      </div>
    </div>
  );
}

// --- Inline composer for the follow-up button ---
function FollowupComposer({ onSubmit, onCancel }) {
  const [text, setText] = React.useState("");
  const ref = React.useRef(null);

  React.useEffect(() => { if (ref.current) ref.current.focus(); }, []);

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSubmit(t);
  };

  const onKey = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); submit(); }
    if (e.key === "Escape") { onCancel(); }
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
        <button className="diary-submit" onClick={submit} disabled={!text.trim()}>commit</button>
      </div>
    </div>
  );
}

// --- One full entry: user words + ribbon + felt-marginalia + diary reply + follow-ups ---
function DiaryEntry({ entry, animate, onFollowup, readOnly, hideTitle }) {
  const [phase, setPhase] = React.useState(animate ? "submitting" : "settled");
  const [showFollowupForm, setShowFollowupForm] = React.useState(false);

  React.useEffect(() => {
    if (!animate) return;
    // give the ink time to seep before the diary stirs, then a long, held pause
    const t1 = setTimeout(() => setPhase("thinking"), 1700);
    const t2 = setTimeout(() => setPhase("replying"), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [animate]);

  const cfg = window.CLASS_CONFIG[entry.analysis.label];
  const showReply = phase === "replying" || phase === "settled";
  const replyInstant = phase === "settled" && !animate;
  // Note: once animate=true and we're in "replying", InkText mounts and animates.
  // Subsequent renders to phase="settled" don't re-mount InkText so it stays revealed.
  // For non-animated (history) entries, InkText mounts with instant=true.

  const ribbonStyle = phase === "submitting"
    ? { background: "var(--color-line)" }
    : { background: cfg.ink };

  const followups = entry.followups || [];

  return (
    <article className="diary-entry">
      <span className="diary-ribbon" style={ribbonStyle} title={entry.analysis.label} />

      <div className={"diary-bloom " + (phase === "submitting" ? "diary-bleed" : "")}>
        {entry.title && !hideTitle && <h2 className="diary-title-mine">{entry.title}</h2>}
        <div className="diary-mine">{entry.content}</div>
      </div>

      {phase !== "submitting" && (
        <div className="diary-felt" style={{ color: cfg.ink }}>
          felt as <em>{entry.analysis.label.toLowerCase()}</em>
          {entry.analysis.confidence != null && (
            <span style={{ opacity: 0.6 }}> · {(entry.analysis.confidence * 100).toFixed(0)}%</span>
          )}
        </div>
      )}

      {phase === "thinking" && (
        <div className="diary-pause">
          the diary considers
          <span className="diary-pause-dots"><span /><span /><span /></span>
        </div>
      )}

      {showReply && (
        <div className="diary-reply">
          <span className="diary-reply-mark">the diary replies</span>
          <InkText text={entry.reply} instant={replyInstant} stagger={105} />
          <div className="diary-reply-sign">
            — written for you, {window.formatDate(entry.createdAt)}
          </div>
          {entry.analysis.label === "Suicidal" && (
            <div className="diary-safety">
              If the weight ever becomes too heavy to carry alone, please reach out:
              call or text <strong>988</strong> (Suicide &amp; Crisis Lifeline).
            </div>
          )}

          {followups.length > 0 && (
            <div className="diary-followups">
              {followups.map((fu, i) => (
                <Followup
                  key={i}
                  followup={fu}
                  animate={!readOnly && !!fu._freshAt && Date.now() - fu._freshAt < 15000}
                />
              ))}
            </div>
          )}

          {!readOnly && onFollowup && (
            showFollowupForm ? (
              <FollowupComposer
                onSubmit={(text) => {
                  onFollowup(entry._id, text);
                  setShowFollowupForm(false);
                }}
                onCancel={() => setShowFollowupForm(false)}
              />
            ) : (
              <button
                className="diary-followup-btn"
                onClick={() => setShowFollowupForm(true)}
              >
                follow up
              </button>
            )
          )}
        </div>
      )}
    </article>
  );
}

// --- Top-of-page composer (the focus of the Journal route) ---
function DiaryComposer({ onSubmit }) {
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const ref = React.useRef(null);

  React.useEffect(() => { if (ref.current) ref.current.focus(); }, []);

  const submit = () => {
    if (!content.trim()) return;
    onSubmit({ title: title.trim(), content: content.trim() });
    setTitle("");
    setContent("");
    if (ref.current) { ref.current.style.height = "auto"; ref.current.focus(); }
  };

  const autoGrow = (e) => {
    setContent(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.max(110, e.target.scrollHeight) + "px";
  };

  const onKey = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); submit(); }
  };

  return (
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
        ref={ref}
        className="diary-composer-input"
        value={content}
        onChange={autoGrow}
        onKeyDown={onKey}
        placeholder="Today I felt…"
        rows={4}
      />
      <div className="diary-composer-foot">
        <span>press <kbd>⌘</kbd> + <kbd>Enter</kbd> to commit to the page</span>
        <button className="diary-submit" onClick={submit} disabled={!content.trim()}>
          commit
        </button>
      </div>
    </div>
  );
}

// --- Journal route: composer at top, current entry below ---
function DiaryJournal({ currentEntry, onSubmit, onFollowup }) {
  return (
    <div className="diary-spread">
      <div className="diary-date">{window.todayLong()}, 2026</div>

      <DiaryComposer onSubmit={onSubmit} />

      {currentEntry ? (
        <>
          <div className="diary-fleuron thin">·  ·  ·</div>
          <DiaryEntry
            entry={currentEntry}
            animate={!!currentEntry._freshAt && Date.now() - currentEntry._freshAt < 15000}
            onFollowup={onFollowup}
          />
        </>
      ) : (
        <div className="diary-empty-hint">
          your page is empty — write the first line above.
        </div>
      )}
    </div>
  );
}

// --- A day's entry presented as a sealed envelope you click to unseal ---
// --- A day's entry presented as a sealed envelope you click to unseal ---
function EnvelopeOpen({ entry, cfg, dateLong, onClose }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
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
          <window.MoodMark label={entry.analysis.label} size={17} stroke="rgba(255,253,246,0.95)" strokeWidth={1.7} />
        </span>
        <span className="env-openhdr-text">
          <span className="env-date">{dateLong}</span>
          {entry.title && <span className="env-title">{entry.title}</span>}
        </span>
        <span className="env-reseal" style={{ color: cfg.ink }}>reseal ✕</span>
      </button>
      <div className="env-letter">
        <DiaryEntry entry={entry} readOnly hideTitle />
      </div>
    </div>
  );
}

function EnvelopeEntry({ entry, defaultOpen }) {
  const [open, setOpen] = React.useState(!!defaultOpen);
  const cfg = window.CLASS_CONFIG[entry.analysis.label];
  const d = new Date(entry.createdAt);
  const dateLong = d.toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

  if (open) {
    return (
      <div className="env open">
        <EnvelopeOpen entry={entry} cfg={cfg} dateLong={dateLong} onClose={() => setOpen(false)} />
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
          <window.MoodMark label={entry.analysis.label} size={20} stroke="rgba(255,253,246,0.95)" strokeWidth={1.7} />
        </span>
        <span className="env-addr">
          <span className="env-date">{dateLong}</span>
          {entry.title && <span className="env-title">{entry.title}</span>}
          <span className="env-hint" style={{ color: cfg.ink }}>a sealed letter — click to open</span>
        </span>
      </button>
    </div>
  );
}

// --- History route: calendar + the selected day's entries below ---
function DiaryHistory({ entries }) {
  // sort newest first for "latest day" default
  const sorted = React.useMemo(
    () => [...entries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [entries]
  );

  const latestKey = sorted.length ? window.ymd(sorted[0].createdAt) : null;
  const [selectedKey, setSelectedKey] = React.useState(latestKey);
  const [month, setMonth] = React.useState(() => {
    const d = sorted.length ? new Date(sorted[0].createdAt) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // keep selection valid as entries change
  React.useEffect(() => {
    if (!selectedKey && latestKey) setSelectedKey(latestKey);
  }, [latestKey]);

  const dayEntries = sorted.filter(e => window.ymd(e.createdAt) === selectedKey);

  const selectedLong = selectedKey
    ? new Date(dayEntries[0]?.createdAt || Date.now()).toLocaleDateString("en-GB", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : null;

  return (
    <div className="diary-spread">
      <div className="diary-history-head">
        <h1>The pages so far</h1>
        <div className="sub">{entries.length} {entries.length === 1 ? "entry" : "entries"}</div>
      </div>

      <window.MoodCalendar
        entries={sorted}
        selectedKey={selectedKey}
        onSelectDay={setSelectedKey}
        month={month}
        onMonthChange={setMonth}
      />

      {dayEntries.length > 0 ? (
        <div className="cal-day-entries">
          <div className="cal-day-label">{selectedLong}</div>
          <div className="env-stack">
            {dayEntries.map((e, i) => (
              <EnvelopeEntry key={e._id} entry={e} defaultOpen={i === 0} />
            ))}
          </div>
        </div>
      ) : (
        <div className="diary-empty-hint">
          {entries.length === 0
            ? "no entries yet. write your first one on the Journal page."
            : "select a highlighted day to read its pages."}
        </div>
      )}
    </div>
  );
}

window.DiaryJournal = DiaryJournal;
window.DiaryHistory = DiaryHistory;

