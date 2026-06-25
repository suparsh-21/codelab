import { useLocation, Link } from "react-router-dom";

function Footer() {
  const location = useLocation();

  // don't show footer on auth pages or editor pages
  if (
    ["/login", "/register", "/forgot-password"].includes(location.pathname) ||
    location.pathname.startsWith("/editor")
  ) {
    return null;
  }

  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <Link to="/" className="footer-brand" aria-label="CodeLab home">
          <span className="footer-logo-icon" aria-hidden="true">
            <svg viewBox="0 0 28 28" fill="none">
              <path d="M10.2 8.4 4.8 14l5.4 5.6M17.8 8.4l5.4 5.6-5.4 5.6M16.1 5.8l-4.2 16.4" />
            </svg>
          </span>
          <span className="footer-brand-text">
            Code<span>Lab</span>
          </span>
        </Link>

        <div className="footer-contact">
          <svg className="footer-mail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5a2.25 2.25 0 0 0-2.25 2.25m19.5 0-8.953 5.468a1.5 1.5 0 0 1-1.594 0L2.25 6.75" />
          </svg>
          <span>If any queries contact</span>
          <a href="mailto:suparsh001@gmail.com" className="footer-email">
            suparsh001@gmail.com
          </a>
        </div>

        <div className="footer-bottom">
          <span className="footer-copyright">
            © {new Date().getFullYear()} CodeLab. All rights reserved.
          </span>
          <span className="footer-divider" aria-hidden="true">·</span>
          <span className="footer-tagline">Built with passion for developers</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
