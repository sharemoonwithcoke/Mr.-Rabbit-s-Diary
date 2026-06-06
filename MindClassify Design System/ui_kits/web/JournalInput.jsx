function JournalInput({ onSubmit, loading }) {
  const [text, setText] = React.useState("");
  const [title, setTitle] = React.useState("");
  const charCount = text.length;
  const over = charCount > 10000;

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit({ content: text.trim(), title: title.trim() });
  };

  return (
    <form className="card" onSubmit={submit}>
      <div className="field">
        <label>Title <span className="opt">(optional)</span></label>
        <input
          className="input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give this entry a title…"
          maxLength={200}
        />
      </div>

      <div className="field">
        <label>How are you feeling today?</label>
        <textarea
          className={"textarea" + (over ? " over" : "")}
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write freely… describe your thoughts, feelings, or anything on your mind."
        />
        <div className={"field-meta" + (over ? " over" : "")}>{charCount.toLocaleString()} / 10,000</div>
      </div>

      <div className="btn-row">
        <p style={{ fontSize: 12, color: "var(--color-ink-3)", margin: 0 }}>
          Your entry will be classified into one of 7 mental health categories.
        </p>
        <button className="btn btn-primary" type="submit" disabled={!text.trim() || over || loading}>
          {loading ? (<><span className="spinner" /> Analysing…</>) : "Analyse & Save"}
        </button>
      </div>
    </form>
  );
}

window.JournalInput = JournalInput;
