function CompanionCard({ response, loading }) {
  if (!loading && !response) return null;

  return (
    <div className="companion">
      <div className="companion-head">
        <span className="q" aria-hidden="true">🪶</span>
        <span className="companion-eyebrow">Your diary replies</span>
      </div>
      <div className="companion-div" />
      {loading ? (
        <div className="companion-skeleton">
          <div className="skel" /><div className="skel" /><div className="skel" />
        </div>
      ) : (
        <p className="companion-text">{response}</p>
      )}
      {!loading && (
        <div className="companion-sign">— written for you, {window.todayLong()}</div>
      )}
    </div>
  );
}

window.CompanionCard = CompanionCard;
