import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import BrandMark from "./BrandMark";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // dont show navbar on auth pages or editor pages
  if (
    ["/login", "/register", "/forgot-password"].includes(location.pathname) ||
    location.pathname.startsWith("/editor")
  ) {
    return null;
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="app-navbar">
      <div className="app-navbar-inner">
        <BrandMark />

        {/* center nav links */}
        <div className="navbar-links">
          <Link
            to="/dashboard"
            className={`nav-link ${isActive("/dashboard") ? "nav-link-active" : ""}`}
          >
            <svg className="nav-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span>Home</span>
            {isActive("/dashboard") && <span className="nav-link-indicator" />}
          </Link>

          <Link
            to="/contact"
            className={`nav-link ${isActive("/contact") ? "nav-link-active" : ""}`}
          >
            <svg className="nav-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5a2.25 2.25 0 0 0-2.25 2.25m19.5 0-8.953 5.468a1.5 1.5 0 0 1-1.594 0L2.25 6.75" />
            </svg>
            <span>Contact</span>
            {isActive("/contact") && <span className="nav-link-indicator" />}
          </Link>

          <Link
            to="/profile"
            className={`nav-link ${isActive("/profile") ? "nav-link-active" : ""}`}
          >
            <svg className="nav-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.118a7.5 7.5 0 0 1 15 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.5-1.632Z" />
            </svg>
            <span>Profile</span>
            {isActive("/profile") && <span className="nav-link-indicator" />}
          </Link>
        </div>

        <div className="navbar-actions">
          {user && (
            <>
              <div className="user-pill">
                <div className="status-dot"></div>
                <span>{user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="logout-button"
                aria-label="Log out"
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                </svg>
                <span>Log out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
