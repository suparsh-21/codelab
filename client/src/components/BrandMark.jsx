import { Link } from "react-router-dom";

function BrandMark({ to = "/", compact = false }) {
  const content = (
    <>
      <span className="brand-symbol" aria-hidden="true">
        <svg viewBox="0 0 28 28" fill="none">
          <path d="M10.2 8.4 4.8 14l5.4 5.6M17.8 8.4l5.4 5.6-5.4 5.6M16.1 5.8l-4.2 16.4" />
        </svg>
        <span className="brand-spark" />
      </span>
      {!compact && (
        <span className="brand-wordmark">
          Code<span>Lab</span>
        </span>
      )}
    </>
  );

  if (!to) {
    return <div className="brand-mark">{content}</div>;
  }

  return (
    <Link to={to} className="brand-mark" aria-label="CodeLab home">
      {content}
    </Link>
  );
}

export default BrandMark;
