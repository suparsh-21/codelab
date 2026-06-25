function Contact() {
  return (
    <div className="dash-page dot-bg">
      <div className="dash-container">
        {/* header */}
        <div className="dashboard-hero animate-fade-in">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            Get in touch
          </span>
          <h1>
            Contact <span className="hero-highlight">Us.</span>
          </h1>
          <p>
            Have questions, feedback, or need help? We'd love to hear from you.
            Reach out through any of the channels below.
          </p>
        </div>

        {/* contact cards */}
        <div className="contact-grid animate-fade-in" style={{ animationDelay: "0.08s", maxWidth: "48rem" }}>
          {/* email card */}
          <a
            href="mailto:suparsh001@gmail.com"
            className="glass-card glass-card-hover contact-card"
          >
            <div className="contact-card-icon contact-card-icon-email">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5a2.25 2.25 0 0 0-2.25 2.25m19.5 0-8.953 5.468a1.5 1.5 0 0 1-1.594 0L2.25 6.75" />
              </svg>
            </div>
            <h3 className="contact-card-title">Email Us</h3>
            <p className="contact-card-desc">
              Drop us an email for any questions, feature requests, or bug reports.
            </p>
            <span className="contact-card-value">suparsh001@gmail.com</span>
            <span className="contact-card-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </a>

          {/* response time card */}
          <div className="glass-card contact-card contact-card-info">
            <div className="contact-card-icon contact-card-icon-clock">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h3 className="contact-card-title">Response Time</h3>
            <p className="contact-card-desc">
              We typically respond within 24 hours. For urgent issues, please
              mark your subject line accordingly.
            </p>
            <span className="contact-card-badge">
              <span className="contact-badge-dot" />
              Usually within 24h
            </span>
          </div>


        </div>
      </div>
    </div>
  );
}

export default Contact;
