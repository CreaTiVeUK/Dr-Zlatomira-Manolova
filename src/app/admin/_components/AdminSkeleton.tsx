export function AdminPageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="admin-page" aria-busy="true" aria-live="polite">
      <div className="admin-page-header">
        <div className="admin-page-header__copy">
          <span className="admin-skeleton admin-skeleton--text" style={{ width: "10rem" }} />
          <div style={{ height: "0.5rem" }} />
          <span className="admin-skeleton admin-skeleton--heading" />
          <div style={{ height: "0.5rem" }} />
          <span className="admin-skeleton admin-skeleton--text" style={{ width: "22rem", maxWidth: "70%" }} />
        </div>
      </div>

      <div className="admin-skeleton-grid">
        <span className="admin-skeleton admin-skeleton--block" />
        <span className="admin-skeleton admin-skeleton--block" />
        <span className="admin-skeleton admin-skeleton--block" />
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        {Array.from({ length: rows }).map((_, i) => (
          <span key={i} className="admin-skeleton admin-skeleton--row" />
        ))}
      </div>
    </div>
  );
}
