// MindClassify — diary shell.
// Routes: journal (composer + current exchange) and history (the archive).
// Chat is no longer a top-level surface; it's the inline follow-up button.

function App() {
  const [route, setRoute] = React.useState("journal");
  const [entries, setEntries] = React.useState(window.SEED_ENTRIES);
  const [currentEntryId, setCurrentEntryId] = React.useState(null);

  const handleSave = ({ content, title }) => {
    const id = "e" + Date.now();
    const analysis = window.fakeClassify(content);
    const reply = window.FALLBACK_REPLIES[analysis.label] || window.FALLBACK_REPLIES.Normal;
    const entry = {
      _id: id, title, content, analysis, reply,
      followups: [],
      _freshAt: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setEntries(prev => [entry, ...prev]);
    setCurrentEntryId(id);
  };

  const handleFollowup = (entryId, text) => {
    const generic = window.FOLLOWUP_REPLIES_GENERIC;
    setEntries(prev => prev.map(e => {
      if (e._id !== entryId) return e;
      const followups = e.followups || [];
      const reply = generic[followups.length % generic.length];
      const next = {
        user: text, reply,
        at: new Date().toISOString(),
        _freshAt: Date.now(),
      };
      return { ...e, followups: [...followups, next] };
    }));
  };

  const currentEntry = entries.find(e => e._id === currentEntryId) || null;

  return (
    <div className="app">
      <Navbar route={route} onNavigate={setRoute} />
      <main data-screen-label={route === "journal" ? "Journal" : "History"}>
        {route === "journal" && (
          <window.DiaryJournal
            currentEntry={currentEntry}
            onSubmit={handleSave}
            onFollowup={handleFollowup}
          />
        )}
        {route === "history" && (
          <window.DiaryHistory entries={entries} />
        )}
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
