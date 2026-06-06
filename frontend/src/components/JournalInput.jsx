import { useState } from "react";

export default function JournalInput({ onSubmit, loading }) {
  const [text, setText]   = useState("");
  const [title, setTitle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit({ content: text.trim(), title: title.trim() });
  };

  const charCount   = text.length;
  const isOverLimit = charCount > 10000;

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-ink-3 mb-1.5">
          Title <span className="normal-case tracking-normal font-normal text-ink-4">(optional)</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give this entry a title…"
          className="w-full rounded-ds-sm border border-line bg-paper-warm px-4 py-2.5 text-sm text-ink placeholder-ink-4 focus:outline-none focus:ring-2 focus:ring-honey/40 focus:border-honey transition-colors duration-150"
          maxLength={200}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-ink-3 mb-1.5">
          How are you feeling today?
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write freely… describe your thoughts, feelings, or anything on your mind."
          rows={6}
          className={`w-full rounded-ds-sm border px-4 py-3 text-sm text-ink placeholder-ink-4 focus:outline-none focus:ring-2 focus:ring-honey/40 resize-none transition-colors duration-150 bg-paper-warm leading-relaxed ${
            isOverLimit ? "border-suicidal-line focus:border-suicidal-ink" : "border-line focus:border-honey"
          }`}
        />
        <div className={`text-right text-xs mt-1 ${isOverLimit ? "text-suicidal-ink" : "text-ink-4"}`}>
          {charCount.toLocaleString()} / 10,000
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-4">
          Your entry will be classified into one of 7 mental health categories.
        </p>
        <button
          type="submit"
          disabled={!text.trim() || isOverLimit || loading}
          className="btn-primary"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Analysing…
            </span>
          ) : (
            "Analyse & Save"
          )}
        </button>
      </div>
    </form>
  );
}
