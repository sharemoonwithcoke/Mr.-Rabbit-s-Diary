// Open-ended chat with the diary companion.
// "Claude" is faked client-side: picks a fallback reply based on light keyword match.

function Chat() {
  const WELCOME = {
    role: "assistant",
    content: "Hi, I'm your diary companion. You can talk to me about anything on your mind — I'm here to listen without judgement. What would you like to share today?",
  };

  const [messages, setMessages] = React.useState([WELCOME]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const bottomRef = React.useRef(null);

  React.useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollTop = bottomRef.current.scrollHeight;
  }, [messages, loading]);

  const send = () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      const analysis = window.fakeClassify(text);
      const reply = window.FALLBACK_REPLIES[analysis.label] || window.FALLBACK_REPLIES.Normal;
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      setLoading(false);
    }, 1400);
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clear = () => setMessages([WELCOME]);

  return (
    <>
      <div className="page-header split">
        <div>
          <h1>Talk to your diary</h1>
          <div className="sub">A private space to explore your thoughts — Claude listens and replies.</div>
        </div>
        <button className="btn btn-ghost" onClick={clear}>New chat</button>
      </div>

      <div className="chat-wrap">
        <div className="chat-thread" ref={bottomRef}>
          {messages.map((m, i) => (
            <div className={"chat-row" + (m.role === "user" ? " user" : "")} key={i}>
              {m.role !== "user" && <div className="chat-avatar" aria-hidden="true">🪶</div>}
              <div className={"chat-bubble " + (m.role === "user" ? "user" : "bot")}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-row">
              <div className="chat-avatar" aria-hidden="true">🪶</div>
              <div className="chat-typing"><span /><span /><span /></div>
            </div>
          )}
        </div>

        <div className="chat-input">
          <textarea
            className="textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
            rows={2}
            disabled={loading}
          />
          <button className="btn btn-primary chat-send" onClick={send} disabled={!input.trim() || loading}>
            Send
          </button>
        </div>

        <div className="chat-footnote">
          Not a substitute for professional mental health support. In crisis? Call or text <strong>988</strong>.
        </div>
      </div>
    </>
  );
}

window.Chat = Chat;
