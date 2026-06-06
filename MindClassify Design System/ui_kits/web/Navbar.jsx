function Navbar({ route, onNavigate }) {
  const Link = ({ id, label }) => (
    <button
      type="button"
      className={"nav-link" + (route === id ? " active" : "")}
      onClick={() => onNavigate(id)}
    >
      {label}
    </button>
  );

  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="brand">
          <span className="brand-word">MindClassify</span>
          <span className="brand-tag">NLP</span>
        </div>
        <div className="nav-links">
          <Link id="journal" label="Journal" />
          <Link id="history" label="History" />
        </div>
      </div>
    </nav>
  );
}

window.Navbar = Navbar;
