import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ConversationProvider } from "./context/ConversationContext";
import Home from "./pages/Home";
import History from "./pages/History";
import Chat from "./pages/Chat";
import Login from "./pages/Login";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="brand">
          <span className="brand-word">MindClassify</span>
          <span className="brand-tag">NLP</span>
        </div>
        {user && (
          <div className="nav-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            >
              Journal
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            >
              History
            </NavLink>
            <button className="nav-logout" onClick={logout} title="Sign out">
              {user.name || user.email.split("@")[0]}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ConversationProvider>
        <div className="app">
          <Navbar />
          <main>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={<PrivateRoute><Home /></PrivateRoute>}
              />
              <Route
                path="/history"
                element={<PrivateRoute><History /></PrivateRoute>}
              />
              <Route
                path="/chat"
                element={<PrivateRoute><Chat /></PrivateRoute>}
              />
            </Routes>
          </main>
        </div>
        </ConversationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
